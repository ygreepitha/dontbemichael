'use strict';

/**
 * An engine is offered only with evidence. Unverified capabilities never
 * count as passing, and a single failure blocks the engine on that OS.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const loadTs = require('./load-ts.cjs');

const mod = loadTs('src/shared/engineCapabilities.ts');

const allPass = () => Object.fromEntries(mod.ALL_CAPABILITIES.map((c) => [c, 'pass']));

test('an engine with no record is not offerable', () => {
  assert.equal(mod.isEngineOfferable(undefined, 'linux'), false);
});

test('codex starts fully unverified, so it is not offerable on any OS', () => {
  for (const os of ['darwin', 'win32', 'linux']) {
    assert.equal(mod.isEngineOfferable(mod.ENGINE_CONFORMANCE.codex, os), false);
    assert.equal(mod.missingCapabilities(mod.ENGINE_CONFORMANCE.codex, os).length, mod.ALL_CAPABILITIES.length);
  }
});

test('an engine is offerable only when every capability passes on that OS', () => {
  const record = { darwin: allPass(), win32: { ...allPass(), folderIsolation: 'fail' }, linux: allPass() };
  assert.equal(mod.isEngineOfferable(record, 'darwin'), true);
  assert.equal(mod.isEngineOfferable(record, 'win32'), false);
  assert.deepEqual(mod.missingCapabilities(record, 'win32'), ['folderIsolation']);
});
