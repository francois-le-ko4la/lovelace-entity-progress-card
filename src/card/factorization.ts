// One factorisation for every shared level (mark families, Multi rows): the
// rule up top, exceptions below. Stateless - the config is the only storage.

import { is } from '../utils/common-checks.js';

type Rec = Record<string, unknown>;
// What settle reshapes: the shared level and the items, rebuilt at the end.
type State = { shared: Rec; items: Record<string, unknown> };

// 'inherits' reads the shared value unless it sets its own, 'own' never does,
// 'pinned' is never shared - one found up there goes back down.
type FactorRule = 'inherits' | 'own' | 'pinned';

type FactorizationSpec = {
  // Where the shared values live, and the items under them, by id.
  shared: (config: Rec) => Rec;
  items: (config: Rec) => Record<string, unknown>;
  rebuild: (config: Rec, shared: Rec, items: Record<string, unknown>) => Rec;
  // An item's own value for a key, shorthands included.
  own: (item: unknown, key: string) => unknown;
  // The item rewritten with `patch` (undefined drops a key), shortest shape.
  write: (id: string, item: unknown, patch: Rec) => unknown;
  // null: the item doesn't carry that key at all.
  rule: (id: string, key: string) => FactorRule | null;
  // Whether an item has a say - a hidden mark has none, and is left as it is.
  votes: (config: Rec, id: string) => boolean;
  // The keys settle looks at.
  isKey: (key: string) => boolean;
};

// Config values are plain schema-shaped data, so a structural compare is
// enough - and the only one that tells two equal action maps apart.
const same = (a: unknown, b: unknown) => JSON.stringify(a ?? null) === JSON.stringify(b ?? null);

// Not undefined: "most items set nothing" is a real outcome of its own.
const NO_WINNER = Symbol('no winner');

// The value with strictly the most votes, at least `quorum` of them. A tie
// keeps the current one, so editing an unrelated item never flips the rule.
const elect = (values: unknown[], current: unknown, quorum: number): unknown => {
  const counts = new Map<string, { value: unknown; count: number }>();
  for (const value of values) {
    const key = JSON.stringify(value ?? null);
    const entry = counts.get(key) ?? { value, count: 0 };
    entry.count += 1;
    counts.set(key, entry);
  }
  const entries = [...counts.values()];
  const best = Math.max(0, ...entries.map((entry) => entry.count));
  if (best < quorum) return NO_WINNER;
  const winners = entries.filter((entry) => entry.count === best);
  return (winners.find((entry) => same(entry.value, current)) ?? winners[0]).value;
};

class Factorization {
  readonly #spec: FactorizationSpec;

  constructor(spec: FactorizationSpec) {
    this.#spec = spec;
  }

  // Whether an item has a say - for marks, whether it is shown at all.
  votes(config: Rec, id: string): boolean {
    return this.#spec.votes(config, id);
  }

  // What an item really uses: its own, else the shared one if it inherits.
  resolve(config: Rec, id: string, key: string): unknown {
    const spec = this.#spec;
    const own = spec.own(spec.items(config)[id], key);
    if (own !== undefined) return own;
    return spec.rule(id, key) === 'inherits' ? spec.shared(config)[key] : undefined;
  }

  setLocal(config: Rec, id: string, key: string, value: unknown): Rec {
    const spec = this.#spec;
    const items = spec.items(config);
    const written = { ...items, [id]: spec.write(id, items[id], { [key]: value }) };
    return this.settle(spec.rebuild(config, spec.shared(config), written), [key]);
  }

  // Moves where values are written, never what an item uses: the majority is
  // the rule, a tie changes nothing, a lone item sets it for the next ones.
  settle(config: Rec, keys?: readonly string[]): Rec {
    const spec = this.#spec;
    const state: State = { shared: { ...spec.shared(config) }, items: { ...spec.items(config) } };
    const voters = Object.keys(state.items).filter((id) => spec.votes(config, id));
    for (const key of keys ?? this.#keysOf(state)) {
      const pinned = voters.filter((id) => spec.rule(id, key) === 'pinned');
      if (pinned.length > 0) this.#pushDown(state, key, pinned);
      else
        this.#settleKey(
          state,
          key,
          voters.filter((id) => spec.rule(id, key) === 'inherits'),
        );
    }
    return spec.rebuild(config, state.shared, state.items);
  }

  #keysOf({ shared, items }: State): string[] {
    const own = Object.values(items).flatMap((item) => (is.plainObject(item) ? Object.keys(item) : []));
    return [...new Set([...Object.keys(shared), ...own])].filter(this.#spec.isKey);
  }

  #write(state: State, id: string, key: string, value: unknown): void {
    state.items = { ...state.items, [id]: this.#spec.write(id, state.items[id], { [key]: value }) };
  }

  // A pinned key found up there: every item not saying its own gets it back.
  #pushDown(state: State, key: string, pinned: string[]): void {
    if (!(key in state.shared)) return;
    for (const id of pinned)
      if (this.#spec.own(state.items[id], key) === undefined) this.#write(state, id, key, state.shared[key]);
    Reflect.deleteProperty(state.shared, key);
  }

  #settleKey(state: State, key: string, readers: string[]): void {
    if (readers.length === 0) return;
    // Every reader's value before anything moves: what it must keep using.
    const used = readers.map((id) => this.#spec.own(state.items[id], key) ?? state.shared[key]);
    // An item using no value at all can't be handed an exception to a rule -
    // there is no "nothing" to write down - so it holds the rule off.
    const winner = used.some((value) => value === undefined)
      ? NO_WINNER
      : elect(used, state.shared[key], readers.length > 1 ? 2 : 1);
    const rule = winner === NO_WINNER ? undefined : winner;
    if (rule === undefined) Reflect.deleteProperty(state.shared, key);
    else state.shared[key] = rule;
    readers.forEach((id, index) => {
      this.#write(state, id, key, rule !== undefined && same(used[index], rule) ? undefined : used[index]);
    });
  }
}

export { Factorization, type FactorRule };
