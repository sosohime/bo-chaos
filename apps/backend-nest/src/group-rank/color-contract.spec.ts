import { definitionKey, normalizeAccentColor, normalizeDefinition, customTemplate } from './definitions';
const definition = {name:'积分',unit:'分',aggregate:'latest' as const,direction:'desc' as const,period:'all_time' as const};
it('canonicalizes color at the domain boundary and in draft identity', () => {
  expect(normalizeDefinition({...definition,accentColor:'#f65d9b'}).accentColor).toBe('#F65D9B');
  expect(customTemplate('draft',{...definition,accentColor:'#f65d9b'}).accentColor).toBe('#F65D9B');
  expect(definitionKey({...definition,accentColor:'#f65d9b'})).toBe(definitionKey({...definition,accentColor:'#F65D9B'}));
  expect(definitionKey({...definition,accentColor:'#F65D9B'})).not.toBe(definitionKey({...definition,accentColor:'#43DDC3'}));
  expect(normalizeAccentColor(null)).toBeNull();
});
it.each(['red','#fff','#12345678','url(x)','#12345g',5])('rejects invalid color %s before persistence', color => {
  expect(() => normalizeDefinition({...definition,accentColor:color as any})).toThrow('有效的榜单颜色');
});
