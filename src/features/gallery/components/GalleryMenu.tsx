import { saveSettings, setActiveModal } from '@app/store/actions.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { mapToggleLayer } from '@features/map/model/actions.js';
import { Checkbox } from '@shared/components/Checkbox.js';
import { useConfirm } from '@shared/components/ConfirmProvider.js';
import { LongPressTooltip } from '@shared/components/LongPressTooltip.js';
import { Toolbar } from '@shared/components/Toolbar.js';
import { fixedPopperConfig } from '@shared/fixedPopperConfig.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { usePersistentBoolean } from '@shared/hooks/usePersistentBoolean.js';
import { useScrollClasses } from '@shared/hooks/useScrollClasses.js';
import { useCallback } from 'react';
import { Button, ButtonGroup, ButtonToolbar, Dropdown } from 'react-bootstrap';
import {
  FaAngleLeft,
  FaAngleRight,
  FaBook,
  FaCamera,
  FaCog,
  FaDove,
  FaEnvelope,
  FaFilter,
  FaGem,
  FaInfo,
  FaLocationArrow,
  FaPalette,
  FaTimes,
  FaTrophy,
  FaUpload,
} from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import {
  GalleryColorizeBy,
  GalleryListOrder,
  galleryAllPremiumOrFree,
  galleryColorizeBy,
  galleryList,
  galleryToggleDirection,
  galleryToggleLegend,
} from '../model/actions.js';
import { useGalleryMessages } from '../translations/useGalleryMessages.js';
import { PictureLegend } from './PictureLegend.js';

export default function GalleryMenu() {
  const sc = useScrollClasses('horizontal');

  const m = useMessages();

  const gm = useGalleryMessages();

  const dispatch = useDispatch();

  const confirm = useConfirm();

  const colorizeBy = useAppSelector(
    (state) => state.gallery.colorizeBy ?? 'disable',
  );

  const showDirection = useAppSelector((state) => state.gallery.showDirection);

  const showLegend = useAppSelector((state) => state.gallery.showLegend);

  const sendGalleryEmails = useAppSelector(
    (state) => state.auth.user?.sendGalleryEmails,
  );

  const filterIsActive = useAppSelector(
    (state) =>
      Object.values(state.gallery.filter).filter((v) => v !== undefined)
        .length > 0,
  );

  const handleMoreSelect = useCallback(
    async (eventKey: string | null) => {
      if (!eventKey) {
        // nothing
      } else if (eventKey.startsWith('all-')) {
        if (
          await confirm({
            title: gm?.allMyPhotos.title,
            message:
              eventKey === 'all-premium'
                ? gm?.allMyPhotos.confirmPremium
                : gm?.allMyPhotos.confirmFree,
            icon: eventKey === 'all-premium' ? <FaGem /> : <FaDove />,
            confirmLabel: m?.general.yes,
            cancelLabel: m?.general.no,
          })
        ) {
          dispatch(
            galleryAllPremiumOrFree(eventKey.slice(4) as 'premium' | 'free'),
          );
        }
      } else if (eventKey === 'emails') {
        dispatch(
          saveSettings({
            user: {
              sendGalleryEmails: !sendGalleryEmails,
            },
          }),
        );
      } else if (eventKey === 'direction') {
        dispatch(galleryToggleDirection());
      } else if (eventKey === 'legend') {
        dispatch(galleryToggleLegend());
      }
    },
    [dispatch, sendGalleryEmails, confirm, m, gm],
  );

  const [hidden, setHidden] = usePersistentBoolean('fm.galleryMenu.collapsed');

  return (
    <>
      <div className="fm-ib-scroller fm-ib-scroller-top" ref={sc}>
        <div />

        <Toolbar className="mt-2">
          <ButtonToolbar>
            <LongPressTooltip label={m?.tools.photos} breakpoint="sm">
              {({ props, label, labelClassName }) => (
                <span className="align-self-center ms-1" {...props}>
                  <FaCamera /> <span className={labelClassName}>{label}</span>
                </span>
              )}
            </LongPressTooltip>

            {!hidden && (
              <>
                <LongPressTooltip label={gm?.upload} kbd="p u" breakpoint="md">
                  {({ props, label, labelClassName }) => (
                    <Button
                      type="button"
                      variant="secondary"
                      className="ms-1"
                      onClick={() =>
                        dispatch(setActiveModal({ type: 'gallery-upload' }))
                      }
                      {...props}
                    >
                      <FaUpload />{' '}
                      <span className={labelClassName}>{label}</span>
                    </Button>
                  )}
                </LongPressTooltip>

                <LongPressTooltip label={gm?.filter} kbd="p f" breakpoint="lg">
                  {({ props, label, labelClassName }) => (
                    <Button
                      type="button"
                      className="ms-1"
                      variant="secondary"
                      onClick={() =>
                        dispatch(setActiveModal({ type: 'gallery-filter' }))
                      }
                      active={filterIsActive}
                      {...props}
                    >
                      <FaFilter />{' '}
                      <span className={labelClassName}>{label}</span>
                    </Button>
                  )}
                </LongPressTooltip>

                <Dropdown
                  className="ms-1"
                  onSelect={(colorizeBy) =>
                    dispatch(
                      galleryColorizeBy(
                        colorizeBy === 'disable'
                          ? null
                          : (colorizeBy as GalleryColorizeBy),
                      ),
                    )
                  }
                >
                  <LongPressTooltip
                    label={gm?.c[colorizeBy ?? 'disable']}
                    name={gm?.colorizeBy}
                    breakpoint="sm"
                  >
                    {({ props, label, labelClassName }) => (
                      <Dropdown.Toggle variant="secondary" {...props}>
                        <FaPalette />{' '}
                        <span className={labelClassName}>{label}</span>
                      </Dropdown.Toggle>
                    )}
                  </LongPressTooltip>

                  <Dropdown.Menu popperConfig={fixedPopperConfig}>
                    {(
                      Object.keys(gm?.c ?? {}) as (
                        | GalleryColorizeBy
                        | 'disable'
                      )[]
                    ).map((by) => (
                      <Dropdown.Item
                        eventKey={by}
                        key={by}
                        title={gm?.c[by]}
                        active={colorizeBy === by}
                      >
                        {gm?.c[by] ?? '…'}
                      </Dropdown.Item>
                    ))}
                  </Dropdown.Menu>
                </Dropdown>

                <Dropdown
                  className="ms-1"
                  onSelect={(listBy) =>
                    dispatch(galleryList(listBy as GalleryListOrder))
                  }
                >
                  <LongPressTooltip label={gm?.showPhotosFrom} breakpoint="md">
                    {({ props, label, labelClassName }) => (
                      <Dropdown.Toggle variant="secondary" {...props}>
                        <FaBook />{' '}
                        <span className={labelClassName}>{label}</span>
                      </Dropdown.Toggle>
                    )}
                  </LongPressTooltip>

                  <Dropdown.Menu popperConfig={fixedPopperConfig}>
                    {(Object.keys(gm?.f ?? {}) as GalleryListOrder[]).map(
                      (key) => (
                        <Dropdown.Item as="button" eventKey={key}>
                          {gm?.f[key]}{' '}
                          {key === '-createdAt' && (
                            <>
                              <kbd>p</kbd> <kbd>l</kbd>
                            </>
                          )}
                        </Dropdown.Item>
                      ),
                    )}
                  </Dropdown.Menu>
                </Dropdown>

                <LongPressTooltip
                  label={gm?.stats.leaderboard}
                  kbd="p b"
                  breakpoint="lg"
                >
                  {({ props, label, labelClassName }) => (
                    <Button
                      type="button"
                      className="ms-1"
                      variant="secondary"
                      onClick={() =>
                        dispatch(
                          setActiveModal({ type: 'gallery-leaderboard' }),
                        )
                      }
                      active={filterIsActive}
                      {...props}
                    >
                      <FaTrophy />{' '}
                      <span className={labelClassName}>{label}</span>
                    </Button>
                  )}
                </LongPressTooltip>

                <Dropdown
                  className="ms-1"
                  id="more"
                  onSelect={handleMoreSelect}
                >
                  <Dropdown.Toggle variant="secondary">
                    <FaCog />
                  </Dropdown.Toggle>

                  <Dropdown.Menu popperConfig={fixedPopperConfig}>
                    <Dropdown.Item as="button" eventKey="legend">
                      <Checkbox value={showLegend} /> <FaInfo />{' '}
                      {gm?.showLegend}
                    </Dropdown.Item>

                    <Dropdown.Item as="button" eventKey="direction">
                      <Checkbox value={showDirection} /> <FaLocationArrow />{' '}
                      {gm?.showDirection}
                    </Dropdown.Item>

                    {sendGalleryEmails !== undefined && (
                      <>
                        <Dropdown.Item as="button" eventKey="emails">
                          <Checkbox value={sendGalleryEmails} /> <FaEnvelope />{' '}
                          {gm?.sendGalleryEmails}
                        </Dropdown.Item>

                        <Dropdown.Divider />

                        <Dropdown.Item as="button" eventKey="all-premium">
                          <FaGem /> {gm?.allMyPhotos.premium}
                        </Dropdown.Item>

                        <Dropdown.Item as="button" eventKey="all-free">
                          <FaDove /> {gm?.allMyPhotos.free}
                        </Dropdown.Item>
                      </>
                    )}
                  </Dropdown.Menu>
                </Dropdown>
              </>
            )}

            <ButtonGroup className="ms-1">
              <LongPressTooltip
                label={hidden ? m?.general.expand : m?.general.collapse}
              >
                {({ props }) => (
                  <Button
                    variant={hidden ? 'primary' : 'dark'}
                    onClick={() => setHidden((hidden) => !hidden)}
                    {...props}
                  >
                    {hidden ? <FaAngleRight /> : <FaAngleLeft />}
                  </Button>
                )}
              </LongPressTooltip>

              {!hidden && (
                <LongPressTooltip label={m?.general.close}>
                  {({ props }) => (
                    <Button
                      variant="dark"
                      onClick={() =>
                        dispatch(mapToggleLayer({ type: 'I', enable: false }))
                      }
                      {...props}
                    >
                      <FaTimes />
                    </Button>
                  )}
                </LongPressTooltip>
              )}
            </ButtonGroup>
          </ButtonToolbar>
        </Toolbar>
      </div>

      {showLegend && <PictureLegend />}
    </>
  );
}
