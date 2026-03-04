# lcq — Limited Concurrency Queue

A lightweight async task queue for JavaScript/TypeScript that limits the number of promises running concurrently.

## Motivation

JavaScript is single-threaded, but async operations can pile up quickly. When firing off many concurrent async tasks — such as batch HTTP requests — you risk overwhelming the target or exhausting system resources. `lcq` lets you cap how many tasks run at the same time.

**Example use case:** Send 1,000 HTTP requests to an API without DoS-ing the server by processing them 10 at a time.

## Installation

```ts
import { lcq, Queue } from '@gwgs/lcq';
```

## Usage

### `lcq(config?)` — factory function

The easiest way to create a queue:

```ts
import { lcq } from '@gwgs/lcq';

const queue = lcq({ maxConcurrency: 5 });

queue.add(
  () => fetch('/api/item/1').then(() => {}),
  () => fetch('/api/item/2').then(() => {}),
  () => fetch('/api/item/3').then(() => {})
);

await queue.start();
```

### `Queue` — class

Use directly if you prefer instantiation:

```ts
import { Queue } from '@gwgs/lcq';

const queue = new Queue({ maxConcurrency: 5, threshold: 10_000 });

queue.add(() => someAsyncTask());
await queue.start();
```

## API

### `lcq(config?): Queue`

Factory function. Returns a new `Queue` instance.

### `new Queue(config?)`

| Option           | Type     | Default    | Description                                                  |
| ---------------- | -------- | ---------- | ------------------------------------------------------------ |
| `maxConcurrency` | `number` | `10`       | Maximum number of tasks running concurrently.                |
| `threshold`      | `number` | `Infinity` | Maximum run duration in milliseconds before the queue stops. |

### Instance methods

| Method          | Description                                                                |
| --------------- | -------------------------------------------------------------------------- |
| `add(...items)` | Appends one or more tasks to the queue.                                    |
| `start()`       | Begins processing. Resolves when all tasks finish or the queue is stopped. |
| `stop()`        | Signals the queue to stop after the current task completes.                |
| `clear()`       | Removes all pending tasks from the queue.                                  |
