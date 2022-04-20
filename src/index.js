/*
  Limitations that have been worked around:
  - Audio cannot be played in a service worker
  - DOMParser cannot be run in a service worker
  - Websites can have content security policies set —  we're injecting an
    iframe to get around this issue. Otherwise, neither fetch nor audio
    can be used.
 */

const iframe = document.createElement('iframe');
iframe.src = chrome.runtime.getURL('iframe.html');

/*
  Audio won't play in Chrome unless a user has interacted with a page.
  https://developer.chrome.com/blog/autoplay/#iframe-delegation
 */
iframe.allow = 'autoplay';

iframe.style.visibility = 'hidden;';
iframe.style.width = '0';
iframe.style.height = '0';

document.body.appendChild(iframe);

// https://developer.chrome.com/docs/extensions/mv3/messaging/#simple
chrome.runtime.onMessage.addListener((word, sender, sendResponse) => {
  // TODO figure out targetOrigin
  iframe.contentWindow.postMessage(word, '*');

  sendResponse({});
});
