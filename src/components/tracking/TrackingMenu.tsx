import React, { ReactElement, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { FontAwesomeIcon } from 'fm3/components/FontAwesomeIcon';
import Button from 'react-bootstrap/lib/Button';
import DropdownButton from 'react-bootstrap/lib/DropdownButton';
import MenuItem from 'react-bootstrap/lib/MenuItem';

import { setActiveModal } from 'fm3/actions/mainActions';
import { trackingActions } from 'fm3/actions/trackingActions';
import { useMessages } from 'fm3/l10nInjector';
import { RootState } from 'fm3/storeCreator';

export function TrackingMenu(): ReactElement {
  const m = useMessages();

  const dispatch = useDispatch();

  const visual = useSelector((state: RootState) =>
    state.tracking.showLine && state.tracking.showPoints
      ? 'line+points'
      : state.tracking.showLine
      ? 'line'
      : state.tracking.showPoints
      ? 'points'
      : undefined,
  );

  const handleVisualChange = useCallback(
    (visual: unknown) => {
      switch (visual) {
        case 'line':
          dispatch(trackingActions.setShowPoints(false));
          dispatch(trackingActions.setShowLine(true));
          break;
        case 'points':
          dispatch(trackingActions.setShowPoints(true));
          dispatch(trackingActions.setShowLine(false));
          break;
        case 'line+points':
          dispatch(trackingActions.setShowPoints(true));
          dispatch(trackingActions.setShowLine(true));
          break;
        default:
          break;
      }
    },
    [dispatch],
  );

  return (
    <>
      <Button
        onClick={() => {
          dispatch(setActiveModal('tracking-watched'));
        }}
      >
        <FontAwesomeIcon icon="eye" />
        <span className="hidden-md hidden-sm hidden-xs">
          {' '}
          {m?.tracking.trackedDevices.button}
        </span>
      </Button>{' '}
      <Button
        onClick={() => {
          dispatch(setActiveModal('tracking-my'));
        }}
      >
        <FontAwesomeIcon icon="mobile" />
        <span className="hidden-md hidden-sm hidden-xs">
          {' '}
          {m?.tracking.devices.button}
        </span>
      </Button>{' '}
      <DropdownButton
        id="tracking-visual-dropdown"
        title={visual && m?.tracking.visual[visual]}
      >
        <MenuItem eventKey="points" onSelect={handleVisualChange}>
          {m?.tracking.visual.points}
        </MenuItem>
        <MenuItem eventKey="line" onSelect={handleVisualChange}>
          {m?.tracking.visual.line}
        </MenuItem>
        <MenuItem eventKey="line+points" onSelect={handleVisualChange}>
          {m?.tracking.visual['line+points']}
        </MenuItem>
      </DropdownButton>
    </>
  );
}
