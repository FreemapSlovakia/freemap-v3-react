import { convertToDrawing } from '@app/store/actions.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { ActionIcon, Button } from '@mantine/core';
import { MantineLongPressTooltip } from '@shared/components/MantineLongPressTooltip.js';
import { Selection } from '@shared/components/Selection.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import type { ReactElement } from 'react';
import { FaMapMarkerAlt, FaPencilAlt } from 'react-icons/fa';
import { useDispatch } from 'react-redux';

export default ObjectSelection;

export function ObjectSelection(): ReactElement {
  const dispatch = useDispatch();

  const m = useMessages();

  const selection = useAppSelector((state) => state.main.selection);

  return (
    <Selection icon={<FaMapMarkerAlt />} label={m?.selections.objects}>
      <MantineLongPressTooltip
        breakpoint="sm"
        label={m?.general.convertToDrawing}
      >
        {({ label, labelHidden, props }) =>
          labelHidden ? (
            <ActionIcon
              className="ms-1"
              variant="filled"
              color="gray"
              size="input-sm"
              onClick={() => {
                if (selection?.type === 'objects') {
                  dispatch(convertToDrawing(selection));
                }
              }}
              {...props}
            >
              <FaPencilAlt />
            </ActionIcon>
          ) : (
            <Button
              className="ms-1"
              color="gray"
              size="sm"
              leftSection={<FaPencilAlt />}
              onClick={() => {
                if (selection?.type === 'objects') {
                  dispatch(convertToDrawing(selection));
                }
              }}
              {...props}
            >
              {label}
            </Button>
          )
        }
      </MantineLongPressTooltip>
    </Selection>
  );
}
