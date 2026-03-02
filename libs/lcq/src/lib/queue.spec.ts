import { Queue, debug } from './queue.js';

const sleep = async (ms: number) => {
  await new Promise((resolve) => setTimeout(resolve, ms));
};

describe('Queue', () => {
  it('should respect FIFO', async () => {
    const order: number[] = [];
    const queue = new Queue({ maxConcurrency: 3 });
    for (let i = 1; i < 10; i++) {
      queue.add(async () => {
        debug(i);
        order.push(i);
        await sleep(50);
      });
    }

    await queue.start();
    expect(order).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  });

  it('should prevent new requests when .stop is called', async () => {
    const order: number[] = [];
    const queue = new Queue({ maxConcurrency: 3 });
    for (let i = 1; i < 10; i++) {
      queue.add(async () => {
        debug(i);
        order.push(i);
        if (i === 4) queue.stop();
        await sleep(50);
      });
    }

    await queue.start();
    expect(order).toEqual([1, 2, 3, 4]);
  });

  it('should allow adding items to the queue while processing', async () => {
    const order: number[] = [];
    const queue = new Queue({ maxConcurrency: 3 });
    const itemFactory = (i: number) => async () => {
      order.push(i);
      if (i < 10) queue.add(itemFactory(i + 10));
      await sleep(50);
    };
    for (let i = 0; i < 10; i++) {
      queue.add(itemFactory(i));
    }

    await queue.start();

    expect(order).toEqual([
      0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19,
    ]);
  });

  it('should stop running new items when threshold is exceeded', async () => {
    const order: number[] = [];
    const queue = new Queue({ maxConcurrency: 4, threshold: 49 });
    for (let i = 1; i < 10; i++) {
      queue.add(async () => {
        order.push(i);
        await sleep(50);
      });
    }

    await queue.start();

    expect(order).toEqual([1, 2, 3, 4]);
  });
});
