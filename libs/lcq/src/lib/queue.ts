import { DEBUG_MODE, HEARTRATE, MAX_CONCURRENCY, THRESHOLD } from './config.js';

export type QueueConfig = {
  maxConcurrency?: number;
  threshold?: number;
};
export type QueueItem = {
  (): Promise<void>;
};

async function sleep() {
  await new Promise((resolve) => setTimeout(resolve, HEARTRATE));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function debug(...args: any[]) {
  if (!DEBUG_MODE) return;
  console.log(...args);
}

export class Queue {
  items: QueueItem[] = [];
  maxConcurrency = MAX_CONCURRENCY;
  threshold = THRESHOLD;

  //#region private members
  #isExecuting = false;
  #startTimestamp = -Infinity;
  #nConcurrency = 0;

  #isThresholdExceeded(): boolean {
    return Date.now() - this.#startTimestamp > this.threshold;
  }

  #shouldStop() {
    return !this.#isExecuting || this.#isThresholdExceeded();
  }

  /**
   * keep current process sleeping if the maximum concurrency has been met
   */
  async #concurrencyControl(): Promise<void> {
    // eslint-disable-next-line no-constant-condition
    while (true) {
      debug('concurrencyControl! ' + Date.now());
      if (this.#isThresholdExceeded()) return;
      if (this.#nConcurrency < this.maxConcurrency) return;
      debug('going to sleep...');
      await sleep();
    }
  }

  /**
   * executes the next promise
   */
  async #runNext(): Promise<void> {
    const next = this.items.shift();
    if (next === undefined) return;
    this.#nConcurrency++;
    debug('Starting next promise, #nConcurrency is now ' + this.#nConcurrency);
    Promise.resolve(next()).then(() => {
      this.#nConcurrency--;
      debug('Promise resolved, #nConcurrency is now ' + this.#nConcurrency);
    });
  }

  /**
   * execute all promises
   */
  async #run(): Promise<void> {
    this.#startTimestamp = Date.now();
    while (this.#isExecuting && this.items.length) {
      await this.#concurrencyControl();
      debug('boo');
      if (this.#shouldStop()) {
        debug('something broke');
        break;
      }
      debug(`Running next item`);
      this.#runNext();
      debug(`Item ran, queue length is now ${this.items.length}`);
    }
    while (this.#nConcurrency > 0) {
      debug('snooze');
      await sleep();
    }
  }
  //#endregion

  /**
   *
   * @param config {QueueConfig} optional config, overrides defaults
   * @param config.maxConcurrency {number} number of promises awaiting resolution
   * @param config.threshold {number} number of milliseconds until the queue should stop
   */
  constructor({ maxConcurrency, threshold }: QueueConfig) {
    if (maxConcurrency) this.maxConcurrency = maxConcurrency;
    if (threshold) this.threshold = threshold;
  }

  add(...items: QueueItem[]) {
    this.items.push(...items);
  }

  clear() {
    this.items.length = 0;
  }

  stop() {
    this.#isExecuting = false;
  }

  async start() {
    if (this.#isExecuting) return;
    this.#isExecuting = true;
    this.#nConcurrency = 0;
    await this.#run();
    this.#isExecuting = false;
  }
}
