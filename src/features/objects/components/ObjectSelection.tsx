import { convertToDrawing } from '@app/store/actions.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { LongPressTooltip } from '@shared/components/LongPressTooltip.js';
import { Selection } from '@shared/components/Selection.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import type { ReactElement } from 'react';
import { Button } from 'react-bootstrap';
import { FaMapMarkerAlt, FaPencilAlt } from 'react-icons/fa';
import { useDispatch } from 'react-redux';

export default ObjectSelection;

export function ObjectSelection(): ReactElement {
  const dispatch = useDispatch();

  const m = useMessages();

  const selection = useAppSelector((state) => state.main.selection);

  return (
    <Selection icon={<FaMapMarkerAlt />} label={m?.selections.objects}>
      <LongPressTooltip breakpoint="sm" label={m?.general.convertToDrawing}>
        {({ label, labelClassName, props }) => (
          <Button
            className="ms-1"
            variant="secondary"
            onClick={() => {
              if (selection?.type === 'objects') {
                dispatch(convertToDrawing(selection));
              }
            }}
            {...props}
          >
            <FaPencilAlt />
            <span className={labelClassName}> {label}</span>
          </Button>
        )}
      </LongPressTooltip>
    </Selection>
  );
}
