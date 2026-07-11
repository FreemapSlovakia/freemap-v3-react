import { saveSettings, setActiveModal } from '@app/store/actions.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { SubmenuHeader } from '@features/mainMenu/components/SubmenuHeader.js';
import { mapToggleLayer } from '@features/map/model/actions.js';
import { LEGEND_ITEM } from '@shared/colorizers/components/legendToggleOption.js';
import { Checkbox } from '@shared/components/Checkbox.js';
import { useConfirm } from '@shared/components/ConfirmProvider.js';
import { LongPressTooltip } from '@shared/components/LongPressTooltip.js';
import { Toolbar } from '@shared/components/Toolbar.js';
import { fixedPopperConfig } from '@shared/fixedPopperConfig.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { usePersistentBoolean } from '@shared/hooks/usePersistentBoolean.js';
import { useScrollClasses } from '@shared/hooks/useScrollClasses.js';
import { useCallback, useEffect, useState } from 'react';
import { Button, ButtonGroup, ButtonToolbar, Dropdown } from 'react-bootstrap';
import type { IconType } from 'react-icons';
import {
  FaAngleLeft,
  FaAngleRight,
  FaAsterisk,
  FaBan,
  FaBook,
  FaCamera,
  FaCog,
  FaCreativeCommons,
  FaDove,
  FaEnvelope,
  FaFilter,
  FaGem,
  FaLeaf,
  FaLocationArrow,
  FaPalette,
  FaRegCheckSquare,
  FaRegComment,
  FaRegSquare,
  FaStar,
  FaTimes,
  FaTrophy,
  FaUpload,
  FaUser,
  FaUserCheck,
} from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { WIKIMEDIA_NO_DATA_MODES } from '../galleryUtils.js';
import {
  type GalleryLicense,
  LicenseBadge,
  PHOTO_LICENSES,
} from '../licenses.js';
import {
  type GalleryColorizeBy,
  GalleryColorizeBySchema,
  type GalleryListOrder,
  galleryAllOfLicense,
  galleryAllPremiumOrFree,
  galleryColorizeBy,
  galleryList,
  galleryToggleDirection,
  galleryToggleLegend,
} from '../model/actions.js';
import { useGalleryMessages } from '../translations/useGalleryMessages.js';
import { PictureLegend, pictureLegendApplies } from './PictureLegend.js';

const COLORIZE_ICONS: Record<GalleryColorizeBy, IconType> = {
  mine: FaUserCheck,
  userId: FaUser,
  rating: FaStar,
  takenAt: FaCamera,
  createdAt: FaUpload,
  season: FaLeaf,
  premium: FaGem,
  license: FaCreativeCommons,
};

const LIST_ORDER_ICONS: Record<GalleryListOrder, IconType> = {
  '-createdAt': FaUpload,
  '-takenAt': FaAsterisk,
  '-rating': FaStar,
  '-lastCommentedAt': FaRegComment,
};

// Orderings that cover own photos only — Wikimedia has no upload/taken date in
// our data. (Rating and last-comment can include Wikimedia — it's rated and
// commented on our platform.)
const WIKIMEDIA_EXCLUDED_ORDERS = new Set<GalleryListOrder>([
  '-createdAt',
  '-takenAt',
]);

export default function GalleryMenu() {
  const sc = useScrollClasses('horizontal');

  const m = useMessages();

  const gm = useGalleryMessages();

  const dispatch = useDispatch();

  const confirm = useConfirm();

  const colorizeBy = useAppSelector(
    (state) => state.gallerySettings.colorizeBy,
  );

  const showDirection = useAppSelector(
    (state) => state.gallerySettings.showDirection,
  );

  const showLegend = useAppSelector(
    (state) => state.gallerySettings.showLegend,
  );

  const sendGalleryEmails = useAppSelector(
    (state) => state.auth.user?.sendGalleryEmails,
  );

  const filterIsActive = useAppSelector(
    (state) =>
      Object.values(state.gallery.filter).filter((v) => v !== undefined)
        .length > 0,
  );

  // Controlled "more" (cog) dropdown, so the license chooser can swap the menu
  // content in place with a back header — the same pattern as the main menu.
  // One tri-state models the whole view; `licenseSubmenu` is only meaningful
  // while the menu is open, so a single value avoids re-coupling two booleans.
  const [moreView, setMoreView] = useState<'closed' | 'root' | 'license'>(
    'closed',
  );

  useEffect(() => {
    function handle(e: KeyboardEvent) {
      if (e.code === 'Escape' && moreView !== 'closed') {
        setMoreView(moreView === 'license' ? 'root' : 'closed');

        e.preventDefault();
      }
    }

    window.addEventListener('keydown', handle);

    return () => window.removeEventListener('keydown', handle);
  }, [moreView]);

  const handleMoreSelect = useCallback(
    async (eventKey: string | null) => {
      if (!eventKey) {
        return;
      }

      if (eventKey === 'submenu-license') {
        setMoreView('license');

        return;
      }

      if (eventKey === 'submenu-') {
        setMoreView('root');

        return;
      }

      // Every remaining branch is a terminal action that closes the menu.
      setMoreView('closed');

      if (eventKey.startsWith('all-')) {
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
      } else if (eventKey.startsWith('lic:')) {
        const license = eventKey.slice('lic:'.length) as GalleryLicense;

        if (
          await confirm({
            title: gm?.license.chooseForAll,
            message: gm?.allMyPhotos.confirmLicense(
              gm?.license.names[license] ?? license,
            ),
            icon: <FaCreativeCommons />,
            confirmLabel: m?.general.yes,
            cancelLabel: m?.general.no,
          })
        ) {
          dispatch(galleryAllOfLicense(license));
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
                  onSelect={(colorizeBy) => {
                    if (colorizeBy === LEGEND_ITEM) {
                      dispatch(galleryToggleLegend());

                      return;
                    }

                    dispatch(
                      galleryColorizeBy(
                        colorizeBy === 'none'
                          ? null
                          : (colorizeBy as GalleryColorizeBy),
                      ),
                    );
                  }}
                >
                  <LongPressTooltip
                    label={colorizeBy ? gm?.c[colorizeBy] : gm?.noColorize}
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
                    {pictureLegendApplies(colorizeBy) && (
                      <>
                        <Dropdown.Item
                          eventKey={LEGEND_ITEM}
                          active={showLegend}
                        >
                          {showLegend ? <FaRegCheckSquare /> : <FaRegSquare />}{' '}
                          {gm?.legend ?? '…'}
                        </Dropdown.Item>

                        <Dropdown.Divider />
                      </>
                    )}

                    <Dropdown.Item eventKey="none" active={!colorizeBy}>
                      <FaBan /> {gm?.noColorize ?? '…'}
                    </Dropdown.Item>

                    {GalleryColorizeBySchema.options.map((by) => {
                      const Icon = COLORIZE_ICONS[by];

                      return (
                        <Dropdown.Item
                          eventKey={by}
                          key={by}
                          title={gm?.c[by]}
                          active={colorizeBy === by}
                        >
                          <Icon /> {gm?.c[by] ?? '…'}
                          {WIKIMEDIA_NO_DATA_MODES.has(by) && (
                            <sup className="text-danger">*</sup>
                          )}
                        </Dropdown.Item>
                      );
                    })}

                    <Dropdown.Divider />

                    <Dropdown.ItemText className="text-body-secondary small">
                      <span className="text-danger">*</span>{' '}
                      {gm?.noWikimediaData}
                    </Dropdown.ItemText>
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
                      (key) => {
                        const Icon = LIST_ORDER_ICONS[key];

                        return (
                          <Dropdown.Item key={key} as="button" eventKey={key}>
                            <Icon /> {gm?.f[key]}
                            {WIKIMEDIA_EXCLUDED_ORDERS.has(key) && (
                              <sup className="text-danger">*</sup>
                            )}{' '}
                            {key === '-createdAt' && (
                              <>
                                <kbd>p</kbd> <kbd>l</kbd>
                              </>
                            )}
                          </Dropdown.Item>
                        );
                      },
                    )}

                    <Dropdown.Divider />

                    <Dropdown.ItemText className="text-body-secondary small">
                      <span className="text-danger">*</span>{' '}
                      {gm?.excludesWikimedia}
                    </Dropdown.ItemText>
                  </Dropdown.Menu>
                </Dropdown>

                <LongPressTooltip
                  label={gm?.stats.leaderboard}
                  kbd="p b"
                  breakpoint="lg"
                >
                  {({ props, label, labelClassName }) => (
                    <Button
                      className="ms-1"
                      variant="secondary"
                      onClick={() =>
                        dispatch(
                          setActiveModal({ type: 'gallery-leaderboard' }),
                        )
                      }
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
                  autoClose="outside"
                  show={moreView !== 'closed'}
                  onToggle={(next) => setMoreView(next ? 'root' : 'closed')}
                >
                  <Dropdown.Toggle variant="secondary">
                    <FaCog />
                  </Dropdown.Toggle>

                  <Dropdown.Menu popperConfig={fixedPopperConfig}>
                    {moreView === 'license' ? (
                      <>
                        <SubmenuHeader
                          icon={<FaCreativeCommons />}
                          title={gm?.license.chooseForAll}
                        />

                        {PHOTO_LICENSES.map(({ id }) => (
                          <Dropdown.Item
                            as="button"
                            eventKey={`lic:${id}`}
                            key={id}
                          >
                            <LicenseBadge licenseId={id} />{' '}
                            {gm?.license.names[id] ?? id}
                          </Dropdown.Item>
                        ))}
                      </>
                    ) : (
                      <>
                        <Dropdown.Item as="button" eventKey="direction">
                          <Checkbox value={showDirection} /> <FaLocationArrow />{' '}
                          {gm?.showDirection}
                        </Dropdown.Item>

                        {sendGalleryEmails !== undefined && (
                          <>
                            <Dropdown.Item as="button" eventKey="emails">
                              <Checkbox value={sendGalleryEmails} />{' '}
                              <FaEnvelope /> {gm?.sendGalleryEmails}
                            </Dropdown.Item>

                            <Dropdown.Divider />

                            <Dropdown.Item as="button" eventKey="all-premium">
                              <FaGem /> {gm?.allMyPhotos.premium}
                            </Dropdown.Item>

                            <Dropdown.Item as="button" eventKey="all-free">
                              <FaDove /> {gm?.allMyPhotos.free}
                            </Dropdown.Item>

                            <Dropdown.Item
                              as="button"
                              eventKey="submenu-license"
                            >
                              <FaCreativeCommons /> {gm?.license.chooseForAll}
                            </Dropdown.Item>
                          </>
                        )}
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
                    variant="dark"
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
