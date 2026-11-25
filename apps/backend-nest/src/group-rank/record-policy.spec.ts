import { customTemplate, definitionKey, normalizeDefinition } from './definitions';
import { assertSingleClaim } from './record-policy';
const definition = {name:'测试榜',unit:'分',aggregate:'sum' as const,direction:'desc' as const,period:'all_time' as const};
it('keeps record mode in draft identity and canonicalizes singleton aggregation', () => {
  const one = normalizeDefinition({...definition,entryMode:'single'});
  expect(one.aggregate).toBe('latest');
  expect(customTemplate('d', one).entryMode).toBe('single');
  expect(definitionKey(one)).not.toBe(definitionKey(normalizeDefinition(definition)));
  expect(() => normalizeDefinition({...definition,entryMode:'quota' as any})).toThrow();
});
it('rejects singleton claim collisions but preserves monthly historical transfers', () => {
  const single = customTemplate('d', normalizeDefinition({...definition,entryMode:'single'}));
  const entries = [{createdAt:new Date('2026-11-01T00:00:00Z')},{createdAt:new Date('2026-11-15T00:00:00Z')}];
  expect(() => assertSingleClaim(single, entries)).toThrow('认领记录冲突');
  expect(() => assertSingleClaim({...single,entryMode:'multiple'},entries)).not.toThrow();
  const boundary = [{createdAt:new Date('2026-10-31T15:59:59Z')},{createdAt:new Date('2026-10-31T16:00:00Z')}];
  expect(() => assertSingleClaim({...single,period:'month'},boundary)).not.toThrow();
  expect(() => assertSingleClaim({...single,period:'month'},entries)).toThrow();
});
