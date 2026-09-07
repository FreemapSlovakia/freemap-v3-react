import { useMessages } from '@features/l10n/l10nInjector.js';
import { useMap } from '@features/map/hooks/useMap.js';
import { OpenInExternalAppDropdownItems } from '@features/openInExternalApp/components/OpenInExternalAppMenuItems.js';
import { useOpenInExternalAppMessages } from '@features/openInExternalApp/translations/useOpenInExternalAppMessages.js';
import type { Modifier, Obj } from '@popperjs/core';
import type { UseDropdownMenuOptions } from '@restart/ui/DropdownMenu';
import { LocationActionItems } from '@shared/components/LocationActionItems.js';
import { MenuGutter } from '@shared/components/MenuGutter.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useMenuHandler } from '@shared/hooks/useMenuHandler.js';
import { useScrollClasses } from '@shared/hooks/useScrollClasses.js';
import clsx from 'clsx';
import type { LeafletMouseEvent } from 'leaflet';
import {
  type ReactElement,
  type RefObject,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Dropdown } from 'react-bootstrap';
import {
  FaChevronLeft,
  FaChevronRight,
  FaExternalLinkAlt,
} from 'react-icons/fa';
import classes from './MapContextMenu.module.css';

const initialState = {
  x: 0,
  y: 0,
  lat: 0,
  lon: 0,
  maxHeight: 100000,
};

// this modifier somehow fixes menu
const fixFlashingModifier: Partial<Modifier<'fixFlashing', Obj>> = {
  name: 'fixFlashing',
  phase: 'afterMain',
  enabled: true,
  effect() {},
};

// center the menu on the clicked point and leave an 8px gap for the arrow "ear"
const offsetModifier: Partial<Modifier<'offset', Obj>> = {
  name: 'offset',
  options: {
    offset: ({ popper }: { popper: { width: number } }) => [
      -popper.width / 2,
      8,
    ],
  },
};

// keep the menu start-aligned so the centering offset stays predictable near
// screen edges (no start<->end flip that would shove the menu off the point)
const flipModifier: Partial<Modifier<'flip', Obj>> = {
  name: 'flip',
  options: { flipVariations: false },
};

// place the ear horizontally so it points at the clicked point; react-bootstrap
// doesn't apply popper's own arrow styles, so we compute the offset from
// popper's rects and write it onto our element ourselves
function createArrowModifier(
  arrowRef: RefObject<HTMLSpanElement | null>,
): Modifier<'fmArrow', Obj> {
  return {
    name: 'fmArrow',
    enabled: true,
    phase: 'write',
    fn({ state }) {
      const arrow = arrowRef.current;

      const offsets = state.modifiersData['popperOffsets'] as
        | { x: number }
        | undefined;

      if (!arrow || !offsets) {
        return;
      }

      const { reference, popper } = state.rects;

      const cx = reference.x + reference.width / 2;
      const size = 16; // ear base length
      const pad = 12; // keep the ear off the rounded corners

      const x = Math.max(pad, Math.min(cx - offsets.x, popper.width - pad));

      arrow.style.left = `${x - size / 2}px`;
    },
  };
}

export function MapContextMenu(): ReactElement {
  const m = useMessages();

  const oeam = useOpenInExternalAppMessages();

  const [contextMenu, setContextMenu] = useState(initialState);

  const arrowRef = useRef<HTMLSpanElement>(null);

  // Rebuilt every render so its identity changes: right-clicking elsewhere while
  // the menu stays open fires no show-transition, so popper only re-reads the
  // moved toggle when the config (a fresh arrow-modifier closure) changes,
  // busting react-bootstrap's deep-equal modifier memo.
  const popperConfig: UseDropdownMenuOptions['popperConfig'] = {
    modifiers: [
      fixFlashingModifier,
      offsetModifier,
      flipModifier,
      createArrowModifier(arrowRef),
    ],
  };

  const toggleRef = useRef<HTMLButtonElement>(null);

  const map = useMap();

  const { handleSelect, menuShown, handleMenuToggle, closeMenu, submenu } =
    useMenuHandler({
      at: { lat: contextMenu.lat, lon: contextMenu.lon },
      includePoint: true,
    });

  useEffect(() => {
    if (!map) {
      return;
    }

    function handlecontextMenu(e: LeafletMouseEvent) {
      e.originalEvent.preventDefault();

      // A right-click/long-press fires no click, so other open dropdowns never
      // see an outside click. Synthesize one on <html>: it reaches the root-close
      // listeners on `document` while staying out of reach of React and Leaflet,
      // whose handlers sit on descendants.
      document.documentElement.dispatchEvent(
        new MouseEvent('click', { bubbles: true }),
      );

      closeMenu();

      handleMenuToggle(true);

      setContextMenu({
        x: e.containerPoint.x,
        y: e.containerPoint.y,
        lat: e.latlng.lat,
        lon: e.latlng.lng,
        maxHeight:
          window.innerHeight / 2 +
          Math.abs(e.containerPoint.y - window.innerHeight / 2) -
          10,
      });
    }

    map.addEventListener('contextmenu', handlecontextMenu);

    return () => {
      map.removeEventListener('contextmenu', handlecontextMenu);
    };
  }, [closeMenu, handleMenuToggle, map]);

  useEffect(() => {
    if (menuShown) {
      toggleRef.current?.focus();
    }
  }, [menuShown]);

  const zoom = useAppSelector((state) => state.map.zoom);

  const sc = useScrollClasses('vertical');

  return (
    <Dropdown
      show={menuShown}
      onToggle={handleMenuToggle}
      onSelect={handleSelect}
      autoClose="outside"
    >
      <Dropdown.Toggle
        bsPrefix="fm-dropdown-toggle-nocaret"
        ref={toggleRef}
        style={{
          width: 0,
          height: 0,
          margin: 0,
          padding: 0,
          border: 0,
          position: 'absolute',
          left: contextMenu.x,
          top: contextMenu.y,
          pointerEvents: 'none',
        }}
      />

      <Dropdown.Menu
        className={clsx('fm-dropdown-with-scroller', classes.menu)}
        popperConfig={popperConfig}
      >
        <span ref={arrowRef} className={classes.arrow} />

        <div
          className="fm-menu-scroller"
          ref={sc}
          style={{ maxHeight: contextMenu.maxHeight }}
        >
          <div />

          {submenu === 'openExternally' ? (
            <>
              <Dropdown.Header>
                <FaExternalLinkAlt /> {oeam?.openInExternal}
              </Dropdown.Header>

              <Dropdown.Item as="button" eventKey="submenu-">
                <FaChevronLeft /> {m?.mainMenu.back}
                <MenuGutter>
                  <kbd>Esc</kbd>
                </MenuGutter>
              </Dropdown.Item>

              <Dropdown.Divider />

              <OpenInExternalAppDropdownItems
                lat={contextMenu.lat}
                lon={contextMenu.lon}
                zoom={zoom}
                includePoint
                copy={false}
                share={false}
              />
            </>
          ) : (
            // The place's own menu, flat: this one *is* the location menu, so
            // there is nothing to hide it behind.
            <LocationActionItems
              lat={contextMenu.lat}
              lon={contextMenu.lon}
              onAct={closeMenu}
            >
              {!window.fmEmbedded && (
                <Dropdown.Item as="button" eventKey="submenu-openExternally">
                  <FaExternalLinkAlt /> {oeam?.openInExternal}
                  <MenuGutter>
                    <FaChevronRight />
                  </MenuGutter>
                </Dropdown.Item>
              )}
            </LocationActionItems>
          )}
        </div>
      </Dropdown.Menu>
    </Dropdown>
  );
}
