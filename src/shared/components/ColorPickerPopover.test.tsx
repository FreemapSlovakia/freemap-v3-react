import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { describe, expect, it, vi } from 'vitest';
import { ColorPickerPopover } from './ColorPickerPopover.js';

(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

describe('ColorPickerPopover', () => {
  it('closes on Escape, telling its owner, and keeps the key to itself', () => {
    const onHide = vi.fn();

    const behind = vi.fn();

    document.addEventListener('keydown', behind);

    const host = document.createElement('div');

    document.body.append(host);

    const root = createRoot(host);

    act(() =>
      root.render(
        <ColorPickerPopover swatch="red" onHide={onHide}>
          <div id="picker" />
        </ColorPickerPopover>,
      ),
    );

    act(() => host.querySelector('button')!.click());

    expect(document.getElementById('picker')).not.toBeNull();

    act(() => {
      document.body.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
      );
    });

    expect(onHide).toHaveBeenCalledTimes(1);
    expect(behind).not.toHaveBeenCalled();

    act(() => root.unmount());

    document.removeEventListener('keydown', behind);

    host.remove();
  });
});
