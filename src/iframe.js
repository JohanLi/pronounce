import { getPronunciations } from './lib/cambridgeDictionary';
import Cache from './lib/cache';

const audio = new Audio();

window.addEventListener('message', async (message) => {
  const { data: word } = message;

  const cached = await Cache.get(word);

  if (cached) {
    audio.src = cached;
  } else {
    const { us } = await getPronunciations(word);
    audio.src = us;

    await Cache.set(word, us);
  }

  return audio.play();
});
