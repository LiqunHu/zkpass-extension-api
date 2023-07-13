const file2DataURL = async function (file: File) {
  return new Promise(function (resolve, reject) {
    let reader = new FileReader()

    reader.onloadend = () => {
      resolve(reader.result)
    }
    reader.onerror = (err) => {
      reject(err)
    }
    reader.readAsDataURL(file as File)
  })
}

const dataURL2File = function (dataurl: string, filename: string) {
  let arr = dataurl.split(','),
    mime = arr[0].match(/:(.*?);/)[1],
    bstr = atob(arr[arr.length - 1]),
    n = bstr.length,
    u8arr = new Uint8Array(n)
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n)
  }
  return new File([u8arr], filename, { type: mime })
}

const exportFunc = { file2DataURL, dataURL2File }

export default exportFunc
