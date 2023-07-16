import common from '@/utils/common'

const debug_version = '1.0'
let tabs: { [index: number]: any } = {}
const api = 'http://3.1.50.253/v1'
// const api = 'http://127.0.0.1:9090'

/**
 * receive content message and new a tab
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request) {
    if (request.method == 'POPUP') {
      console.log('chrome.runtime.onMessage POPUP')

      chrome.tabs.create(
        {
          url: request.url
        },
        (tab: any) => {
          tabs[tab.id] = {
            token: request.token,
            windowId: tab.windowId,
            requests: new Map(),
            xhrjson: []
          }

          function allEventHandler(debuggeeId: any, message: any, params: any) {
            if (!tabs[debuggeeId.tabId]) {
              return
            }

            if (message == 'Network.requestWillBeSent') {
              if (params.request) {
                const detail = new Map()
                detail.set('request', params.request)
                tabs[debuggeeId.tabId].requests.set(params.requestId, detail)
              }
            }

            // get response data
            if (message == 'Network.responseReceived') {
              if (params.response) {
                const request = tabs[debuggeeId.tabId].requests.get(
                  params.requestId
                )
                if (request === undefined) {
                  // console.log(params.requestId, '#not found request')
                  return
                }
                let content =
                  params.response.headers['Content-Type'] ||
                  params.response.headers['content-type']
                if (content) {
                  if (content.indexOf('application/json') >= 0) {
                    request.set('response', params.response)
                    tabs[debuggeeId.tabId].requests.set(
                      params.requestId,
                      request
                    )
                    return
                  }
                }
                tabs[debuggeeId.tabId].requests.delete(params.requestId)
              }
            }

            if (message == 'Network.loadingFinished') {
              const request = tabs[debuggeeId.tabId].requests.get(
                params.requestId
              )
              if (request === undefined) {
                // console.log(params.requestId, '#not found request')
                return
              }

              chrome.debugger.sendCommand(
                {
                  tabId: debuggeeId.tabId
                },
                'Network.getResponseBody',
                {
                  requestId: params.requestId
                },
                function (response) {
                  if (response) {
                    request.set('response_body', response)
                    tabs[debuggeeId.tabId].requests.set(
                      params.requestId,
                      request
                    )
                    let req = request.get('request')
                    let body = request.get('response_body').body
                    if (req && body) {
                      tabs[debuggeeId.tabId].xhrjson.push({
                        request: req,
                        response: JSON.parse(body)
                      })
                      chrome.tabs
                        .sendMessage(debuggeeId.tabId, {
                          method: 'XHRJSON',
                          doc: tabs[debuggeeId.tabId].xhrjson
                        })
                        .catch((err) => {
                          console.log(err)
                        })
                    }
                    tabs[debuggeeId.tabId].requests.delete(params.requestId)
                  } else {
                    console.log('empty')
                  }
                }
              )
            }
          }

          chrome.debugger.attach(
            {
              //debug at current tab
              tabId: tab.id
            },
            debug_version,
            () => {
              chrome.debugger
                .sendCommand(
                  {
                    //first enable the Network
                    tabId: tab.id
                  },
                  'Network.enable'
                )
                .catch((err) => {
                  console.log(err)
                })

              chrome.debugger.onEvent.addListener(allEventHandler)
            }
          )
        }
      )
    } else if (request.method == 'CHECKPOP') {
      const tabId = sender.tab?.id
      if (tabId) {
        if (tabs.hasOwnProperty(tabId)) {
          sendResponse(true)
        }
      }
      sendResponse(false)
    } else if (request.method == 'GETXHRJSON') {
      const tabId = sender.tab?.id
      if (tabId) {
        if (tabs.hasOwnProperty(tabId)) {
          sendResponse(tabs[tabId].xhrjson)
        }
      }
    } else if (request.method == 'UPLOAD') {
      const tabId = sender.tab?.id
      if (tabId) {
        if (tabs.hasOwnProperty(tabId)) {
          let token = tabs[tabId].token
          let file = common.dataURL2File(request.doc.data, request.doc.name)
          const formData = new FormData()
          formData.append('file', file)
          fetch(api + '/api/zkpass/submitapi/upload', {
            method: 'POST',
            headers: { Authorization: token },
            body: formData
          })
            .then(async (response) => {
              let rsp = await response.json()
              sendResponse(rsp)
            })
            .catch((error) => {
              console.log(error)
            })
        }
      }
    } else if (request.method == 'SUBMIT') {
      const tabId = sender.tab?.id
      if (tabId) {
        if (tabs.hasOwnProperty(tabId)) {
          let token = tabs[tabId].token
          fetch(api + '/api/zkpass/submitapi/submitAPI', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json;charset=utf-8',
              Authorization: token
            },
            body: JSON.stringify(request.doc)
          })
            .then(async (response) => {
              let rsp = await response.json()
              sendResponse(rsp)
            })
            .catch((error) => {
              console.log(error)
            })
        }
      }
    }
  }
  return true
})

chrome.tabs.onRemoved.addListener(function (tabId) {
  console.log('removed', tabId)

  if (tabs[tabId]) {
    chrome.debugger
      .detach({
        tabId: tabId
      })
      .catch((err) => {
        console.log(err)
      })
    delete tabs[tabId]
    console.log('out tabs', tabs)
  }
})
