type Pronunciation = {
  src: string;
  ipa: string;
}

export type Pronunciations = {
  us: Pronunciation[];
  uk: Pronunciation[];
}

const BASE_URL = 'https://dictionary.cambridge.org';

/*
  if <base> is not set, it will default to the URL of the page that "Pronounce"
  was run on.
 */
function setBaseUrl(document: Document) {
  const base = document.createElement('base');
  base.href = BASE_URL;
  document.getElementsByTagName('head')[0].appendChild(base);
}

export async function getPronunciations(word: string) {
  const response = await fetch(`${BASE_URL}/dictionary/english/${word}`);
  const html = await response.text();

  const document = new DOMParser().parseFromString(html, 'text/html');

  setBaseUrl(document);

  const pronunciationNodes = document.querySelectorAll('.pos-header')[0].querySelectorAll('.dpron-i');

  const pronunciations: Pronunciations = { us: [], uk: [] };

  for (let i = 0; i < pronunciationNodes.length; i += 1) {
    const src = pronunciationNodes[i].querySelector<HTMLSourceElement>('source[type="audio/ogg"]').src;
    const ipa = pronunciationNodes[i].querySelector('.ipa').textContent;

    if (pronunciationNodes[i].classList.contains('uk')) {
      pronunciations.uk.push({ src, ipa });
    }

    if (pronunciationNodes[i].classList.contains('us')) {
      pronunciations.us.push({ src, ipa });
    }
  }

  return pronunciations;
}
