import { useCallback } from 'react';
import { Button, ButtonToolbar, Dropdown } from 'react-bootstrap';
import {
  FaBook,
  FaCamera,
  FaCaretLeft,
  FaCaretRight,
  FaCog,
  FaDove,
  FaEnvelope,
  FaFilter,
  FaGem,
  FaInfo,
  FaLocationArrow,
  FaPalette,
  FaUpload,
} from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import {
  galleryAllPremiumOrFree,
  GalleryColorizeBy,
  galleryColorizeBy,
  galleryList,
  GalleryListOrder,
  galleryToggleDirection,
  galleryToggleLegend,
} from '../../actions/galleryActions.js';
import { saveSettings, setActiveModal } from '../../actions/mainActions.js';
import { fixedPopperConfig } from '../../fixedPopperConfig.js';
import { useAppSelector } from '../../hooks/useAppSelector.js';
import { usePersistentState } from '../../hooks/usePersistentState.js';
import { useScrollClasses } from '../../hooks/useScrollClasses.js';
import { useMessages } from '../../l10nInjector.js';
import { Checkbox } from '../Checkbox.js';
import { LongPressTooltip } from '../LongPressTooltip.js';
import { Toolbar } from '../Toolbar.js';
import { PictureLegend } from './PictureLegend.js';

export default GalleryMenu;

export function GalleryMenu() {
  const sc = useScrollClasses('horizontal');

  const m = useMessages();

  const dispatch = useDispatch();

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
    (eventKey: string | null) => {
      if (!eventKey) {
        // nothing
      } else if (eventKey.startsWith('all-')) {
        dispatch(
          galleryAllPremiumOrFree(eventKey.slice(4) as 'premium' | 'free'),
        );
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
    [dispatch, sendGalleryEmails],
  );

  const [hidden, setHidden] = usePersistentState<boolean>(
    'fm.galleryMenu.collapsed',
    (value) => String(value),
    (value) => value === 'true',
  );

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
                <LongPressTooltip
                  label={m?.gallery.upload}
                  kbd="p u"
                  breakpoint="md"
                >
                  {({ props, label, labelClassName }) => (
                    <Button
                      type="button"
                      variant="secondary"
                      className="ms-1"
                      onClick={() => dispatch(setActiveModal('gallery-upload'))}
                      {...props}
                    >
                      <FaUpload />{' '}
                      <span className={labelClassName}>{label}</span>
                    </Button>
                  )}
                </LongPressTooltip>

                <LongPressTooltip
                  label={m?.gallery.filter}
                  kbd="p f"
                  breakpoint="lg"
                >
                  {({ props, label, labelClassName }) => (
                    <Button
                      type="button"
                      className="ms-1"
                      variant="secondary"
                      onClick={() => dispatch(setActiveModal('gallery-filter'))}
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
                    label={m?.gallery.c[colorizeBy ?? 'disable']}
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
                      Object.keys(m?.gallery.c ?? {}) as (
                        | GalleryColorizeBy
                        | 'disable'
                      )[]
                    ).map((by) => (
                      <Dropdown.Item
                        eventKey={by}
                        key={by}
                        title={m?.gallery.c[by]}
                        active={colorizeBy === by}
                      >
                        {m?.gallery.c[by] ?? '…'}
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
                  <LongPressTooltip
                    label={m?.gallery.showPhotosFrom}
                    breakpoint="md"
                  >
                    {({ props, label, labelClassName }) => (
                      <Dropdown.Toggle variant="secondary" {...props}>
                        <FaBook />{' '}
                        <span className={labelClassName}>{label}</span>
                      </Dropdown.Toggle>
                    )}
                  </LongPressTooltip>

                  <Dropdown.Menu popperConfig={fixedPopperConfig}>
                    {(
                      Object.keys(m?.gallery.f ?? {}) as GalleryListOrder[]
                    ).map((key) => (
                      <Dropdown.Item as="button" eventKey={key}>
                        {m?.gallery.f[key]}{' '}
                        {key === '-createdAt' && (
                          <>
                            <kbd>p</kbd> <kbd>l</kbd>
                          </>
                        )}
                      </Dropdown.Item>
                    ))}
                  </Dropdown.Menu>
                </Dropdown>

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
                      {m?.gallery.showLegend}
                    </Dropdown.Item>

                    <Dropdown.Item as="button" eventKey="direction">
                      <Checkbox value={showDirection} /> <FaLocationArrow />{' '}
                      {m?.gallery.showDirection}
                    </Dropdown.Item>

                    {sendGalleryEmails !== undefined && (
                      <>
                        <Dropdown.Item as="button" eventKey="emails">
                          <Checkbox value={sendGalleryEmails} /> <FaEnvelope />{' '}
                          {m?.settings.account.sendGalleryEmails}
                        </Dropdown.Item>

                        <Dropdown.Divider />

                        <Dropdown.Item as="button" eventKey="all-premium">
                          <FaGem /> {m?.gallery.allMyPhotos.premium}
                        </Dropdown.Item>

                        <Dropdown.Item as="button" eventKey="all-free">
                          <FaDove /> {m?.gallery.allMyPhotos.free}
                        </Dropdown.Item>
                      </>
                    )}
                  </Dropdown.Menu>
                </Dropdown>
              </>
            )}

            <Button
              className="ms-1"
              variant={hidden ? 'primary' : 'dark'}
              onClick={() => setHidden((hidden) => !hidden)}
            >
              {hidden ? <FaCaretRight /> : <FaCaretLeft />}
            </Button>
          </ButtonToolbar>
        </Toolbar>
      </div>

      {showLegend && <PictureLegend />}
    </>
  );
}
