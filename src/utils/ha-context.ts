/*
 * HA_CONTEXT: what the card knows about Home Assistant - HA mirrors, our own
 * decisions, integration enums, gathered at the end. No logic, just data.
 */

// ─── NAME BUILDERS ──────────────────────────────────────────────────────────

// Every HA theme color var follows this one naming convention.
const cssColorVar = (name: string): string => `var(--${name}-color)`;
const stateColorName = (...parts: string[]): string => `--state-${parts.join('-')}-color`;

const MDI_PREFIX = 'mdi:';
type CamelCase<S extends string> = S extends `${infer H}-${infer T}` ? `${H}${Capitalize<CamelCase<T>>}` : S;
const ICON_NAMES = [
  'help',
  'help-circle-outline',
  'chevron-up-box',
  'chevron-down-box',
  'equal-box',
  'progress-question',
  'alert-circle-outline',
  'exclamation-thick',
  'play',
  'pause',
  'gesture-tap-hold',
  'washing-machine',
  'update',
  'lightbulb',
  'lightbulb-outline',
  'thermometer',
  'water-percent',
  'air-filter',
  'list-box',
  'text-short',
  'radar',
  'chart-bell-curve',
  'label-outline',
  'aspect-ratio',
] as const;
const ICONS = Object.fromEntries(
  ICON_NAMES.map((name) => [name.replace(/-(\w)/g, (_, char: string) => char.toUpperCase()), `${MDI_PREFIX}${name}`]),
) as { [N in (typeof ICON_NAMES)[number] as CamelCase<N>]: string };

// ─── HA MIRRORS ─────────────────────────────────────────────────────────────
// Verbatim copies, re-synced from the source file named above each, at:
// https://github.com/home-assistant/frontend/tree/59444f72bc81b05e3e016861cf2c5d14a96f3217
// https://github.com/home-assistant/core/tree/53b8909e780b0be512680a19d294a67c6b0a7b30

// src/common/color/compute-color.ts: THEME_COLORS (what its color picker
// offers), then YAML_ONLY_THEMES_COLORS.
const HA_THEME_COLORS = [
  'primary',
  'accent',
  'red',
  'pink',
  'purple',
  'deep-purple',
  'indigo',
  'blue',
  'light-blue',
  'cyan',
  'teal',
  'green',
  'light-green',
  'lime',
  'yellow',
  'amber',
  'orange',
  'deep-orange',
  'brown',
  'light-grey',
  'grey',
  'dark-grey',
  'blue-grey',
  'black',
  'white',
] as const;
const HA_YAML_ONLY_COLORS = ['primary-text', 'secondary-text', 'disabled'] as const;

// src/resources/theme/color/color.globals.ts: the --state-*-color variables,
// nested domain → device_class (`_` = none) → states.
const HA_GENERIC_STATE_COLORS = ['active', 'inactive', 'unavailable'];
const HA_STATE_COLORS: Record<string, Record<string, readonly string[]>> = {
  alarm_control_panel: {
    _: [
      'armed_away',
      'armed_custom_bypass',
      'armed_home',
      'armed_night',
      'armed_vacation',
      'arming',
      'disarming',
      'pending',
      'triggered',
    ],
  },
  alert: { _: ['off', 'on'] },
  binary_sensor: {
    _: ['active'],
    battery: ['on'],
    carbon_monoxide: ['on'],
    gas: ['on'],
    glass_break: ['on'],
    heat: ['on'],
    lock: ['on'],
    moisture: ['on'],
    problem: ['on'],
    safety: ['on'],
    smoke: ['on'],
    sound: ['on'],
    tamper: ['on'],
  },
  // 'heat-cool' (hyphen) is HA's own spelling: no state slugifies to it, so
  // heat_cool falls through to --state-active-color, in HA as here.
  climate: { _: ['auto', 'cool', 'dry', 'fan_only', 'heat', 'heat-cool'] },
  cover: { _: ['active'] },
  device_tracker: { _: ['active', 'home'] },
  fan: { _: ['active'] },
  humidifier: { _: ['on'] },
  lawn_mower: { _: ['active', 'error'] },
  light: { _: ['active'] },
  lock: { _: ['jammed', 'locked', 'locking', 'open', 'opening', 'unlocked', 'unlocking'] },
  media_player: { _: ['active'] },
  person: { _: ['active', 'home'] },
  plant: { _: ['active'] },
  sensor: { battery: ['high', 'low', 'medium'] },
  siren: { _: ['active'] },
  sun: { _: ['above_horizon', 'below_horizon'] },
  switch: { _: ['active'] },
  update: { _: ['active'] },
  vacuum: { _: ['active', 'error'] },
  valve: { _: ['active'] },
  water_heater: { _: ['eco', 'electric', 'gas', 'heat_pump', 'high_demand', 'performance'] },
  weather: {
    _: [
      'clear_night',
      'cloudy',
      'exceptional',
      'fog',
      'hail',
      'lightning',
      'lightning_rainy',
      'partlycloudy',
      'pouring',
      'rainy',
      'snowy',
      'snowy_rainy',
      'sunny',
      'windy',
      'windy_variant',
    ],
  },
};

const STATE_COLOR_VARS: ReadonlySet<string> = new Set([
  ...HA_GENERIC_STATE_COLORS.map((state) => stateColorName(state)),
  ...Object.entries(HA_STATE_COLORS).flatMap(([domain, byDeviceClass]) =>
    Object.entries(byDeviceClass).flatMap(([deviceClass, states]) =>
      states.map((state) =>
        deviceClass === '_' ? stateColorName(domain, state) : stateColorName(domain, deviceClass, state),
      ),
    ),
  ),
]);
const haStateColor = (state: string): string => `var(${stateColorName(state)})`;

// src/common/entity/state_color.ts: STATE_COLORED_DOMAIN.
const STATE_COLORED_DOMAINS: ReadonlySet<string> = new Set([
  'alarm_control_panel',
  'alert',
  'automation',
  'binary_sensor',
  'calendar',
  'camera',
  'climate',
  'cover',
  'device_tracker',
  'fan',
  'group',
  'humidifier',
  'input_boolean',
  'lawn_mower',
  'light',
  'lock',
  'media_player',
  'person',
  'plant',
  'remote',
  'schedule',
  'script',
  'siren',
  'sun',
  'switch',
  'timer',
  'update',
  'vacuum',
  'valve',
  'water_heater',
  'weather',
]);

// src/common/entity/color/battery_color.ts: first threshold reached wins.
const BATTERY_COLOR_STEPS = [
  [70, 'high'],
  [30, 'medium'],
  [-Infinity, 'low'],
] as const;

// src/common/entity/state_active.ts (+ const.ts TIMESTAMP_STATE_DOMAINS_LIST):
// `inactive` besides 'off', `activeOnly` the only active states.
const STATE_ACTIVITY = {
  inactive: {
    alarm_control_panel: ['disarmed'],
    alert: ['idle'],
    cover: ['closed'],
    device_tracker: ['not_home'],
    person: ['not_home'],
    lawn_mower: ['docked', 'paused', 'idle'],
    lock: ['locked'],
    media_player: ['standby'],
    vacuum: ['idle', 'docked', 'paused'],
    valve: ['closed'],
  } as Record<string, readonly string[] | undefined>,
  activeOnly: {
    plant: ['problem'],
    group: ['on', 'home', 'open', 'locked', 'problem'],
    timer: ['active'],
    camera: ['streaming', 'recording'],
  } as Record<string, readonly string[] | undefined>,
  offIsActive: new Set(['alert']) as ReadonlySet<string>,
  timestamp: new Set([
    'ai_task',
    'button',
    'conversation',
    'event',
    'image',
    'infrared',
    'input_button',
    'notify',
    'radio_frequency',
    'scene',
    'stt',
    'tag',
    'tts',
    'wake_word',
    'datetime',
  ]) as ReadonlySet<string>,
};

// Where the tile card's icon toggles by default: DOMAINS_TOGGLE plus the three
// it presses or activates (getEntityDefaultTileIconAction, hui-tile-card.ts).
const TOGGLE_DOMAINS: ReadonlySet<string> = new Set([
  'fan',
  'input_boolean',
  'light',
  'switch',
  'group',
  'automation',
  'humidifier',
  'valve',
  'button',
  'input_button',
  'scene',
]);

// ─── OURS ───────────────────────────────────────────────────────────────────

// Other --<name>-color variables HA's themes define, accepted by name too.
const EXTRA_THEME_COLORS = [
  // text & interface
  'text-primary',
  'text-light-primary',
  'disabled-text',
  'dark-primary',
  'darker-primary',
  'light-primary',
  'divider',
  'outline',
  'outline-hover',
  'shadow',
  // status (alerts, badges), not entity state
  'success',
  'warning',
  'error',
  'info',
  // state: HA's default icon color
  'state-icon',
] as const;
const HA_PALETTE = [...HA_THEME_COLORS, ...HA_YAML_ONLY_COLORS, ...EXTRA_THEME_COLORS] as const;
type HaColorName = (typeof HA_PALETTE)[number];
const haColor = (name: HaColorName): string => cssColorVar(name);

interface DomainMapping {
  attribute: string;
  scale?: number;
  suggest?: string;
  unit?: 'system_temperature' | 'attribute_suffix';
}

// How value, min and max are read - the engine's own notion, not HA's.
type ValueKind = 'timer' | 'counter' | 'number' | 'duration' | 'default';

// How the card reads and animates an entity of one domain.
interface DomainProfile {
  kind?: ValueKind;
  // [min, max] attribute names of a ranged entity.
  range?: readonly [string, string];
  // `scale`: the attribute's native full scale when it isn't 0-100. `suggest`:
  // what the entity-first picker offers instead (no hvac_mode context there).
  // `unit`: the two domains with no unit_of_measurement.
  percent?: DomainMapping;
  // The state itself is a plain, directly-usable number.
  numericState?: true;
  // icon_animation may fire: a real moving/working state, not just on/off.
  animatable?: true;
  // Active for HA, yet nothing moves (a media player idling).
  stillStates?: readonly string[];
}

const DOMAIN_PROFILES: Record<string, DomainProfile | undefined> = {
  light: { percent: { attribute: 'brightness', scale: 255 }, animatable: true },
  cover: { percent: { attribute: 'current_position' }, animatable: true },
  valve: { percent: { attribute: 'current_position' }, animatable: true },
  fan: { percent: { attribute: 'percentage' }, animatable: true },
  humidifier: { percent: { attribute: 'current_humidity' }, animatable: true },
  water_heater: { percent: { attribute: 'current_temperature' }, animatable: true },
  media_player: {
    percent: { attribute: 'volume_level', scale: 1 },
    animatable: true,
    stillStates: ['idle', 'paused'],
  },
  climate: {
    percent: { attribute: 'temperature', suggest: 'current_temperature', unit: 'system_temperature' },
    animatable: true,
  },
  weather: { percent: { attribute: 'temperature', unit: 'attribute_suffix' } },
  timer: { kind: 'timer', animatable: true },
  counter: { kind: 'counter', range: ['minimum', 'maximum'], numericState: true },
  number: { kind: 'number', range: ['min', 'max'], numericState: true },
  input_number: { kind: 'number', range: ['min', 'max'], numericState: true },
  sensor: { numericState: true },
  switch: { animatable: true },
  input_boolean: { animatable: true },
  automation: { animatable: true },
  script: { animatable: true },
  remote: { animatable: true },
  siren: { animatable: true },
  vacuum: { animatable: true },
  lawn_mower: { animatable: true },
  lock: { animatable: true },
  alarm_control_panel: { animatable: true },
  binary_sensor: { animatable: true },
};

// ─── INTEGRATIONS ───────────────────────────────────────────────────────────

const INTEGRATIONS = {
  charging: {
    // Exact enums: Renault's charge_state has 'charge_in_progress' but also
    // 'charge_ended', MG SAIC's "charging finished" - no substring match.
    states: new Set([
      'charging',
      'charge_in_progress',
      'v2g_charging_normal',
      'charging (ac)',
      'charging (dc)',
      'super offboard charging',
    ]) as ReadonlySet<string>,
    // Not standardized: checked in likelihood order, first present wins; a
    // boolean flag or a 'charging' status enum.
    attributes: ['battery_charging', 'charging', 'is_charging'],
  },
  // Home Connect's operation_state 'run', Miele's status 'in_use'.
  washing: { states: new Set(['run', 'in_use']) as ReadonlySet<string> },
};

// ─── HA_CONTEXT ─────────────────────────────────────────────────────────────

const HA_CONTEXT = {
  icons: { prefix: MDI_PREFIX, ...ICONS },
  palette: new Set<string>(HA_PALETTE) as ReadonlySet<string>,
  stateColorVars: STATE_COLOR_VARS,
  stateColoredDomains: STATE_COLORED_DOMAINS,
  batteryColorSteps: BATTERY_COLOR_STEPS,
  stateActivity: STATE_ACTIVITY,
  toggleDomains: TOGGLE_DOMAINS,
  domainProfiles: DOMAIN_PROFILES,
  domains: { sensor: 'sensor', group: 'group' },
  deviceClasses: { duration: 'duration', battery: 'battery', batteryCharging: 'battery_charging' },
  // Entity state-object properties and attributes the card reads by name.
  attributes: {
    deviceClass: 'device_class',
    unit: 'unit_of_measurement',
    friendlyName: 'friendly_name',
    displayPrecision: 'display_precision',
    icon: 'icon',
    entityPicture: 'entity_picture',
    // a group's members
    entityId: 'entity_id',
    timer: { duration: 'duration', remaining: 'remaining', finishesAt: 'finishes_at' },
  },
  // WebSocket message types the card sends.
  ws: {
    renderTemplate: 'render_template',
    historyDuringPeriod: 'history/history_during_period',
    lovelaceConfig: 'lovelace/config',
    lovelaceDashboards: 'lovelace/dashboards/list',
  },
  events: {
    action: 'hass-action',
    notification: 'hass-notification',
    valueChanged: 'value-changed',
    // dispatched by an editor, caught by whoever hosts it
    configChanged: 'config-changed',
  },
  elements: { selector: 'ha-selector', svgIcon: 'ha-svg-icon', actionHandler: 'action-handler' },
  // State-object timestamps, shown as relative times.
  timestampProps: new Set(['last_changed', 'last_updated']) as ReadonlySet<string>,
  // Entity-registry fields the card reads.
  registryFields: ['display_precision', 'area_id', 'device_id'] as const,
  // A sensor's time units (UnitOfTime), plus French 'j'.
  durationUnits: new Set(['j', 'd', 'h', 'min', 's', 'ms', 'μs']) as ReadonlySet<string>,
  integrations: INTEGRATIONS,
  numberFormat: {
    decimal_comma: 'de-DE', // 1.234,56 (Germany, Italy, etc.)
    comma_decimal: 'en-US', // 1,234.56 (USA, UK, etc.)
    space_comma: 'fr-FR', // 1 234,56 (France, Norway, etc.)
    quote_decimal: 'de-CH', // 12'345.60 (Switzerland)
    none: 'en',
    // language and system resolve at runtime (hass-provider.ts).
  },
  entity: {
    state: {
      unavailable: 'unavailable',
      unknown: 'unknown',
      notFound: 'notFound',
      idle: 'idle',
      active: 'active',
      paused: 'paused',
      on: 'on',
      off: 'off',
    },
  },
  actions: {
    moreInfo: { action: 'more-info' },
    toggle: { action: 'toggle' },
    none: { action: 'none' },
  },
  styles: {
    rowSize: '--row-size',
    featureHeight: '--feature-height',
  },
};

export { HA_CONTEXT, cssColorVar, stateColorName, haColor, haStateColor };
export type { ValueKind, DomainProfile };
