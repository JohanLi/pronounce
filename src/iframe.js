import { getPronunciations } from './lib/cambridgeDictionary';
import Cache from './lib/cache';

const audio = new Audio();

window.addEventListener('message', async (message) => {
  const { action, src, speed } = message.data;

  if (action === 'play') {
    audio.src = src;

    if (speed === 'normal') {
      audio.playbackRate = 1;
    }

    if (speed === 'slow') {
      audio.playbackRate = 0.5;
    }

    return audio.play();
  }

  const { data: word } = message;

  let pronunciations = await Cache.get(word);

  if (!pronunciations) {
    pronunciations = await getPronunciations(word);
    await Cache.set(word, pronunciations.us[0].src);
  }

  audio.src = pronunciations.us[0].src;

  window.top.postMessage(pronunciations, '*');

  return audio.play();
});
