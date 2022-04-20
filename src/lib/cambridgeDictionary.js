const BASE_URL = 'https://dictionary.cambridge.org';

/*
  if <base> is not set, it will default to the URL of the page that "Pronounce"
  was run on.
 */
function setBaseUrl(document) {
  const base = document.createElement('base');
  base.href = BASE_URL;
  document.getElementsByTagName('head')[0].appendChild(base);
}

export async function getPronunciations(word) {
  const response = await fetch(`${BASE_URL}/dictionary/english/${word}`);
  const html = await response.text();

  const document = new DOMParser().parseFromString(html, 'text/html');

  setBaseUrl(document);

  const audioElements = document.querySelectorAll('amp-audio');

  const pronunciations = {
    uk: audioElements[0].querySelector('source[type="audio/ogg"]').src,
    us: audioElements[1].querySelector('source[type="audio/ogg"]').src,
  };

  return pronunciations;
}
