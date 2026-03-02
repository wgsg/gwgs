import { Queue, QueueConfig } from './queue.js';

export function lcq(config?: QueueConfig) {
  return new Queue(config ?? {});
}
