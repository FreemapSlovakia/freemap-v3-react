import { clearMapFeatures, setActiveModal } from '@app/store/actions.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { toastsAdd } from '@features/toasts/model/actions.js';
import { useBreakpointMatches } from '@shared/breakpoints.js';
import { useConfirm } from '@shared/components/ConfirmProvider.js';
import { FmDropdownMenu } from '@shared/components/FmDropdownMenu.js';
import { LongPressTooltip } from '@shared/components/LongPressTooltip.js';
import { Toolbar } from '@shared/components/Toolbar.js';
import { UnsavedWarningIcon } from '@shared/components/UnsavedWarningIcon.js';
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
import {
  mapsDisconnect,
  mapsLoad,
  mapsResolveOutbox,
  mapsSave,
} from '../model/actions.js';
import {
  activeMapBlockedSelector,
  mapDirtySelector,
} from '../model/selectors.js';
import { loadMyMapsMessages } from '../translations/loadMyMapsMessages.js';
import { useMyMapsMessages } from '../translations/useMyMapsMessages.js';
import { MapSyncStatus } from './MapSyncStatus.js';
import classes from './MyMapsMenu.module.css';

export function MyMapsMenu(): ReactElement {
  const m = useMessages();

  const mm = useMyMapsMessages();

  const activeMap = useAppSelector((state) => state.myMaps.activeMap);

  const dirty = useAppSelector(mapDirtySelector);

  const blocked = useAppSelector(activeMapBlockedSelector);

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
      if (blocked) {
        // A refused save answers a read in place of the map, so a plain load
        // would hand the local content straight back. Discarding it is what
        // getting to the stored map means while one is queued — and this
        // confirm is the one the destructive choice needs.
        dispatch(
          mapsResolveOutbox({ mapId: activeMap.id, resolution: 'discard' }),
        );

        return;
      }

      // Re-read the saved map from the backend, discarding the local edits. The
      // viewport and background layer aren't part of what counts as a change, so
      // they stay as they are.
      dispatch(
        mapsLoad({ id: activeMap.id, ignoreMap: true, ignoreLayers: true }),
      );
    }
  }, [activeMap, blocked, confirm, mm, dispatch]);

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

  const { sm } = useBreakpointMatches();

  const mapName = activeMap?.name ?? '???';

  const [hidden, setHidden] = usePersistentBoolean('fm.myMapsMenu.collapsed');

  return (
    <div className="fm-ib-scroller fm-ib-scroller-top" ref={sc}>
      <div />

      <Toolbar className="mt-2">
        <ButtonToolbar>
          <LongPressTooltip
            breakpoint="xl"
            label={
              // Below `sm` the readout next to the button is hidden, so the
              // tooltip is the only place left to tell which map is active.
              sm ? (
                m?.tools.myMaps
              ) : (
                <>
                  {m?.tools.myMaps} ({mapName})
                </>
              )
            }
          >
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

          {/* The readout is capped and ellipsized, and below `md` it drops the
              prefix, so the tooltip carries the whole thing unabbreviated. */}
          <LongPressTooltip
            label={
              <>
                {m?.tools.myMap}: {mapName}
              </>
            }
          >
            {({ props }) => (
              <span
                className={`${classes['name']} ps-1 align-self-center d-none d-sm-inline-block text-truncate`}
                {...props}
              >
                <span className="d-none d-md-inline">{m?.tools.myMap}: </span>

                <b>{mapName}</b>
              </span>
            )}
          </LongPressTooltip>

          {dirty && (
            <UnsavedWarningIcon
              label={mm?.unsaved}
              tooltip={mm?.unsavedTooltip}
            />
          )}

          {activeMap && <MapSyncStatus mapId={activeMap.id} as="icon" />}

          {!hidden && (
            <LongPressTooltip breakpoint="xl" label={mm?.save}>
              {({ label, labelClassName, props }) => (
                <Button
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
                <Button variant="secondary" onClick={handleReload} {...props}>
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

                  <FmDropdownMenu>
                    <Dropdown.Item
                      as="button"
                      onClick={() => {
                        dispatch(mapsDisconnect());
                        dispatch(clearMapFeatures());
                      }}
                    >
                      <FaEraser /> {mm?.disconnectAndClear}
                    </Dropdown.Item>
                  </FmDropdownMenu>
                </Dropdown>
              )}
            </LongPressTooltip>
          )}

          <LongPressTooltip
            label={hidden ? m?.general.expand : m?.general.collapse}
          >
            {({ props }) => (
              <Button
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
