import { getPronunciations } from './lib/cambridgeDictionary';
import Cache from './lib/cache';

export const speed = ['normal', 'slow'] as const;
export type Speed = typeof speed[number];

export type Message = {
  action: 'play';
  src: string;
  speed: Speed;
} | {
  action: 'lookup';
  word: string;
}

const audio = new Audio();

window.addEventListener('message', async (message) => {
  const { action } = message.data as Message;

  if (action === 'play') {
    const { src, speed } = message.data;

    audio.src = src;

    if (speed === 'normal') {
      audio.playbackRate = 1;
    }

    if (speed === 'slow') {
      audio.playbackRate = 0.5;
    }

    return audio.play();
  }

  if (action === 'lookup') {
    const { word } = message.data;

    let pronunciations = await Cache.get(word);

    if (!pronunciations) {
      pronunciations = await getPronunciations(word);
      await Cache.set(word, pronunciations);
    }

    audio.src = pronunciations.us[0].src;

    window.top.postMessage(pronunciations, '*');

    return audio.play();
  }

  throw Error('Iframe did not receive a known action');
});
