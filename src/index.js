import { getPronunciations } from './lib/cambridgeDictionary';

const audio = new Audio();

// https://developer.chrome.com/docs/extensions/mv3/messaging/#simple
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  getPronunciations(message)
    .then((a) => {
      console.log(a);
      audio.src = a.us;
      return audio.play();
    })
    .catch((e) => console.log(e));

  sendResponse({});
});
