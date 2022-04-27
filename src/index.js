import Tooltip from './tooltip';

const position = { x: 0, y: 0 };
const tooltip = Tooltip;

// https://developer.chrome.com/docs/extensions/mv3/messaging/#simple
chrome.runtime.onMessage.addListener(async (word, sender, sendResponse) => {
  await tooltip.create(position);
  tooltip.postMessage(word);

  sendResponse({}); // https://stackoverflow.com/a/71520415
});

function onPlay(src) {
  const speed = tooltip.getSpeed();
  tooltip.postMessage({ action: 'play', src, speed });
}

window.onmessage = (e) => {
  Tooltip.update(position, e.data, onPlay);
};

document.addEventListener('contextmenu', (event) => {
  position.x = event.clientX;
  position.y = event.clientY;
});
