import { getPronunciations } from './lib/cambridgeDictionary';

const audio = new Audio();

window.addEventListener('message', async (message) => {
  const { data: word } = message;

  const { us } = await getPronunciations(word);
  audio.src = us;
  return audio.play();
});
