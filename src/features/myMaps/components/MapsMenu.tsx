import { clearMapFeatures, setActiveModal } from '@app/store/actions.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { ActionIcon, Button } from '@mantine/core';
import { LongPressTooltip } from '@shared/components/LongPressTooltip.js';
import { MantineLongPressTooltip } from '@shared/components/MantineLongPressTooltip.js';
import { Toolbar } from '@shared/components/Toolbar.js';
import { fixedPopperConfig } from '@shared/fixedPopperConfig.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useScrollClasses } from '@shared/hooks/useScrollClasses.js';
import type { ReactElement } from 'react';
import {
  ButtonGroup,
  ButtonToolbar,
  Dropdown,
  Button as RBButton,
} from 'react-bootstrap';
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
          <MantineLongPressTooltip breakpoint="xl" label={m?.tools.maps}>
            {({ label, labelHidden, props }) =>
              labelHidden ? (
                <ActionIcon
                  variant="filled"
                  size="input-sm"
                  onClick={() => dispatch(setActiveModal('maps'))}
                  {...props}
                >
                  <FaRegMap />
                </ActionIcon>
              ) : (
                <Button
                  size="sm"
                  leftSection={<FaRegMap />}
                  onClick={() => dispatch(setActiveModal('maps'))}
                  {...props}
                >
                  {label}
                </Button>
              )
            }
          </MantineLongPressTooltip>

          <span className="align-self-center mx-1">
            {activeMap?.name ?? '???'}
          </span>

          {activeMap?.canWrite && (
            <MantineLongPressTooltip breakpoint="xl" label={m?.maps.save}>
              {({ label, labelHidden, props }) =>
                labelHidden ? (
                  <ActionIcon
                    className="ms-1"
                    variant="filled"
                    color="gray"
                    size="input-sm"
                    onClick={() => dispatch(mapsSave(undefined))}
                    {...props}
                  >
                    <FaSave />
                  </ActionIcon>
                ) : (
                  <Button
                    className="ms-1"
                    color="gray"
                    size="sm"
                    leftSection={<FaSave />}
                    onClick={() => dispatch(mapsSave(undefined))}
                    {...props}
                  >
                    {label}
                  </Button>
                )
              }
            </MantineLongPressTooltip>
          )}

          <LongPressTooltip breakpoint="xl" label={m?.maps.disconnect}>
            {({ label, labelClassName, props }) => (
              <Dropdown as={ButtonGroup} align="end" {...props}>
                <RBButton
                  className="ms-1"
                  variant="secondary"
                  onClick={() => dispatch(mapsDisconnect())}
                >
                  <FaUnlink />
                  <span className={labelClassName}> {label}</span>
                </RBButton>

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
