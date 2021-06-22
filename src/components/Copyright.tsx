import { setActiveModal } from 'fm3/actions/mainActions';
import { tipsShow } from 'fm3/actions/tipsActions';
import { useMessages } from 'fm3/l10nInjector';
import {
  forwardRef,
  ReactElement,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Dropdown from 'react-bootstrap/Dropdown';
import Overlay from 'react-bootstrap/Overlay';
import Popover, { PopoverProps } from 'react-bootstrap/Popover';
import { FaLock, FaQuestion, FaRegCopyright, FaRegMap } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { Attribution } from './Attribution';

// eslint-disable-next-line react/display-name
const UpdatingPopover = forwardRef<HTMLDivElement, PopoverProps>(
  ({ popper, children, ...props }, ref) => {
    useEffect(() => {
      popper.scheduleUpdate();
    }, [children, popper]);

    return (
      <Popover ref={ref} {...props}>
        {children}
      </Popover>
    );
  },
);

export function Copyright(): ReactElement {
  const m = useMessages();

  const dispatch = useDispatch();

  const mapType = useSelector((state) => state.map.mapType);

  const overlays = useSelector((state) => state.map.overlays);

  // const imhd = useSelector(
  //   (state) => state.routePlanner.transportType === 'imhd',
  // );

  const showLegendButton = useSelector((state) =>
    (['sk', 'cs'].includes(state.l10n.language)
      ? ['A', 'K', 'T', 'C', 'X', 'O']
      : ['X', 'O']
    ).includes(state.map.mapType),
  );

  const [show, setShow] = useState<undefined | 'menu' | 'licence'>();

  const buttonRef = useRef<HTMLButtonElement | null>(null);

  const toRef = useRef<number>();

  const licenceShownForRef = useRef([
    new Set<string>(),
    new Set<string>(),
  ] as const);

  useEffect(() => {
    const [mapTypes, mapOverlays] = licenceShownForRef.current;

    if (mapTypes.has(mapType) && overlays.every((o) => mapOverlays.has(o))) {
      return;
    }

    mapTypes.add(mapType);

    for (const o of overlays) {
      mapOverlays.add(o);
    }

    setShow('licence');

    toRef.current = window.setTimeout(() => {
      setShow(undefined);

      toRef.current = undefined;
    }, 5000);

    return () => {
      if (toRef.current) {
        clearTimeout(toRef.current);

        toRef.current = undefined;
      }
    };
  }, [mapType, overlays]);

  useLayoutEffect(() => {
    if (show !== 'licence') {
      clearTimeout(toRef.current);

      toRef.current = undefined;
    }
  }, [show]);

  return (
    <Card className="fm-toolbar mr-2 mb-2">
      <Button
        ref={buttonRef}
        onClick={() => setShow('menu')}
        title={m?.mainMenu.mapLegend + ', Privacy policy'}
        variant="secondary"
      >
        <FaQuestion />
      </Button>

      <Overlay
        rootClose
        placement="top"
        show={show === 'menu'}
        onHide={() => setShow(undefined)}
        target={buttonRef.current}
      >
        <Popover id="popover-copyright" className="fm-menu">
          <Popover.Content>
            <Dropdown.Item
              key="attribution"
              as="button"
              onSelect={(_, e) => {
                e.preventDefault();
                setShow('licence');
              }}
            >
              <FaRegCopyright /> {m?.main.copyright}
            </Dropdown.Item>
            {showLegendButton && (
              <Dropdown.Item
                key="legend"
                href="?show=legend"
                onSelect={(_, e) => {
                  e.preventDefault();
                  setShow(undefined);
                  dispatch(setActiveModal('legend'));
                }}
              >
                <FaRegMap /> {m?.mainMenu.mapLegend}
              </Dropdown.Item>
            )}
            <Dropdown.Item
              key="privacyPolicy"
              href="?tip=privacyPolicy"
              onSelect={(_, e) => {
                e.preventDefault();
                setShow(undefined);
                dispatch(tipsShow('privacyPolicy'));
              }}
            >
              <FaLock /> Privacy policy
            </Dropdown.Item>
          </Popover.Content>
        </Popover>
      </Overlay>

      <Overlay
        rootClose
        placement="top"
        show={show === 'licence'}
        onHide={() => setShow(undefined)}
        target={buttonRef.current}
      >
        <UpdatingPopover
          id="popover-positioned-right"
          className="fm-attr-popover pl-2 pr-3"
        >
          <Attribution />
        </UpdatingPopover>
      </Overlay>
    </Card>
  );
}
