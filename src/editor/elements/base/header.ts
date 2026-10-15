import { HA_CONTEXT, EDITOR_FIELD_NS } from '../../../utils/parameters.js';
import { type HassProviderSingleton } from '../../../utils/hass-provider.js';
import { type LovelaceConfig, type FieldDef } from '../../../utils/types.js';
import { type BaseConfigHelper, hasDeprecatedOptions } from '../../../card/config/config-helpers.js';
import { OPTIONS_WITHOUT_EFFECT } from '../../../card/config/schema.js';
import { type EditorDOMHelper } from '../../form/dom-helper.js';
import { BUG_ICON_PATH, issueReport, copyText } from '../../data/issue-report.js';
import { isInert, migrateDeprecatedConfig } from '../../data/config-flow.js';
import { buildIconButton } from '../list-editors/buttons.js';

type HeaderDeps = {
  host: HTMLElement;
  shadow: ShadowRoot;
  dom: EditorDOMHelper;
  hassProvider: HassProviderSingleton;
  configHelper: () => BaseConfigHelper;
  lastConfig: () => LovelaceConfig;
  offersIssueReport: boolean;
  parksInertOptions: boolean;
};

// What Home Assistant holds, not the form's state: the YAML the user has.
const copyIssueReport = async ({ host, shadow, hassProvider, lastConfig }: HeaderDeps) => {
  if (!(await copyText(issueReport(lastConfig()), shadow))) return;
  const message = hassProvider.localizeGroup(EDITOR_FIELD_NS)?.issue_report_copied ?? 'Copied to clipboard';
  host.dispatchEvent(
    new CustomEvent(HA_CONTEXT.events.notification, { detail: { message }, bubbles: true, composed: true }),
  );
};

const buildMigrateButton = (deps: HeaderDeps): HTMLElement => {
  const { dom, hassProvider, configHelper, parksInertOptions } = deps;
  const button = document.createElement('ha-button');
  const fieldName = '_migrate_config';
  button.id = fieldName;
  button.append(hassProvider.localizeGroup(EDITOR_FIELD_NS)?.migrate_config ?? 'Migrate config');
  button.addEventListener('click', () => {
    button.dispatchEvent(
      new CustomEvent(HA_CONTEXT.events.valueChanged, { detail: { value: true }, bubbles: true, composed: true }),
    );
  });

  const field = {
    name: fieldName,
    virtual: true,
    // Also for options without effect: the click's own write parks them.
    showIf: (config: LovelaceConfig) =>
      hasDeprecatedOptions(config) ||
      (parksInertOptions && OPTIONS_WITHOUT_EFFECT.some((option) => isInert(config, option))),
    onVirtualChange: (_value: unknown, config: LovelaceConfig) => migrateDeprecatedConfig(config, configHelper()),
  } as unknown as FieldDef;
  dom.registerField(fieldName, button, field);
  return button;
};

const buildEditorHeader = (deps: HeaderDeps): HTMLElement => {
  const header = document.createElement('div');
  header.className = 'editor-header';
  if (deps.offersIssueReport) {
    const label = deps.hassProvider.localizeGroup(EDITOR_FIELD_NS)?.issue_report ?? 'Copy to clipboard';
    header.appendChild(buildIconButton(BUG_ICON_PATH, label, () => copyIssueReport(deps)));
  }
  header.appendChild(buildMigrateButton(deps));
  return header;
};

export { buildEditorHeader };
