import { is } from '../utils/common-checks.js';

// Notes beside a key, by dotted path ('entities.0.hide'); '' heads the file.
type Notes = Map<string, string[]>;

// Unquoted only when YAML can't misread it - words joined by a space or a
// colon, not a YAML 1.1 boolean nor null. JSON quotes the rest; YAML reads it.
const PLAIN = /^[A-Za-z_][\w./-]*(?:[: ][\w./-]+)*$/;
const RESERVED = /^(?:true|false|yes|no|on|off|y|n|null)$/i;
const INDENT = '  ';

const scalar = (value: unknown): string => {
  if (is.string(value)) return PLAIN.test(value) && !RESERVED.test(value) ? value : JSON.stringify(value);
  return is.number(value) || is.boolean(value) ? String(value) : 'null';
};

// A literal block keeps a Jinja template readable; its first line sets the
// indentation, so one starting with a space stays a JSON string.
const isBlock = (text: string): boolean =>
  text.includes('\n') && !text.includes('\r') && !/^\n*[ \t]/.test(text) && !text.endsWith('\n\n');

const noteAt = (notes: Notes, path: string): string => {
  const found = notes.get(path);
  return found ? `  # ${found.join('; ')}` : '';
};

const isFilled = (value: unknown): boolean =>
  (is.array(value) && value.length > 0) || (is.plainObject(value) && Object.keys(value).length > 0);

function entry(head: string, value: unknown, indent: string, path: string, notes: Notes): string[] {
  const note = noteAt(notes, path);
  const inner = indent + INDENT;
  if (is.string(value) && isBlock(value)) {
    const body = value.replace(/\n$/, '').split('\n');
    return [`${indent}${head} |${value.endsWith('\n') ? '' : '-'}${note}`, ...body.map((line) => line && inner + line)];
  }
  if (is.array(value) && isFilled(value)) {
    return [
      `${indent}${head}${note}`,
      ...value.flatMap((item, index) => arrayItem(item, inner, `${path}.${index}`, notes)),
    ];
  }
  if (is.plainObject(value) && isFilled(value))
    return [`${indent}${head}${note}`, ...members(value, inner, path, notes)];
  const empty = is.array(value) ? '[]' : is.plainObject(value) ? '{}' : scalar(value);
  return [`${indent}${head} ${empty}${note}`];
}

// A map in a list opens on its dash, the way Home Assistant writes one.
function arrayItem(value: unknown, indent: string, path: string, notes: Notes): string[] {
  if (!is.plainObject(value) || !isFilled(value)) return entry('-', value, indent, path, notes);
  const [first = '', ...rest] = members(value, indent + INDENT, path, notes);
  return [`${indent}- ${first.trimStart()}`, ...rest];
}

function members(object: Record<string, unknown>, indent: string, path: string, notes: Notes): string[] {
  return Object.entries(object)
    .filter(([, value]) => value !== undefined)
    .flatMap(([key, value]) => entry(`${scalar(key)}:`, value, indent, path ? `${path}.${key}` : key, notes));
}

const toYaml = (config: Record<string, unknown>, notes: Notes = new Map()): string =>
  [...(notes.get('') ?? []).map((note) => `# ${note}`), ...members(config, '', '', notes)].join('\n');

export { toYaml };
