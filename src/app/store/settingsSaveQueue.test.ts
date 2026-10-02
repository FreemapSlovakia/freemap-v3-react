import { describe, expect, it } from 'vitest';
import { queueSettingsSave } from './settingsSaveQueue.js';

describe('queueSettingsSave', () => {
  it('runs saves one after another, past a failure', async () => {
    const order: string[] = [];

    const slow = queueSettingsSave(async () => {
      await new Promise((resolve) => setTimeout(resolve, 20));

      order.push('slow');

      throw new Error('failed');
    });

    const fast = queueSettingsSave(async () => {
      order.push('fast');
    });

    await expect(slow).rejects.toThrow('failed');

    await fast;

    expect(order).toEqual(['slow', 'fast']);
  });
});
