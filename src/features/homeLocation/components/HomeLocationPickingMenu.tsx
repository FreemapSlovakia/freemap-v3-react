import type { ReactElement } from 'react';
import { Button } from 'react-bootstrap';
import { FaCheck, FaTimes } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { Toolbar } from '../../../components/Toolbar.js';
import { LongPressTooltip } from '../../../components/LongPressTooltip.js';
import { useAppSelector } from '../../../hooks/useAppSelector.js';
import { useMessages } from '../../../l10nInjector.js';
import {
  saveHomeLocation,
  setSelectingHomeLocation,
} from '../model/actions.js';

export default HomeLocationPickingMenu;

export function HomeLocationPickingMenu(): ReactElement | null {
  const dispatch = useDispatch();

  const selectingHomeLocation = useAppSelector(
    (state) => state.homeLocation.selectingHomeLocation,
  );

  const m = useMessages();

  return (
    <div>
      <Toolbar className="mt-2">
        <div className="m-1">Zvoľte domovskú pozíciu</div>

        <LongPressTooltip breakpoint="sm" label={m?.general.save}>
          {({ label, labelClassName, props }) => (
            <Button
              className="ms-1"
              variant="primary"
              onClick={() => dispatch(saveHomeLocation())}
              disabled={!selectingHomeLocation}
              {...props}
            >
              <FaCheck />
              <span className={labelClassName}> {label}</span>
            </Button>
          )}
        </LongPressTooltip>

        <LongPressTooltip breakpoint="sm" label={m?.general.cancel}>
          {({ label, labelClassName, props }) => (
            <Button
              className="ms-1"
              variant="dark"
              onClick={() => dispatch(setSelectingHomeLocation(false))}
              {...props}
            >
              <FaTimes />
              <span className={labelClassName}> {label}</span>
            </Button>
          )}
        </LongPressTooltip>
      </Toolbar>
    </div>
  );
}
