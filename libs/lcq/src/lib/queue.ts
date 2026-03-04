import { DEBUG_MODE, HEARTRATE, MAX_CONCURRENCY, THRESHOLD } from './config.js';

/** Configuration options for the Queue. */
export type QueueConfig = {
  /** Maximum number of promises that can be in-flight concurrently. */
  maxConcurrency?: number;
  /** Time in milliseconds after which the queue stops processing. */
  threshold?: number;
};

/** A callable that returns a Promise, representing a unit of work in the queue. */
export type QueueItem = {
  (): Promise<void>;
};

/** Pauses execution for one heartbeat interval. */
async function sleep() {
  await new Promise((resolve) => setTimeout(resolve, HEARTRATE));
}

/**
 * Logs arguments to the console when `DEBUG_MODE` is enabled.
 * @param args - Values to log.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function debug(...args: any[]) {
  if (!DEBUG_MODE) return;
  console.log(...args);
}

/**
 * A rate-limited, concurrency-controlled async task queue.
 *
 * Enqueue async tasks with `add()`, then call `start()` to begin processing.
 * The queue respects `maxConcurrency` (maximum simultaneous in-flight tasks)
 * and `threshold` (maximum run duration before stopping).
 */
export class Queue {
  /** Pending tasks waiting to be executed. */
  items: QueueItem[] = [];
  /** Maximum number of tasks allowed to run concurrently. */
  maxConcurrency = MAX_CONCURRENCY;
  /** Maximum duration in milliseconds before the queue stops processing. */
  threshold = THRESHOLD;

  //#region private members
  #isExecuting = false;
  #startTimestamp = -Infinity;
  #nConcurrency = 0;

  /** Returns `true` if the queue has been running longer than `threshold`. */
  #isThresholdExceeded(): boolean {
    return Date.now() - this.#startTimestamp > this.threshold;
  }

  /** Returns `true` if the queue loop should exit (stopped or threshold exceeded). */
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
   * Creates a new Queue instance.
   * @param config - Optional configuration to override defaults.
   * @param config.maxConcurrency - Maximum number of tasks allowed to run concurrently.
   * @param config.threshold - Maximum duration in milliseconds before the queue stops processing.
   */
  constructor({ maxConcurrency, threshold }: QueueConfig) {
    if (maxConcurrency) this.maxConcurrency = maxConcurrency;
    if (threshold) this.threshold = threshold;
  }

  /**
   * Appends one or more tasks to the queue.
   * @param items - Tasks to enqueue.
   */
  add(...items: QueueItem[]) {
    this.items.push(...items);
  }

  /** Removes all pending tasks from the queue. */
  clear() {
    this.items.length = 0;
  }

  /** Signals the queue to stop processing after the current task completes. */
  stop() {
    this.#isExecuting = false;
  }

  /**
   * Starts processing queued tasks.
   * Resolves when all tasks have completed or the queue is stopped/threshold exceeded.
   * No-ops if the queue is already running.
   */
  async start() {
    if (this.#isExecuting) return;
    this.#isExecuting = true;
    this.#nConcurrency = 0;
    await this.#run();
    this.#isExecuting = false;
  }
}
