import { type ReactElement, useCallback } from 'react';
import { Button } from 'react-bootstrap';
import { FaChevronLeft } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { galleryCancelShowOnTheMap } from '../model/actions.js';
import { LongPressTooltip } from '../../../components/LongPressTooltip.js';
import { useMessages } from '../../../l10nInjector.js';
import { Toolbar } from '../../../components/Toolbar.js';

export default GalleryShowPositionMenu;

export function GalleryShowPositionMenu(): ReactElement | null {
  const m = useMessages();

  const dispatch = useDispatch();

  const close = useCallback(() => {
    dispatch(galleryCancelShowOnTheMap());
  }, [dispatch]);

  return (
    <Toolbar className="mt-2">
      <LongPressTooltip breakpoint="sm" label={m?.general.back} kbd="Esc">
        {({ label, labelClassName, props }) => (
          <Button onClick={close} {...props}>
            <FaChevronLeft />
            <span className={labelClassName}> {label}</span>
          </Button>
        )}
      </LongPressTooltip>
    </Toolbar>
  );
}
