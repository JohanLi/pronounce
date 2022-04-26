import Elements from './elements';

const position = { x: 0, y: 0 };
const elements = Elements;

// https://developer.chrome.com/docs/extensions/mv3/messaging/#simple
chrome.runtime.onMessage.addListener(async (word, sender, sendResponse) => {
  await elements.init(position);
  elements.postMessage(word);

  sendResponse({});
});

function onPlay(src) {
  const speed = elements.getSpeed();
  elements.postMessage({ action: 'play', src, speed });
}

window.onmessage = (e) => {
  Elements.update(position, e.data, onPlay);
};

document.addEventListener('contextmenu', (event) => {
  position.x = event.clientX;
  position.y = event.clientY;
});
