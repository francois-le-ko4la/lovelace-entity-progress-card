/*
 * SampleRing: a growable ring of (time, value) samples in typed arrays - the
 * buffer behind TrendTracker and PeakTracker.
 */

type ValueArray = Float32Array | Float64Array;

const INITIAL_CAPACITY = 64;

class SampleRing {
  // Typed arrays, not an object per sample: ~50 bytes each against 12-16 here,
  // over ~60k samples a week at 10s. Float64 times keep sub-second ones apart.
  #createValues: (length: number) => ValueArray;
  #times = new Float64Array(INITIAL_CAPACITY);
  #values: ValueArray;
  #head = 0;
  #size = 0;

  constructor(createValues: (length: number) => ValueArray) {
    this.#createValues = createValues;
    this.#values = createValues(INITIAL_CAPACITY);
  }

  get size(): number {
    return this.#size;
  }

  timeAt(index: number): number {
    return this.#times[this.#slot(index)];
  }

  valueAt(index: number): number {
    return this.#values[this.#slot(index)];
  }

  reset(capacity = 0) {
    const length = Math.max(INITIAL_CAPACITY, capacity);
    this.#times = new Float64Array(length);
    this.#values = this.#createValues(length);
    this.#head = 0;
    this.#size = 0;
  }

  append(time: number, value: number) {
    if (this.#size === this.#times.length) this.#grow();
    const slot = this.#slot(this.#size);
    this.#times[slot] = time;
    this.#values[slot] = value;
    this.#size++;
  }

  dropOldest() {
    if (this.#size === 0) return;
    this.#head = this.#slot(1);
    this.#size--;
  }

  keepNewest(count: number) {
    if (this.#size <= count) return;
    this.#head = this.#slot(this.#size - count);
    this.#size = count;
  }

  #slot(index: number): number {
    return (this.#head + index) % this.#times.length;
  }

  // Never capped: a window must hold all it covers - shortening it would give a
  // wrong reading, not a smaller one. Eviction reuses the freed slots.
  #grow() {
    const times = new Float64Array(this.#times.length * 2);
    const values = this.#createValues(this.#values.length * 2);
    for (let i = 0; i < this.#size; i++) {
      times[i] = this.timeAt(i);
      values[i] = this.valueAt(i);
    }
    this.#times = times;
    this.#values = values;
    this.#head = 0;
  }
}

export { SampleRing };
