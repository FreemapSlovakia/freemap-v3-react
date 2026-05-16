import { useMessages } from '@features/l10n/l10nInjector.js';
import { ActionIcon, Button } from '@mantine/core';
import { MantineLongPressTooltip } from '@shared/components/MantineLongPressTooltip.js';
import { Toolbar } from '@shared/components/Toolbar.js';
import type { ReactElement } from 'react';
import { FaCheck, FaTimes } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import {
  galleryConfirmPickedPosition,
  gallerySetItemForPositionPicking,
} from '../model/actions.js';

export default GalleryPositionPickingMenu;

export function GalleryPositionPickingMenu(): ReactElement | null {
  const m = useMessages();

  const dispatch = useDispatch();

  return (
    <div>
      <Toolbar className="mt-2">
        <div className="m-2">{m?.gallery.locationPicking.title}</div>

        <MantineLongPressTooltip breakpoint="sm" label={m?.general.ok}>
          {({ label, labelHidden, props }) =>
            labelHidden ? (
              <ActionIcon
                className="me-1"
                variant="filled"
                size="input-sm"
                onClick={() => dispatch(galleryConfirmPickedPosition())}
                {...props}
              >
                <FaCheck />
              </ActionIcon>
            ) : (
              <Button
                className="me-1"
                size="sm"
                leftSection={<FaCheck />}
                onClick={() => dispatch(galleryConfirmPickedPosition())}
                {...props}
              >
                {label}
              </Button>
            )
          }
        </MantineLongPressTooltip>

        <MantineLongPressTooltip
          breakpoint="sm"
          label={m?.general.cancel}
          kbd="Esc"
        >
          {({ label, labelHidden, kbdEl, props }) =>
            labelHidden ? (
              <ActionIcon
                variant="filled"
                size="input-sm"
                onClick={() => dispatch(gallerySetItemForPositionPicking(null))}
                {...props}
              >
                <FaTimes />
              </ActionIcon>
            ) : (
              <Button
                size="sm"
                leftSection={<FaTimes />}
                rightSection={kbdEl}
                onClick={() => dispatch(gallerySetItemForPositionPicking(null))}
                {...props}
              >
                {label}
              </Button>
            )
          }
        </MantineLongPressTooltip>
      </Toolbar>
    </div>
  );
}
