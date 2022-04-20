/*
  Two limitations exist:
    - service workers do not have access to DOMParser
    - fetching HTML in a content script will trigger CORS errors

  For these reasons, the service worker is responsible for fetching HTML.
  The HTML is then sent to a content script, that in turn uses DOMParser.
 */

const BASE_URL = 'https://dictionary.cambridge.org';

export async function getHtml(word) {
  const response = await fetch(`${BASE_URL}/dictionary/english/${word}`);
  return response.text();
}

/*
  if <base> is not set, it will default to the URL of the page that "Pronounce"
  was run on.
 */
function setBaseUrl(document) {
  const base = document.createElement('base');
  base.href = BASE_URL;
  document.getElementsByTagName('head')[0].appendChild(base);
}

export async function getPronunciations(html) {
  const document = new DOMParser().parseFromString(html, 'text/html');

  setBaseUrl(document);

  const audioElements = document.querySelectorAll('amp-audio');

  const pronunciations = {
    uk: audioElements[0].querySelector('source[type="audio/ogg"]').src,
    us: audioElements[1].querySelector('source[type="audio/ogg"]').src,
  };

  return pronunciations;
}
