/*
  The API of chrome.storage.local.get seems peculiar in the sense that one
  has to essentially access the key twice.
 */

const Cache = {
  get: async (key) => {
    const { value, expireAfter } = (await chrome.storage.local.get(key))[key] || {};

    if (!value || new Date().getTime() >= expireAfter) {
      return undefined;
    }

    return value;
  },
  set: (key, value, expireSeconds = 3600) => {
    const expireAfter = new Date().getTime() + expireSeconds * 1000;
    return chrome.storage.local.set({ [key]: { value, expireAfter } });
  },
}

export default Cache;
