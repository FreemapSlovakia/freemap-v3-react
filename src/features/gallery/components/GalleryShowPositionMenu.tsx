import { useMessages } from '@features/l10n/l10nInjector.js';
import { ActionIcon, Button } from '@mantine/core';
import { MantineLongPressTooltip } from '@shared/components/MantineLongPressTooltip.js';
import { Toolbar } from '@shared/components/Toolbar.js';
import { type ReactElement, useCallback } from 'react';
import { FaChevronLeft } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { galleryCancelShowOnTheMap } from '../model/actions.js';

export default GalleryShowPositionMenu;

export function GalleryShowPositionMenu(): ReactElement | null {
  const m = useMessages();

  const dispatch = useDispatch();

  const close = useCallback(() => {
    dispatch(galleryCancelShowOnTheMap());
  }, [dispatch]);

  return (
    <Toolbar className="mt-2">
      <MantineLongPressTooltip
        breakpoint="sm"
        label={m?.general.back}
        kbd="Esc"
      >
        {({ label, labelHidden, kbdEl, props }) =>
          labelHidden ? (
            <ActionIcon
              variant="filled"
              size="input-sm"
              onClick={close}
              {...props}
            >
              <FaChevronLeft />
            </ActionIcon>
          ) : (
            <Button
              size="sm"
              leftSection={<FaChevronLeft />}
              rightSection={kbdEl}
              onClick={close}
              {...props}
            >
              {label}
            </Button>
          )
        }
      </MantineLongPressTooltip>
    </Toolbar>
  );
}
