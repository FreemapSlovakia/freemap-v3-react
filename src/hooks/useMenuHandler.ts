import {
  GalleryColorizeBy,
  GalleryListOrder,
  galleryColorizeBy,
  galleryList,
} from 'fm3/actions/galleryActions';
import {
  ExternalTargets,
  Modal,
  Tool,
  clearMapFeatures,
  documentShow,
  openInExternalApp,
  setActiveModal,
  setTool,
} from 'fm3/actions/mainActions';
import { Submenu } from 'fm3/components/mainMenu/submenu';
import { DocumentKey } from 'fm3/documents';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { is } from 'typia';
import { useAppSelector } from './reduxSelectHook';
import { l10nSetChosenLanguage } from 'fm3/actions/l10nActions';
import { mapRefocus } from 'fm3/actions/mapActions';

export function useMenuHandler({
  pointTitle,
  pointDescription,
}: {
  pointTitle?: string;
  pointDescription?: string;
} = {}) {
  const dispatch = useDispatch();

  const lat = useAppSelector((state) => state.map.lat);

  const lon = useAppSelector((state) => state.map.lon);

  const zoom = useAppSelector((state) => state.map.zoom);

  const mapType = useAppSelector((state) => state.map.mapType);

  const overlays = useAppSelector((state) => state.map.overlays);

  const [menuShown, setShow] = useState(false);

  const [submenu, setSubmenu] = useState<Submenu>(null);

  const stack = useRef<Submenu[]>([]);

  useEffect(() => {
    if (submenu) {
      if (stack.current.at(-1) !== submenu) {
        stack.current.push(submenu);
      }
    } else {
      stack.current.pop();

      const top = stack.current.at(-1) ?? null;

      setSubmenu(top);
    }
  }, [submenu]);

  useEffect(() => {
    if (menuShown) {
      setSubmenu(null);
    }
  }, [menuShown]);

  const extraHandler = useRef<(eventKey: string) => boolean>();

  const handleSelect = useCallback(
    (eventKey: string | null, e: React.SyntheticEvent<unknown, Event>) => {
      if (eventKey !== 'url') {
        e.preventDefault();
      }

      if (eventKey === null) {
        return;
      }

      if (eventKey.startsWith('modal-')) {
        dispatch(setActiveModal((eventKey.slice(6) || null) as Modal | null));

        setShow(false);
      } else if (eventKey.startsWith('submenu-')) {
        setSubmenu((eventKey.slice(8) || null) as Submenu);
      } else if (eventKey.startsWith('document-')) {
        dispatch(documentShow(eventKey.slice(9) as DocumentKey));

        setShow(false);
      } else if (eventKey.startsWith('tool-')) {
        dispatch(setTool((eventKey.slice(5) || null) as Tool | null));

        setShow(false);
      } else if (eventKey === 'clear-map-features') {
        dispatch(clearMapFeatures());

        setShow(false);
      } else if (eventKey.startsWith('photosBy-')) {
        dispatch(galleryList(eventKey.slice(9) as GalleryListOrder));

        setShow(false);
      } else if (eventKey.startsWith('photosColorizeBy-')) {
        dispatch(
          galleryColorizeBy(
            (eventKey.slice(17) || null) as GalleryColorizeBy | null,
          ),
        );
      } else if (eventKey.startsWith('lang-')) {
        dispatch(l10nSetChosenLanguage({ language: eventKey.slice(5) }));

        setShow(false);
      } else if (eventKey.startsWith('open-')) {
        const where = eventKey.slice(5);

        if (is<ExternalTargets>(where)) {
          dispatch(
            openInExternalApp({
              where,
              lat,
              lon,
              zoom,
              mapType,
              pointTitle,
              pointDescription,
            }),
          );
        }

        setShow(false);
      } else if (eventKey.startsWith('overlays-toggle-')) {
        dispatch(
          mapRefocus({
            overlays: overlays.includes('I')
              ? overlays.filter((o) => o !== 'I')
              : [...overlays, 'I'],
          }),
        );
      } else if (eventKey === 'close' || eventKey === 'url') {
        setShow(false);
      } else if (extraHandler.current?.(eventKey)) {
        // nothing
      }
    },
    [dispatch, lat, lon, mapType, pointDescription, pointTitle, zoom, overlays],
  );

  const handleMenuToggle = useCallback((nextShow: boolean) => {
    setShow(nextShow);
  }, []);

  const closeMenu = useCallback(() => {
    setShow(false);
  }, []);

  return {
    handleSelect,
    menuShown,
    handleMenuToggle,
    closeMenu,
    submenu,
    extraHandler,
  };
}
