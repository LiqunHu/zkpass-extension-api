(async () => {
    const src = chrome.runtime.getURL("static/js/content.js");
    await import(src);
  })();