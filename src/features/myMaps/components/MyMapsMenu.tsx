import { clearMapFeatures, setActiveModal } from '@app/store/actions.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { LongPressTooltip } from '@shared/components/LongPressTooltip.js';
import { Toolbar } from '@shared/components/Toolbar.js';
import { fixedPopperConfig } from '@shared/fixedPopperConfig.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { usePersistentBoolean } from '@shared/hooks/usePersistentBoolean.js';
import { useScrollClasses } from '@shared/hooks/useScrollClasses.js';
import type { ReactElement } from 'react';
import { Button, ButtonGroup, ButtonToolbar, Dropdown } from 'react-bootstrap';
import {
  FaAngleLeft,
  FaAngleRight,
  FaEraser,
  FaRegMap,
  FaSave,
  FaUnlink,
} from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { mapsDisconnect, mapsSave } from '../model/actions.js';
import { useMyMapsMessages } from '../translations/useMyMapsMessages.js';

export function MyMapsMenu(): ReactElement {
  const m = useMessages();

  const mm = useMyMapsMessages();

  const activeMap = useAppSelector((state) => state.myMaps.activeMap);

  const dispatch = useDispatch();

  const sc = useScrollClasses('horizontal');

  const [hidden, setHidden] = usePersistentBoolean('fm.myMapsMenu.collapsed');

  return (
    <div className="fm-ib-scroller fm-ib-scroller-top" ref={sc}>
      <div />

      <Toolbar className="mt-2">
        <ButtonToolbar>
          <LongPressTooltip breakpoint="xl" label={m?.tools.myMaps}>
            {({ labelClassName, props }) => (
              <Button
                variant="primary"
                onClick={() => dispatch(setActiveModal({ type: 'my-maps' }))}
                {...props}
              >
                <FaRegMap />
                <span className={labelClassName} />
              </Button>
            )}
          </LongPressTooltip>

          <span className="align-self-center mx-1">
            {m?.tools.myMap}: <b>{activeMap?.name ?? '???'}</b>
          </span>

          {!hidden && activeMap?.canWrite && (
            <LongPressTooltip breakpoint="xl" label={mm?.save}>
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

          {!hidden && (
            <LongPressTooltip breakpoint="xl" label={mm?.disconnect}>
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
                      <FaEraser /> {mm?.disconnectAndClear}
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              )}
            </LongPressTooltip>
          )}

          <LongPressTooltip
            label={hidden ? m?.general.expand : m?.general.collapse}
          >
            {({ props }) => (
              <Button
                className="ms-1"
                variant="dark"
                onClick={() => setHidden((hidden) => !hidden)}
                {...props}
              >
                {hidden ? <FaAngleRight /> : <FaAngleLeft />}
              </Button>
            )}
          </LongPressTooltip>
        </ButtonToolbar>
      </Toolbar>
    </div>
  );
}
