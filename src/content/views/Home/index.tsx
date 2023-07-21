import s from './style.module.css'
import { useEffect, useState } from 'react'
// import { PlusOutlined } from '@ant-design/icons'
import { Modal, Upload, Select, Input, Table, notification } from 'antd'
import ReactJson from 'react-json-view'
import type { RcFile, UploadProps } from 'antd/es/upload'
import type { UploadFile } from 'antd/es/upload/interface'
import { getCodeList } from 'country-list'
import common from '@/utils/common'
import { ExclamationCircleOutlined, FullscreenExitOutlined, FullscreenOutlined } from '@ant-design/icons'
const { TextArea } = Input
const { Column } = Table
const zIndex = 99999999999

const getBase64 = (file: RcFile): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = (error) => reject(error)
  })

const countries = getCodeList()
const countryOptions = Object.keys(countries).map((key) => ({
  value: key,
  label: countries[key]
}))

const categoryOptions = [
  {
    value: 'Legal Identity',
    label: 'Legal Identity'
  },
  {
    value: 'Financial',
    label: 'Financial'
  },
  {
    value: 'Social',
    label: 'Social'
  },
  {
    value: 'Educational',
    label: 'Educational'
  },
  {
    value: 'Skills',
    label: 'Skills'
  },
  {
    value: 'On-chain Activities',
    label: 'On-chain Activities'
  }
]

interface XHRReq {
  request: any
  response: any
}

const uploadButton = (
  <div>
    {/*<PlusOutlined />*/}
    <div style={{ marginTop: 8, color: '#fff' }}>Upload</div>
  </div>
)

function Home() {
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewImage, setPreviewImage] = useState('')
  const [previewTitle, setPreviewTitle] = useState('')
  const [fileList, setFileList] = useState<UploadFile[]>([])
  const [selectedCountry, setSelectedCountry] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [discord, setDiscord] = useState('')
  const [describe, setDescribe] = useState('')
  const [XHRList, setXHRList] = useState<XHRReq[]>([])
  const [isSpread, setIsSpread] = useState<Boolean>(true)
  const [api, contextHolder] = notification.useNotification()

  // const [responseData, setResponseData] = useState({})
  // const [method, setMethod] = useState('')

  const handleCancel = () => setPreviewOpen(false)
  const handlePreview = async (file: UploadFile) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj as RcFile)
    }

    setPreviewImage(file.url || (file.preview as string))
    setPreviewOpen(true)
    setPreviewTitle(
      file.name || file.url!.substring(file.url!.lastIndexOf('/') + 1)
    )
  }

  const uploadRequest: UploadProps['customRequest'] = async (options) => {
    let upFile = options.file as File
    let fdata = await common.file2DataURL(upFile)
    chrome.runtime
      .sendMessage({
        method: 'UPLOAD',
        doc: {
          uid: (upFile as any).uid,
          name: upFile.name,
          type: upFile.type,
          data: fdata
        }
      })
      .then((resp) => {
        if (options.onSuccess) {
          options.onSuccess(resp)
        }
      })
      .catch(options.onError)
  }

  const handleUpload: UploadProps['onChange'] = ({ file, fileList }) => {
    if (file.status === 'uploading') {
      setFileList(fileList)
    } else if (file.status === 'done') {
      file.url = file.response.info.url
      setFileList(fileList)
    } else if (file.status === 'removed') {
      setFileList(fileList)
    }
  }

  const handleSubmit = () => {
    chrome.runtime
      .sendMessage({
        method: 'SUBMIT',
        doc: {
          domain: window.location.host,
          files: fileList.map((f) => f.response.info.url),
          country: selectedCountry,
          category: selectedCategory,
          discord,
          describe,
          requests: XHRList
        }
      })
      .then((resp) => {
        if (resp?.errno == 0) {
          window.close()
        } else {
          api.error({
            message: `${resp?.msg || 'Internal error'}`
          })
        }
        console.log(resp)
      })
      .catch((err) => {
        api.error({
          message: `${err?.message || 'Internal error'}`
        })
        console.error(err)
      })
  }

  useEffect(() => {
    chrome.runtime
      .sendMessage({
        method: 'GETXHRJSON'
      })
      .then((resp) => {
        setXHRList([...resp])
      })
      .catch((err) => {
        console.log(err)
      })
    chrome.runtime.onMessage.addListener(function (request) {
      if (request.method === 'XHRJSON') {
        setXHRList([...request.doc])
      }
    })
  }, [])

  function handleSpread() {
    setIsSpread(!isSpread)
  }

  return (
    <div>
      <div
        className={isSpread ? s.zkpass_spread_btn : s.zkpass_hidden_btn}
        onClick={handleSpread}
      >
        {isSpread ? (
          <FullscreenExitOutlined style={{ color: '#fff' }} />
        ) : (
          <FullscreenOutlined style={{ color: '#fff' }} />
        )}
      </div>
      <div className={isSpread ? s.zkpass_container : s.zkpass_hidden}>
      {contextHolder}
      <div className={s.zkpass_uploadimg}>
        <Upload
          listType="picture-card"
          fileList={fileList}
          onPreview={handlePreview}
          onChange={handleUpload}
          customRequest={uploadRequest}
        >
          {fileList.length >= 6 ? null : uploadButton}
        </Upload>
      </div>
      <div className={s.zkpass_option_box}>
        <div className={s.zkpass_option}>
          <div className={s.zkpass_option_label}>Country:</div>
          <Select
            placeholder="Country"
            value={selectedCountry}
            onChange={setSelectedCountry}
            dropdownStyle={{ zIndex }}
            style={{ flex: 1 }}
            options={countryOptions}
            allowClear={true}
          />
        </div>
        <div className={s.zkpass_option}>
          <div className={s.zkpass_option_label}>Category:</div>
          <Select
            placeholder="Category"
            value={selectedCategory}
            onChange={setSelectedCategory}
            dropdownStyle={{ zIndex }}
            style={{ flex: 1 }}
            options={categoryOptions}
            allowClear={true}
          />
        </div>
      </div>
      <div className={s.zkpass_option_box}>
        <div className={s.zkpass_option_label}>Discord</div>
        <Input
          style={{ flex: 1 }}
          value={discord}
          onChange={(e) => {
            setDiscord(e.target.value)
          }}
        />
      </div>
      <div className={s.zkpass_describe}>
        <div style={{ color: '#fff' }}>describe(option)</div>
        <TextArea
          rows={4}
          placeholder="describe"
          maxLength={200}
          value={describe}
          onChange={(e) => {
            setDescribe(e.target.value)
          }}
        />
      </div>
      <div className={s.zkpass_data}>
        <div style={{ color: '#fff' }}>Network</div>
        <Table
          dataSource={XHRList}
          size="small"
          bordered={true}
          pagination={false}
          scroll={{ y: '15rem' }}
        >
          <Column
            title="Name"
            dataIndex="request"
            key="name"
            render={(request: any) => (
              <div>{request.url.replace(/^.*\/\/[^\/]+/, '')}</div>
            )}
            ellipsis={true}
            width={250}
          />
          <Column
            title="Method"
            dataIndex="request"
            key="method"
            render={(request: any) => <div>{request.method}</div>}
            width={80}
          />
          <Column
            title="Content"
            dataIndex="response"
            key="response"
            render={(response: any) => (
              <ReactJson src={response} collapsed={true} />
            )}
          />
        </Table>
        {/*<div className="zkpass-data-body">*/}
        {/*  <div>*/}
        {/*    {XHRList.map((item) => {*/}
        {/*      return (*/}
        {/*        <div*/}
        {/*          onClick={() => {*/}
        {/*            setMethod(item.request.method)*/}
        {/*            setResponseData(item.response)*/}
        {/*          }}*/}
        {/*        >*/}
        {/*          {item.request.url.replace(/^.*\/\/[^\/]+/, '')}*/}
        {/*        </div>*/}
        {/*      )*/}
        {/*    })}*/}
        {/*  </div>*/}
        {/*  <div>*/}
        {/*    <div>{method}</div>*/}
        {/*    <ReactJson src={responseData} />*/}
        {/*  </div>*/}
        {/*</div>*/}
      </div>
      <div className={s.zkpass_footer}>
        <button
          className={s.zkpass_submit_btn}
          onClick={() => {
            Modal.confirm({
              title: 'Confirm',
              icon: <ExclamationCircleOutlined />,
              content: 'Confirm to submit?',
              okText: 'Yes',
              cancelText: 'No',
              onOk: handleSubmit 
            })
          }}
        >
          Submit
        </button>
      </div>
      </div>
      <Modal
        open={previewOpen}
        title={previewTitle}
        footer={null}
        onCancel={handleCancel}
      >
        <img alt="example" style={{ width: '100%' }} src={previewImage} />
      </Modal>
    </div>
  )
}

export default Home
