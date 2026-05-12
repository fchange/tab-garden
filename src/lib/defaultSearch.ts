export async function queryDefaultSearchProvider(query: string) {
  const text = query.trim();
  if (!text || typeof chrome === 'undefined' || !chrome.search?.query) return;

  await chrome.search.query({
    text,
    disposition: 'NEW_TAB',
  });
}
