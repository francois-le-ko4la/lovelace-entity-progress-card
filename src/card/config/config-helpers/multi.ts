import { is } from '../../../utils/common-checks.js';
import { YamlSchemaFactory, ROW_IDENTITY_FIELDS } from '../schema.js';
import { type LovelaceConfig } from '../../../utils/types.js';
import { BaseConfigHelper, type Schema } from './base.js';
import { CardConfigHelper } from './card.js';

/**
 * Config helper for both Multi aggregators. No defaults of its own: an
 * aggregator has no entity, icon or action to negotiate - every row option it
 * carries is a default its children re-validate for themselves (see multi.ts's
 * #childConfigs). Its migrations are the card's, plus its own: what it
 * carries is card options.
 *
 * @extends BaseConfigHelper
 */
class MultiConfigHelper extends BaseConfigHelper {
  static _customizeConfig(config: LovelaceConfig): LovelaceConfig {
    return CardConfigHelper._customizeConfig(
      MultiConfigHelper._migrateShowValue(
        MultiConfigHelper._migrateValuePosition(MultiConfigHelper._migrateSharedRowIdentity(config)),
      ),
    );
  }

  // A name or an icon at the shared level is what an earlier build produced by
  // hoisting a lone row's own settings. The aggregator schemas no longer carry
  // either (ROW_IDENTITY_FIELDS), so the value has to reach its rows before
  // validation drops it - deliberately not shared with the editor's own
  // pushDown (multi-cascade.ts): card code doesn't reach into editor code, and
  // this one also has the bare entity-id shorthand to expand.
  static _migrateSharedRowIdentity(config: LovelaceConfig): LovelaceConfig {
    const stale = ROW_IDENTITY_FIELDS.filter((field) => field !== 'entity' && config?.[field] !== undefined);
    if (stale.length === 0 || !is.array(config.entities)) return config;
    const migrated: LovelaceConfig = { ...config };
    for (const field of stale) migrated[field] = undefined;
    migrated.entities = config.entities.map((row: unknown) => {
      const own: Record<string, unknown> = is.plainObject(row) ? { ...row } : { entity: row };
      for (const field of stale) own[field] ??= config[field];
      return own;
    });
    return migrated;
  }
}

/**
 * One row of a Multi, edited on its own — `YamlSchemaFactory.multiRow`. Same
 * migrations as its aggregator (show_value was settable per row too), and the
 * card's own defaults: the row renders as that card (multi.ts), so its editor
 * has to show what the card will use.
 *
 * @extends MultiConfigHelper
 */
class MultiRowConfigHelper extends MultiConfigHelper {
  _yamlSchema: Schema = YamlSchemaFactory.multiRow;

  static _applyDefaults(config: LovelaceConfig): LovelaceConfig {
    return CardConfigHelper._applyDefaults(config);
  }
}

/**
 * The same row, inside a Feature — `YamlSchemaFactory.multiFeatureRow`, which
 * drops what a few pixels of icon cannot carry.
 *
 * @extends MultiRowConfigHelper
 */
class MultiFeatureRowConfigHelper extends MultiRowConfigHelper {
  _yamlSchema = YamlSchemaFactory.multiFeatureRow;
}

/**
 * MultiConfigHelper variant for the standalone card —
 * `YamlSchemaFactory.multiCard`.
 *
 * @extends MultiConfigHelper
 */
class MultiCardConfigHelper extends MultiConfigHelper {
  _yamlSchema = YamlSchemaFactory.multiCard;
}

/**
 * MultiConfigHelper variant for the tile feature —
 * `YamlSchemaFactory.multiFeature`.
 *
 * @extends MultiConfigHelper
 */
class MultiFeatureConfigHelper extends MultiConfigHelper {
  _yamlSchema = YamlSchemaFactory.multiFeature;
}

export { MultiRowConfigHelper, MultiFeatureRowConfigHelper, MultiCardConfigHelper, MultiFeatureConfigHelper };
