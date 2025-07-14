import type { ReactElement } from 'react';
import { Button } from 'react-bootstrap';
import { FaMapMarkerAlt, FaPencilAlt } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { convertToDrawing } from '../actions/mainActions.js';
import { useAppSelector } from '../hooks/useAppSelector.js';
import { useMessages } from '../l10nInjector.js';
import { LongPressTooltip } from './LongPressTooltip.js';
import { Selection } from './Selection.js';

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
