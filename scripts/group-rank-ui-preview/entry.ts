import { groupHomeTarget } from '../../apps/group-rank-miniapp/src/lib/notebook';

// Navigation changes the page, never the simulated WeChat launch context.
export function previewEntryKind(search = new URLSearchParams(location.search)) {
  return search.get('entry') === 'lobby' || (!search.has('entry') && search.get('screen') === 'lobby') ? 'lobby' : 'group-tool';
}
export function previewNavigationQuery(search: URLSearchParams, url: string) {
  const kind = previewEntryKind(search);
  const page = url.includes('/board/') ? 'board' : url.includes('/create/') ? 'create' : kind === 'lobby' ? 'lobby' : 'group';
  const query = new URLSearchParams(search);
  query.set('entry', kind === 'lobby' ? 'lobby' : 'group');
  for (const key of ['id', 'template', 'draft', 'card', 'cardDraft', 'cardTemplate', 'cardResult', 'turn']) query.delete(key);
  new URL(url, 'http://127.0.0.1').searchParams.forEach((value, key) => query.set(key, value));
  query.set('screen', page);
  return query;
}
export const currentEntry = () => {
  const search = new URLSearchParams(location.search);
  const kind = previewEntryKind(search);
  return previewCardEntry(search, kind);
};
export function previewCardEntry(search: URLSearchParams, kind = previewEntryKind(search)) {
  const boardId = kind === 'lobby' ? '' : search.get('card') || '';
  const personalResult = kind !== 'lobby' && search.get('cardResult') === '1';
  const templateId = kind === 'lobby' || personalResult ? '' : search.get('cardTemplate') || '';
  const draftId = kind === 'lobby' || personalResult ? '' : search.get('cardDraft') || '';
  return { kind: boardId || templateId || draftId ? 'group-card' as const : kind, boardId, templateId, draftId, personalResult };
};
let cardEntryPending = typeof location !== 'undefined' && currentEntry().kind === 'group-card';
export const needsEntryNavigation = () => cardEntryPending;
export const consumeEntryNavigation = () => {
  const pending = cardEntryPending;
  cardEntryPending = false;
  return pending;
};
export { groupHomeTarget };
