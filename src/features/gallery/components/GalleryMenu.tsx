import { saveSettings, setActiveModal } from '@app/store/actions.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { ActionIcon, Button, Kbd, Menu } from '@mantine/core';
import { Checkbox } from '@shared/components/Checkbox.js';
import { LongPressTooltip } from '@shared/components/LongPressTooltip.js';
import { MantineLongPressTooltip } from '@shared/components/MantineLongPressTooltip.js';
import { Toolbar } from '@shared/components/Toolbar.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { usePersistentState } from '@shared/hooks/usePersistentState.js';
import { useScrollClasses } from '@shared/hooks/useScrollClasses.js';
import { ButtonToolbar } from 'react-bootstrap';
import {
  FaBook,
  FaCamera,
  FaCaretDown,
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
import { PictureLegend } from './PictureLegend.js';

export default GalleryMenu;

const isTrue = (value: string | null) => value === 'true';

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

  const [hidden, setHidden] = usePersistentState<boolean>(
    'fm.galleryMenu.collapsed',
    String,
    isTrue,
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
                <MantineLongPressTooltip
                  label={m?.gallery.upload}
                  kbd="p u"
                  breakpoint="md"
                >
                  {({ props, label, labelHidden, kbdEl }) =>
                    labelHidden ? (
                      <ActionIcon
                        variant="filled"
                        color="gray"
                        size="input-sm"
                        type="button"
                        className="ms-1"
                        onClick={() =>
                          dispatch(setActiveModal('gallery-upload'))
                        }
                        {...props}
                      >
                        <FaUpload />
                      </ActionIcon>
                    ) : (
                      <Button
                        color="gray"
                        size="sm"
                        type="button"
                        className="ms-1"
                        leftSection={<FaUpload />}
                        rightSection={kbdEl}
                        onClick={() =>
                          dispatch(setActiveModal('gallery-upload'))
                        }
                        {...props}
                      >
                        {label}
                      </Button>
                    )
                  }
                </MantineLongPressTooltip>

                <MantineLongPressTooltip
                  label={m?.gallery.filter}
                  kbd="p f"
                  breakpoint="lg"
                >
                  {({ props, label, labelHidden, kbdEl }) =>
                    labelHidden ? (
                      <ActionIcon
                        variant={filterIsActive ? 'light' : 'filled'}
                        color="gray"
                        size="input-sm"
                        type="button"
                        className="ms-1"
                        onClick={() =>
                          dispatch(setActiveModal('gallery-filter'))
                        }
                        {...props}
                      >
                        <FaFilter />
                      </ActionIcon>
                    ) : (
                      <Button
                        color="gray"
                        size="sm"
                        type="button"
                        className="ms-1"
                        variant={filterIsActive ? 'light' : 'filled'}
                        leftSection={<FaFilter />}
                        rightSection={kbdEl}
                        onClick={() =>
                          dispatch(setActiveModal('gallery-filter'))
                        }
                        {...props}
                      >
                        {label}
                      </Button>
                    )
                  }
                </MantineLongPressTooltip>

                <Menu>
                  <Menu.Target>
                    <MantineLongPressTooltip
                      label={m?.gallery.c[colorizeBy ?? 'disable']}
                      breakpoint="sm"
                    >
                      {({ props, label, labelHidden }) =>
                        labelHidden ? (
                          <ActionIcon
                            className="ms-1"
                            variant="filled"
                            color="gray"
                            size="input-sm"
                            {...props}
                          >
                            <FaPalette />
                          </ActionIcon>
                        ) : (
                          <Button
                            className="ms-1"
                            color="gray"
                            size="sm"
                            leftSection={<FaPalette />}
                            rightSection={<FaCaretDown />}
                            {...props}
                          >
                            {label}
                          </Button>
                        )
                      }
                    </MantineLongPressTooltip>
                  </Menu.Target>

                  <Menu.Dropdown>
                    {(
                      Object.keys(m?.gallery.c ?? {}) as (
                        | GalleryColorizeBy
                        | 'disable'
                      )[]
                    ).map((by) => (
                      <Menu.Item
                        key={by}
                        color={colorizeBy === by ? 'blue' : undefined}
                        onClick={() =>
                          dispatch(
                            galleryColorizeBy(
                              by === 'disable'
                                ? null
                                : (by as GalleryColorizeBy),
                            ),
                          )
                        }
                      >
                        {m?.gallery.c[by] ?? '…'}
                      </Menu.Item>
                    ))}
                  </Menu.Dropdown>
                </Menu>

                <Menu>
                  <Menu.Target>
                    <MantineLongPressTooltip
                      label={m?.gallery.showPhotosFrom}
                      breakpoint="md"
                    >
                      {({ props, label, labelHidden }) =>
                        labelHidden ? (
                          <ActionIcon
                            className="ms-1"
                            variant="filled"
                            color="gray"
                            size="input-sm"
                            {...props}
                          >
                            <FaBook />
                          </ActionIcon>
                        ) : (
                          <Button
                            className="ms-1"
                            color="gray"
                            size="sm"
                            leftSection={<FaBook />}
                            rightSection={<FaCaretDown />}
                            {...props}
                          >
                            {label}
                          </Button>
                        )
                      }
                    </MantineLongPressTooltip>
                  </Menu.Target>

                  <Menu.Dropdown>
                    {(
                      Object.keys(m?.gallery.f ?? {}) as GalleryListOrder[]
                    ).map((key) => (
                      <Menu.Item
                        key={key}
                        rightSection={
                          key === '-createdAt' ? (
                            <>
                              <Kbd>p</Kbd> <Kbd>l</Kbd>
                            </>
                          ) : null
                        }
                        onClick={() => dispatch(galleryList(key))}
                      >
                        {m?.gallery.f[key]}
                      </Menu.Item>
                    ))}
                  </Menu.Dropdown>
                </Menu>

                <MantineLongPressTooltip
                  label={m?.gallery.stats.leaderboard}
                  kbd="p b"
                  breakpoint="lg"
                >
                  {({ props, label, labelHidden, kbdEl }) =>
                    labelHidden ? (
                      <ActionIcon
                        variant="filled"
                        color="gray"
                        size="input-sm"
                        type="button"
                        className="ms-1"
                        onClick={() =>
                          dispatch(setActiveModal('gallery-leaderboard'))
                        }
                        {...props}
                      >
                        <FaTrophy />
                      </ActionIcon>
                    ) : (
                      <Button
                        color="gray"
                        size="sm"
                        type="button"
                        className="ms-1"
                        leftSection={<FaTrophy />}
                        rightSection={kbdEl}
                        onClick={() =>
                          dispatch(setActiveModal('gallery-leaderboard'))
                        }
                        {...props}
                      >
                        {label}
                      </Button>
                    )
                  }
                </MantineLongPressTooltip>

                <Menu closeOnItemClick={false}>
                  <Menu.Target>
                    <ActionIcon
                      className="ms-1"
                      variant="filled"
                      color="gray"
                      size="input-sm"
                    >
                      <FaCog />
                    </ActionIcon>
                  </Menu.Target>

                  <Menu.Dropdown>
                    <Menu.Item
                      leftSection={
                        <>
                          <Checkbox value={showLegend} /> <FaInfo />
                        </>
                      }
                      onClick={() => dispatch(galleryToggleLegend())}
                    >
                      {m?.gallery.showLegend}
                    </Menu.Item>

                    <Menu.Item
                      leftSection={
                        <>
                          <Checkbox value={showDirection} /> <FaLocationArrow />
                        </>
                      }
                      onClick={() => dispatch(galleryToggleDirection())}
                    >
                      {m?.gallery.showDirection}
                    </Menu.Item>

                    {sendGalleryEmails !== undefined && (
                      <>
                        <Menu.Item
                          leftSection={
                            <>
                              <Checkbox value={sendGalleryEmails} />{' '}
                              <FaEnvelope />
                            </>
                          }
                          onClick={() =>
                            dispatch(
                              saveSettings({
                                user: {
                                  sendGalleryEmails: !sendGalleryEmails,
                                },
                              }),
                            )
                          }
                        >
                          {m?.settings.account.sendGalleryEmails}
                        </Menu.Item>

                        <Menu.Divider />

                        <Menu.Item
                          closeMenuOnClick
                          leftSection={<FaGem />}
                          onClick={() =>
                            dispatch(galleryAllPremiumOrFree('premium'))
                          }
                        >
                          {m?.gallery.allMyPhotos.premium}
                        </Menu.Item>

                        <Menu.Item
                          closeMenuOnClick
                          leftSection={<FaDove />}
                          onClick={() =>
                            dispatch(galleryAllPremiumOrFree('free'))
                          }
                        >
                          {m?.gallery.allMyPhotos.free}
                        </Menu.Item>
                      </>
                    )}
                  </Menu.Dropdown>
                </Menu>
              </>
            )}

            <ActionIcon
              className="ms-1"
              variant="filled"
              color={hidden ? 'blue' : 'dark'}
              size="input-sm"
              onClick={() => setHidden((hidden) => !hidden)}
            >
              {hidden ? <FaCaretRight /> : <FaCaretLeft />}
            </ActionIcon>
          </ButtonToolbar>
        </Toolbar>
      </div>

      {showLegend && <PictureLegend />}
    </>
  );
}
