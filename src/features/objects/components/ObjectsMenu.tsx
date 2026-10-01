import { setActiveModal } from '@app/store/actions.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { LongPressTooltip } from '@shared/components/LongPressTooltip.js';
import { OfflineBadge } from '@shared/components/OfflineBadge.js';
import {
  Action,
  ActionDivider,
  ResponsiveActions,
} from '@shared/components/ResponsiveActions.js';
import { Toolbar } from '@shared/components/Toolbar.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useScrollClasses } from '@shared/hooks/useScrollClasses.js';
import type { ReactElement } from 'react';
import { Button, ButtonToolbar } from 'react-bootstrap';
import { FaPaintBrush, FaTimes } from 'react-icons/fa';
import { TbMapPins } from 'react-icons/tb';
import { useDispatch } from 'react-redux';
import { objectsSetFilter } from '../model/actions.js';
import { useObjectsMessages } from '../translations/useObjectsMessages.js';
import { ObjectsConvertMenu } from './ObjectsConvertMenu.js';

/**
 * The status of a category filter that is on, not a tool that is open: the
 * categories are found in the search box, and clearing them is what takes this
 * strip off the screen.
 */
export default function ObjectsMenu(): ReactElement {
  const m = useMessages();

  const om = useObjectsMessages();

  const dispatch = useDispatch();

  const sc = useScrollClasses('horizontal');

  const hasObjects = useAppSelector(
    (state) => state.objects.objects.length > 0,
  );

  const styleAction = [
    <ActionDivider key="style-divider" />,

    <Action
      key="style"
      icon={<FaPaintBrush />}
      label={om?.style.button}
      onClick={() => {
        dispatch(setActiveModal({ type: 'objects-style' }));
      }}
      showFrom="never"
    />,
  ];

  return (
    <div className="fm-ib-scroller fm-ib-scroller-top" ref={sc}>
      <div />

      <Toolbar className="mt-2">
        <ButtonToolbar>
          <LongPressTooltip label={m?.tools.objects} breakpoint="sm">
            {({ props, label, labelClassName }) => (
              <span
                className="align-self-center d-inline-flex align-items-center gap-2 px-1 py-2 my-n2"
                {...props}
              >
                <TbMapPins />

                <span className={labelClassName}>{label}</span>
              </span>
            )}
          </LongPressTooltip>

          {/* The objects are fetched, so offline the filter shows only what it
              already holds and no type can be added to it. */}
          <OfflineBadge hint={m?.general.offlineToolUnavailable} />

          {/* The style is of the markers as a whole, so it belongs beside what
              can be made of them rather than in a button of its own. Without
              objects there is nothing to convert, but still something to
              restyle. */}
          {hasObjects ? (
            <ObjectsConvertMenu>{styleAction}</ObjectsConvertMenu>
          ) : (
            <ResponsiveActions toggleLabel={m?.general.actions}>
              {styleAction}
            </ResponsiveActions>
          )}

          {/* The × of every other toolbar, and `dark` like every other one:
              clearing the categories is what takes this toolbar off the
              screen, so dismissing it and emptying it are one act. */}
          <LongPressTooltip label={m?.general.delete} kbd="Del">
            {({ props }) => (
              <Button
                variant="dark"
                onClick={() => {
                  dispatch(objectsSetFilter([]));
                }}
                {...props}
              >
                <FaTimes />
              </Button>
            )}
          </LongPressTooltip>
        </ButtonToolbar>
      </Toolbar>
    </div>
  );
}
