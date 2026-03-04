import { Queue } from './queue.js';
import { lcq } from './lcq.js';

describe('lcq', () => {
  it('should work', () => {
    expect(lcq()).toBeInstanceOf(Queue);
  });
});
