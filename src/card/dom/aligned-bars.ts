// bar_aligned: the rows of a group get the text column of the widest, so their
// bars start at the same x. A group is one Multi, or every card sharing a name.

type AlignMember = {
  // Natural width of the text column, read while `measuring` is applied.
  measure: () => number;
  // The widest the column may get on this row.
  cap: () => number;
  apply: (width: string) => void;
};

type AlignHandle = {
  // A text of the row changed: only that row is measured.
  textChanged: () => void;
  // Sizes changed: the whole group is measured again, and may shrink.
  resized: () => void;
  leave: () => void;
};

// Each member's last cap and natural width. The column grows at once, and
// shrinks only once the narrower text has held for shrinkDelay.
type Row = { cap: number; natural: number };
type Group = { members: Map<AlignMember, Row>; width: number; shrink: ReturnType<typeof setTimeout> | null };

// A wall panel never reloads: without a shrink, one passing long text would
// set the column for good. Tests shorten it.
const alignTiming = { shrinkDelay: 30_000 };

// Widths a member is handed: the one it measures at, and none at all.
const MEASURING = 'max-content';
const RELEASED = '';

// Keyed by the Multi the rows sit in, or by the name they share.
const groups = new Map<object | string, Group>();
const wholeGroups = new Set<Group>();
const changedRows = new Map<AlignMember, Group>();
let frame = 0;

const widthFor = (group: Group, cap: number) => `${Math.ceil(Math.min(group.width, cap))}px`;
const applyAll = (group: Group) => group.members.forEach(({ cap }, member) => member.apply(widthFor(group, cap)));
const neededBy = (group: Group) => Math.max(0, ...[...group.members.values()].map(({ natural }) => natural));

const cancelShrink = (group: Group): void => {
  if (group.shrink) clearTimeout(group.shrink);
  group.shrink = null;
};

// Decided on the texts there are when it fires, from the widths already read:
// no measurement of its own.
const scheduleShrink = (group: Group): void => {
  if (group.shrink || neededBy(group) >= group.width) return;
  group.shrink = setTimeout(() => {
    group.shrink = null;
    const needed = neededBy(group);
    if (needed >= group.width) return;
    group.width = needed;
    applyAll(group);
  }, alignTiming.shrinkDelay);
};

const measureWhole = (group: Group, widths: Map<AlignMember, number>): void => {
  for (const member of group.members.keys()) {
    group.members.set(member, { cap: member.cap(), natural: widths.get(member) ?? 0 });
  }
};

const settleWhole = (group: Group): void => {
  cancelShrink(group);
  group.width = neededBy(group);
  applyAll(group);
};

const settleRow = (group: Group, member: AlignMember, natural: number): void => {
  const row = group.members.get(member);
  if (!row) return;
  row.natural = natural;
  if (natural > group.width) {
    group.width = natural;
    applyAll(group);
  } else member.apply(widthFor(group, row.cap));
  scheduleShrink(group);
};

// All writes, then all reads, then all writes: one forced layout per frame for
// the whole page, never one per row.
const settle = (): void => {
  frame = 0;
  const whole = [...wholeGroups];
  const single = [...changedRows].filter(([member, group]) => !wholeGroups.has(group) && group.members.has(member));
  wholeGroups.clear();
  changedRows.clear();

  const measured = [...whole.flatMap((group) => [...group.members.keys()]), ...single.map(([member]) => member)];
  for (const member of measured) member.apply(MEASURING);
  const widths = new Map(measured.map((member) => [member, member.measure()]));
  whole.forEach((group) => measureWhole(group, widths));

  whole.forEach(settleWhole);
  for (const [member, group] of single) settleRow(group, member, widths.get(member) ?? 0);
};

const schedule = (): void => {
  if (!frame) frame = requestAnimationFrame(settle);
};

const touchGroup = (group: Group): void => {
  if (group.members.size === 0) return;
  wholeGroups.add(group);
  schedule();
};

// On leave the row goes back to its own width, and the rest of its group is
// measured again without it.
const joinAlignedRows = (key: object | string, member: AlignMember): AlignHandle => {
  const group = groups.get(key) ?? { members: new Map<AlignMember, Row>(), width: 0, shrink: null };
  group.members.set(member, { cap: 0, natural: 0 });
  groups.set(key, group);
  touchGroup(group);
  return {
    textChanged: () => {
      changedRows.set(member, group);
      schedule();
    },
    resized: () => touchGroup(group),
    leave: () => {
      group.members.delete(member);
      changedRows.delete(member);
      member.apply(RELEASED);
      if (group.members.size > 0) touchGroup(group);
      else {
        cancelShrink(group);
        wholeGroups.delete(group);
        groups.delete(key);
      }
    },
  };
};

// A web font landing late widens every text it draws.
globalThis.document?.fonts?.addEventListener?.('loadingdone', () => groups.forEach(touchGroup));

export { joinAlignedRows, alignTiming };
