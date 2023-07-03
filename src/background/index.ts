// 创建上下文菜单
const contextMenus = [
    { id: "addLog", title: "添加日志" },
    { id: "translate", title: "谷歌翻译" },
    { id: "play", title: "语音朗读" },
  ];
  for (let menu of contextMenus) {
    chrome.contextMenus.create({
      id: menu.id,
      type: "normal",
      title: menu.title,
      contexts: ["selection"], // 右键点击选中文字时显示
      documentUrlPatterns: ["<all_urls>"], // 限制菜单选项仅应用于URL匹配给定模式之一的页面
    });
  }
  
  // 监听上下文菜单点击事件
  chrome.contextMenus.onClicked.addListener((info) => {
    if (info.selectionText) {
      switch (info.menuItemId) {
        case "addLog":
          // 查询当前打开的标签页
          console.log('addLog')
          chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            // 向当前打开的标签页发送添加日志的消息
            chrome.tabs.sendMessage(tabs[0].id||0, {
              todo: "addLog",
              data: info.selectionText,
            });
          });
          break;
        case "translate":
          // 打开谷歌翻译页面
          chrome.windows.create({
            url: `https://translate.google.cn/?sl=zh-CN&tl=en&text=${info.selectionText}&op=translate`,
            type: "popup",
            top: 10,
            left: 10,
            width: 800,
            height: 500,
          });
          break;
        case "play":
          // 语音朗读
          chrome.tts.speak(info.selectionText, { rate: 1 }); // rate配置项可以修改语音朗读速度，1为正常速度
          break;
        default:
          break;
      }
    }
  });
  
  // 监听content_scripts页面发来的消息
  chrome.runtime.onMessage.addListener((request) => {
    console.log("接收到content_scripts消息：", request);
    if (request.todo === "saveLog") {
      console.log('saveLog')
    }
  });
  
  