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

  chrome.tabs.sendMessage(tab.id, selectionText);
})

chrome.commands.onCommand.addListener((shortcut) => {
  if (shortcut.includes('+M')) {
    console.log('m pressed');

    chrome.runtime.reload();
  }
});
