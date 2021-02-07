import { mapRefocus } from 'fm3/actions/mapActions';
import { FontAwesomeIcon } from 'fm3/components/FontAwesomeIcon';
import { useMessages } from 'fm3/l10nInjector';
import {
  BaseLayerLetters,
  baseLayers,
  LayerDef,
  overlayLayers,
  OverlayLetters,
} from 'fm3/mapDefinitions';
import { RootState } from 'fm3/storeCreator';
import { MouseEvent, ReactElement, useCallback, useRef, useState } from 'react';
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Dropdown from 'react-bootstrap/Dropdown';
import Overlay from 'react-bootstrap/Overlay';
import Popover from 'react-bootstrap/Popover';
import {
  FaExclamationTriangle,
  FaRegCheckCircle,
  FaRegCheckSquare,
  FaRegCircle,
  FaRegMap,
  FaRegSquare,
} from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { is } from 'typescript-is';
import useMedia from 'use-media';

function getKbdShortcut(key?: [string, boolean]) {
  return (
    key && (
      <>
        {' '}
        <kbd>
          {key[1] ? '⇧' : ''}
          {key[0].replace(/Key|Digit/, '').toLowerCase()}
        </kbd>
      </>
    )
  );
}

export function MapSwitchButton(): ReactElement {
  const m = useMessages();

  const zoom = useSelector((state: RootState) => state.map.zoom);

  const mapType = useSelector((state: RootState) => state.map.mapType);

  const overlays = useSelector((state: RootState) => state.map.overlays);

  const expertMode = useSelector((state: RootState) => state.main.expertMode);

  const pictureFilterIsActive = useSelector(
    (state: RootState) =>
      Object.values(state.gallery.filter).filter((x) => x).length > 0,
  );

  const isAdmin = useSelector(
    (state: RootState) => !!(state.auth.user && state.auth.user.isAdmin),
  );

  const language = useSelector((state: RootState) => state.l10n.language);

  const dispatch = useDispatch();

  const [show, setShow] = useState(false);

  const buttonRef = useRef<HTMLButtonElement | null>(null);

  const button2Ref = useRef<HTMLButtonElement | null>(null);

  const handleButtonClick = useCallback(() => {
    setShow(true);
  }, []);

  const handleHide = useCallback(() => {
    setShow(false);
  }, []);

  const handleMapSelect = useCallback(
    (mapType1: string) => {
      setShow(false);

      if (mapType !== mapType1 && is<BaseLayerLetters>(mapType1)) {
        dispatch(mapRefocus({ mapType: mapType1 }));
      }
    },
    [dispatch, mapType],
  );

  const handleOverlaySelect = useCallback(
    (overlay) => {
      const s = new Set(overlays);

      if (!is<OverlayLetters>(overlay)) {
        // uh-oh
      } else if (s.has(overlay)) {
        s.delete(overlay);
      } else {
        s.add(overlay);
      }

      dispatch(mapRefocus({ overlays: [...s] }));
    },
    [dispatch, overlays],
  );

  const handleBaseClick = (e: MouseEvent<HTMLButtonElement>) => {
    dispatch(
      mapRefocus({
        mapType: e.currentTarget.dataset['type'] as BaseLayerLetters,
      }),
    );
  };

  const handleOverlayClick = (e: MouseEvent<HTMLButtonElement>) => {
    const { type } = e.currentTarget.dataset;

    if (!is<OverlayLetters>(type)) {
      return;
    }

    const s = new Set(overlays);

    if (s.has(type)) {
      s.delete(type);
    } else {
      s.add(type);
    }

    dispatch(mapRefocus({ overlays: [...s] }));
  };

  const isWide = useMedia({ minWidth: '576px' });

  const isPrimary = (layer: LayerDef) =>
    layer.primary === true ||
    layer.primary === language ||
    (typeof layer.primary === 'string' &&
      layer.primary.startsWith('!') &&
      layer.primary !== `!${language}`);

  return (
    <>
      <ButtonGroup className="dropup d-none d-sm-inline-flex">
        {baseLayers.filter(isPrimary).map(({ type, icon }) => (
          <Button
            variant="secondary"
            title={m?.mapLayers.letters[type]}
            key={type}
            data-type={type}
            active={mapType === type}
            onClick={handleBaseClick}
          >
            {icon}
          </Button>
        ))}
        {overlayLayers.filter(isPrimary).map(({ type, icon }) => (
          <Button
            variant="secondary"
            title={m?.mapLayers.letters[type]}
            key={type}
            data-type={type}
            active={overlays.includes(type)}
            onClick={handleOverlayClick}
          >
            {icon}
          </Button>
        ))}
        <Button
          variant="secondary"
          className="dropdown-toggle"
          ref={buttonRef}
          onClick={handleButtonClick}
          title={m?.mapLayers.layers}
        />
      </ButtonGroup>
      <Button
        className="d-sm-none"
        ref={button2Ref}
        onClick={handleButtonClick}
        title={m?.mapLayers.layers}
        variant="primary"
      >
        <FaRegMap />
      </Button>
      <Overlay
        rootClose
        placement="top"
        show={show}
        onHide={handleHide}
        target={(isWide ? buttonRef.current : button2Ref.current) ?? null}
      >
        <Popover id="popover-trigger-click-root-close" className="fm-menu">
          <Popover.Content>
            {
              // TODO base and overlay layers have too much duplicate code
              baseLayers
                .filter(
                  ({ showOnlyInExpertMode }) =>
                    !showOnlyInExpertMode || expertMode,
                )
                .filter(({ adminOnly }) => isAdmin || !adminOnly)
                .map(({ type, icon, minZoom, key }) => (
                  <Dropdown.Item
                    key={type}
                    onClick={() => handleMapSelect(type)}
                  >
                    {mapType === type ? <FaRegCheckCircle /> : <FaRegCircle />}{' '}
                    {icon}{' '}
                    <span
                      style={{
                        textDecoration:
                          minZoom !== undefined && zoom < minZoom
                            ? 'line-through'
                            : 'none',
                      }}
                    >
                      {m?.mapLayers.letters[type]}
                    </span>
                    {getKbdShortcut(key)}
                    {minZoom !== undefined && zoom < minZoom && (
                      <>
                        {' '}
                        <FaExclamationTriangle
                          title={m?.mapLayers.minZoomWarning(minZoom)}
                          className="text-warning"
                        />
                      </>
                    )}
                  </Dropdown.Item>
                ))
            }
            <Dropdown.Divider />
            {overlayLayers
              .filter(
                ({ showOnlyInExpertMode }) =>
                  !showOnlyInExpertMode || expertMode,
              )
              .filter(({ adminOnly }) => isAdmin || !adminOnly)
              .map(({ type, icon, minZoom, key }) => (
                <Dropdown.Item
                  key={type}
                  eventKey={type}
                  onSelect={handleOverlaySelect}
                >
                  {type === 'i' ? (
                    !overlays.includes(type)
                  ) : overlays.includes(type) ? (
                    <FaRegCheckSquare />
                  ) : (
                    <FaRegSquare />
                  )}{' '}
                  {icon}{' '}
                  <span
                    style={{
                      textDecoration:
                        minZoom !== undefined && zoom < minZoom
                          ? 'line-through'
                          : 'none',
                    }}
                  >
                    {m?.mapLayers.letters[type]}
                  </span>
                  {getKbdShortcut(key)}
                  {minZoom !== undefined && zoom < minZoom && (
                    <>
                      {' '}
                      <FontAwesomeIcon
                        icon="exclamation-triangle"
                        title={m?.mapLayers.minZoomWarning(minZoom)}
                        className="text-warning"
                      />
                    </>
                  )}
                  {type === 'I' && pictureFilterIsActive && (
                    <>
                      {' '}
                      <FontAwesomeIcon
                        icon="filter"
                        title={m?.mapLayers.photoFilterWarning}
                        className="text-warning"
                      />
                    </>
                  )}
                </Dropdown.Item>
              ))}
          </Popover.Content>
        </Popover>
      </Overlay>
    </>
  );
}
