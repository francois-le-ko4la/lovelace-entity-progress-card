import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { HassProviderSingleton, sameDeviceEntities, buildTranslationTree } from '../../src/utils/hass-provider.js';
import type { HomeAssistant } from '../../src/utils/hass-provider.js';
import { TRANSLATION_KEYS, EDITOR_KEY_START } from '../../src/utils/translations.js';

const PROGRESS = 'sensor.washer_progress';
const STATUS = 'sensor.washer_status';
const WASHER_DEVICE = 'washer';

type Registry = Record<string, { device_id?: string }>;

const hassWith = (language: string, numberFormat = 'language') =>
  ({
    language,
    locale: { language, number_format: numberFormat },
    states: {},
    entities: {},
    config: {},
  }) as unknown as HomeAssistant;

const REGISTRY: Registry = {
  [PROGRESS]: { device_id: WASHER_DEVICE },
  [STATUS]: { device_id: WASHER_DEVICE },
  'sensor.dryer_status': { device_id: 'dryer' },
  'sensor.no_device': {},
};

describe('sameDeviceEntities', () => {
  test('lists the other entities of the same device, not the entity itself', () => {
    assert.deepEqual(sameDeviceEntities(REGISTRY, PROGRESS), [STATUS]);
  });

  test('an entity with no device, or absent from the registry, has none', () => {
    assert.deepEqual(sameDeviceEntities(REGISTRY, 'sensor.no_device'), []);
    assert.deepEqual(sameDeviceEntities(REGISTRY, 'sensor.not_registered'), []);
  });

  test('a replaced registry object is indexed again', () => {
    sameDeviceEntities(REGISTRY, PROGRESS);
    const updated: Registry = { ...REGISTRY, 'sensor.washer_door': { device_id: WASHER_DEVICE } };
    assert.deepEqual(sameDeviceEntities(updated, PROGRESS), [STATUS, 'sensor.washer_door']);
  });
});

describe('numberFormat - memoized per number_format and language', () => {
  const provider = HassProviderSingleton.getInstance();

  test('an explicit number_format wins over the language', () => {
    provider.hass = hassWith('fr', 'comma_decimal');
    assert.equal(provider.numberFormat, 'en-US');
  });

  test('a new language after a first read is not answered from the old one', () => {
    provider.hass = hassWith('de');
    const german = provider.numberFormat;
    provider.hass = hassWith('fr');
    assert.notEqual(provider.numberFormat, german);
  });
});

// The editor's labels ship beside the bundle, one file per language, fetched
// when an editor first opens. Whatever goes wrong with that file, the editor
// opens - in English.
describe('ensureEditorTranslations - a sidecar that fails leaves the editor in English', () => {
  const provider = HassProviderSingleton.getInstance();
  const editorKey = TRANSLATION_KEYS[EDITOR_KEY_START];
  const rowLength = TRANSLATION_KEYS.length - EDITOR_KEY_START;
  const leaf = (tree: Record<string, unknown>, key: string) =>
    key.split('.').reduce<unknown>((node, segment) => (node as Record<string, unknown>)?.[segment], tree);
  const english = String(leaf(buildTranslationTree('en'), editorKey));

  // One language per case: a language the provider has settled stays settled.
  const labelIn = async (language: string, fetchStub: () => Promise<unknown>) => {
    const original = globalThis.fetch;
    globalThis.fetch = fetchStub as unknown as typeof fetch;
    try {
      provider.hass = hassWith(language);
      await provider.ensureEditorTranslations();
      return provider.localize(editorKey);
    } finally {
      globalThis.fetch = original;
    }
  };
  const reply = (body: unknown, ok = true) => () => Promise.resolve({ ok, json: () => Promise.resolve(body) });

  test('a fetch that throws', async () => {
    assert.equal(await labelIn('fr', () => Promise.reject(new Error('offline'))), english);
  });

  test('a missing file', async () => {
    assert.equal(await labelIn('de', reply([], false)), english);
  });

  test('a file from another version, one label off', async () => {
    assert.equal(await labelIn('es', reply(new Array<string | 0>(rowLength + 1).fill(0))), english);
  });

  test('a matching file is what the editor reads', async () => {
    const row = new Array<string | 0>(rowLength).fill(0);
    row[0] = 'Libellé';
    assert.equal(await labelIn('it', reply(row)), 'Libellé');
  });
});
