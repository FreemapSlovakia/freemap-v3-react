import { clearMapFeatures, setActiveModal } from '@app/store/actions.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { LongPressTooltip } from '@shared/components/LongPressTooltip.js';
import { Toolbar } from '@shared/components/Toolbar.js';
import { fixedPopperConfig } from '@shared/fixedPopperConfig.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useScrollClasses } from '@shared/hooks/useScrollClasses.js';
import type { ReactElement } from 'react';
import { Button, ButtonGroup, ButtonToolbar, Dropdown } from 'react-bootstrap';
import { FaEraser, FaRegMap, FaSave, FaUnlink } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { mapsDisconnect, mapsSave } from '../model/actions.js';

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
              <Dropdown as={ButtonGroup} align="end" {...props}>
                <Button
                  className="ms-1"
                  variant="secondary"
                  onClick={() => dispatch(mapsDisconnect())}
                >
                  <FaUnlink />
                  <span className={labelClassName}> {label}</span>
                </Button>

                <Dropdown.Toggle
                  split
                  variant="secondary"
                  id="dropdown-split-basic"
                />

                <Dropdown.Menu popperConfig={fixedPopperConfig}>
                  <Dropdown.Item
                    onClick={() => {
                      dispatch(mapsDisconnect());
                      dispatch(clearMapFeatures());
                    }}
                  >
                    <FaEraser /> {m?.maps.disconnectAndClear}
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            )}
          </LongPressTooltip>
        </ButtonToolbar>
      </Toolbar>
    </div>
  );
}
