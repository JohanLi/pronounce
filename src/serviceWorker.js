const id = 'pronounce';

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    title: 'Pronounce',
    contexts: ['selection'],
    id,
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  const { menuItemId, selectionText } = info;

  if (menuItemId !== id) {
    return;
  }

  const response = await fetch(`https://dictionary.cambridge.org/dictionary/english/${selectionText}`);
  const html = await response.text();

  chrome.tabs.sendMessage(tab.id, html);
})

chrome.commands.onCommand.addListener((shortcut) => {
  if (shortcut.includes('+M')) {
    console.log('m pressed');

    chrome.runtime.reload();
  }
});
