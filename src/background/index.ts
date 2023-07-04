const debug_version = '1.0'
let genTabId: any = null
let genWindowId: any = null
let tabs: { [index: number]: any } = {}

/**
 * receive content message and new a tab
 */
chrome.runtime.onMessage.addListener((request) => {
  if (request) {
    if (request.method == 'POPUP') {
      console.log('chrome.runtime.onMessage POPUP')

      chrome.tabs.create(
        {
          url: request.url
        },
        (tab: any) => {
          tabs[tab.id] = {
            windowId: tab.windowId,
            requests: new Map()
          }
          console.log('in tabs', tabs)

          function allEventHandler(debuggeeId: any, message: any, params: any) {
            if (!tabs[debuggeeId.tabId]) {
              return
            }

            console.log(message)

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
                  console.log(params.requestId, '#not found request')
                  return
                }
                request.set('response', params.response)
                tabs[debuggeeId.tabId].requests.set(params.requestId, request)
              }
            }

            if (message == 'Network.loadingFinished') {
              const request = tabs[debuggeeId.tabId].requests.get(
                params.requestId
              )
              if (request === undefined) {
                console.log(params.requestId, '#not found request')
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
                    console.log(request)
                    tabs[debuggeeId.tabId].requests.delete(params.requestId)
                  } else {
                    console.log('empty')
                  }
                }
              )
            }

            // if (message == 'Network.responseReceived') {
            //   //response return
            //   chrome.debugger.sendCommand(
            //     {
            //       tabId: debuggeeId.tabId
            //     },
            //     'Network.getResponseBody',
            //     {
            //       requestId: params.requestId
            //     },
            //     function (response) {
            //       // you get the response body here!
            //       // you can close the debugger tips by:
            //       console.log(response)
            //       // chrome.debugger.detach(debuggeeId)
            //     }
            //   )
            // }
          }

          chrome.debugger.attach(
            {
              //debug at current tab
              tabId: tab.id
            },
            debug_version,
            () => {
              chrome.debugger.sendCommand(
                {
                  //first enable the Network
                  tabId: tab.id
                },
                'Network.enable'
              )

              chrome.debugger.onEvent.addListener(allEventHandler)
            }
          )
        }
      )

      // chrome.windows.getCurrent((w) => {
      //   chrome.tabs.query({ active: true, windowId: w.id }, (tabs) => {
      //     genTabId = tabs[0].id
      //     genWindowId = w.id
      //     console.log('request.data', request.data)
      //     popupWindow(request)
      //     tabs.push({
      //       tabId:
      //     })
      //   })
      // })
    }
  }
  return true
})

// function popupWindow(request: any) {
//   if (chrome) {
//     chrome.webRequest.onCompleted.addListener(
//       function (details) {
//         console.log(details)
//       },
//       { urls: ['<all_urls>'], types: ["xmlhttprequest"]},
//       ["responseHeaders","extraHeaders"]
//     )
//     chrome.tabs.create(
//       {
//         url: request.url
//       },
//       (tab) => {
//         console.log('tab', tab)
//       }
//     )
//   }
// }

chrome.tabs.onRemoved.addListener(function (tabId) {
  console.log('removed', tabId)

  if (Object.keys(tabs).indexOf(tabId + '') >= 0) {
    chrome.debugger.detach({
      tabId: tabId
    })
    delete tabs[tabId]
    console.log('out tabs', tabs)
  }
})
