export default defineBackground(() => {
  chrome.action.onClicked.addListener(async () => {
    await chrome.tabs.create({});
  });
});
