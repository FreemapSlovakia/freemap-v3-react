import { clearMapFeatures, setActiveModal } from '@app/store/actions.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { toastsAdd } from '@features/toasts/model/actions.js';
import { useConfirm } from '@shared/components/ConfirmProvider.js';
import { LongPressTooltip } from '@shared/components/LongPressTooltip.js';
import { Toolbar } from '@shared/components/Toolbar.js';
import { UnsavedWarningIcon } from '@shared/components/UnsavedWarningIcon.js';
import { fixedPopperConfig } from '@shared/fixedPopperConfig.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { usePersistentBoolean } from '@shared/hooks/usePersistentBoolean.js';
import { useScrollClasses } from '@shared/hooks/useScrollClasses.js';
import { type ReactElement, useCallback } from 'react';
import { Button, ButtonGroup, ButtonToolbar, Dropdown } from 'react-bootstrap';
import {
  FaAngleLeft,
  FaAngleRight,
  FaEraser,
  FaRegMap,
  FaSave,
  FaSync,
  FaUnlink,
} from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { mapsDisconnect, mapsLoad, mapsSave } from '../model/actions.js';
import { mapDirtySelector } from '../model/selectors.js';
import { loadMyMapsMessages } from '../translations/loadMyMapsMessages.js';
import { useMyMapsMessages } from '../translations/useMyMapsMessages.js';

export function MyMapsMenu(): ReactElement {
  const m = useMessages();

  const mm = useMyMapsMessages();

  const activeMap = useAppSelector((state) => state.myMaps.activeMap);

  const dirty = useAppSelector(mapDirtySelector);

  const loggedIn = useAppSelector((state) => Boolean(state.auth.user));

  const dispatch = useDispatch();

  const confirm = useConfirm();

  const handleReload = useCallback(async () => {
    if (
      activeMap &&
      (await confirm({
        title: mm?.reload,
        message: mm?.reloadConfirm,
        confirmLabel: mm?.reload,
      }))
    ) {
      // Re-read the saved map from the backend, discarding the local edits. The
      // viewport and background layer aren't part of what counts as a change, so
      // they stay as they are.
      dispatch(
        mapsLoad({ id: activeMap.id, ignoreMap: true, ignoreLayers: true }),
      );
    }
  }, [activeMap, confirm, mm, dispatch]);

  const handleSave = useCallback(() => {
    if (activeMap?.canWrite) {
      // Owner/editor: overwrite the map in place.
      dispatch(mapsSave(undefined));
    } else if (loggedIn) {
      // Read-only map (someone else's): the add-map form saves the current
      // state — including any local edits — as the user's own copy.
      dispatch(setActiveModal({ type: 'my-maps', add: true }));
    } else {
      dispatch(
        toastsAdd({
          id: 'myMaps.loginToSave',
          messageKey: 'loginToSave',
          messageLoader: loadMyMapsMessages,
          style: 'warning',
          actions: [
            {
              action: setActiveModal({ type: 'login' }),
              nameKey: 'mainMenu.logIn',
              variant: 'primary',
            },
          ],
        }),
      );
    }
  }, [activeMap?.canWrite, loggedIn, dispatch]);

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

          {dirty && (
            <UnsavedWarningIcon
              label={mm?.unsaved}
              tooltip={mm?.unsavedTooltip}
            />
          )}

          {!hidden && (
            <LongPressTooltip breakpoint="xl" label={mm?.save}>
              {({ label, labelClassName, props }) => (
                <Button
                  className="ms-1"
                  variant={dirty ? 'primary' : 'secondary'}
                  onClick={handleSave}
                  {...props}
                >
                  <FaSave />
                  <span className={labelClassName}> {label}</span>
                </Button>
              )}
            </LongPressTooltip>
          )}

          {!hidden && dirty && (
            <LongPressTooltip breakpoint="xl" label={mm?.reload}>
              {({ label, labelClassName, props }) => (
                <Button
                  className="ms-1"
                  variant="secondary"
                  onClick={handleReload}
                  {...props}
                >
                  <FaSync />
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
