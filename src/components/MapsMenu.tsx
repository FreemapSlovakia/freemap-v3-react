import type { ReactElement } from 'react';
import { Button, ButtonToolbar } from 'react-bootstrap';
import { FaRegMap, FaSave, FaUnlink } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { setActiveModal } from '../actions/mainActions.js';
import { mapsDisconnect, mapsSave } from '../actions/mapsActions.js';
import { useAppSelector } from '../hooks/useAppSelector.js';
import { useScrollClasses } from '../hooks/useScrollClasses.js';
import { useMessages } from '../l10nInjector.js';
import { LongPressTooltip } from './LongPressTooltip.js';
import { Toolbar } from './Toolbar.js';

export function MapsMenu(): ReactElement {
  const m = useMessages();

  const activeMap = useAppSelector((state) => state.maps.activeMap);

  const dispatch = useDispatch();

  const sc = useScrollClasses('horizontal');

  return (
    <div className="fm-ib-scroller fm-ib-scroller-top" ref={sc}>
      <div />

      <Toolbar className="mt-2">
        <ButtonToolbar>
          <LongPressTooltip breakpoint="xl" label={m?.tools.maps}>
            {({ label, labelClassName, props }) => (
              <Button
                variant="primary"
                onClick={() => dispatch(setActiveModal('maps'))}
                {...props}
              >
                <FaRegMap />
                <span className={labelClassName}> {label}</span>
              </Button>
            )}
          </LongPressTooltip>

          <span className="align-self-center mx-1">
            {activeMap?.name ?? '???'}
          </span>

          {activeMap?.canWrite && (
            <LongPressTooltip breakpoint="xl" label={m?.maps.save}>
              {({ label, labelClassName, props }) => (
                <Button
                  className="ms-1"
                  variant="secondary"
                  onClick={() => dispatch(mapsSave(undefined))}
                  {...props}
                >
                  <FaSave />
                  <span className={labelClassName}> {label}</span>
                </Button>
              )}
            </LongPressTooltip>
          )}

          <LongPressTooltip breakpoint="xl" label={m?.maps.disconnect}>
            {({ label, labelClassName, props }) => (
              <Button
                className="ms-1"
                variant="secondary"
                onClick={() => dispatch(mapsDisconnect())}
                {...props}
              >
                <FaUnlink />
                <span className={labelClassName}> {label}</span>
              </Button>
            )}
          </LongPressTooltip>
        </ButtonToolbar>
      </Toolbar>
    </div>
  );
}
