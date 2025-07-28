import storage from 'local-storage-fallback';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { is } from 'typia';
import { l10nSetChosenLanguage } from '../actions/l10nActions.js';
import {
  ExternalTargets,
  Modal,
  Tool,
  clearMapFeatures,
  documentShow,
  openInExternalApp,
  saveSettings,
  setActiveModal,
  setTool,
} from '../actions/mainActions.js';
import { mapRefocus } from '../actions/mapActions.js';
import { Submenu } from '../components/mainMenu/submenu.js';
import { useAppSelector } from './useAppSelector.js';

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

  const layers = useAppSelector((state) => state.map.layers);

  const [menuShown, setShow] = useState(false);

  const [submenu, setSubmenu] = useState<Submenu>(null);

  const stack = useRef<Submenu[]>([]);

  useEffect(() => {
    function handle(e: KeyboardEvent) {
      if (e.code === 'Escape') {
        setSubmenu((submenu) => {
          if (!submenu) {
            setShow(false);
          }

          return null;
        });

        e.preventDefault();
      }
    }

    window.addEventListener('keydown', handle);

    return () => {
      window.removeEventListener('keydown', handle);
    };
  }, []);

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

  const sendGalleryEmails = useAppSelector(
    (state) => state.auth.user?.sendGalleryEmails,
  );

  const extraHandler = useRef<(eventKey: string) => boolean>(undefined);

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
        dispatch(documentShow(eventKey.slice(9)));

        setShow(false);
      } else if (eventKey.startsWith('tool-')) {
        dispatch(setTool((eventKey.slice(5) || null) as Tool | null));

        setShow(false);
      } else if (eventKey === 'drawing') {
        const tool = storage.getItem('drawingTool') ?? 'draw-points';

        if (is<Tool>(tool)) {
          dispatch(setTool(tool));
        }

        setShow(false);
      } else if (eventKey === 'clear-map-features') {
        dispatch(clearMapFeatures());

        setShow(false);
      } else if (eventKey.startsWith('lang-')) {
        dispatch(
          l10nSetChosenLanguage({ language: eventKey.slice(5) || null }),
        );

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
              pointTitle,
              pointDescription,
            }),
          );
        }

        setShow(false);
      } else if (eventKey.startsWith('gallery')) {
        dispatch(
          mapRefocus({
            layers: layers.includes('I')
              ? layers.filter((o) => o !== 'I')
              : [...layers, 'I'],
          }),
        );

        setShow(false);
      } else if (eventKey === 'close' || eventKey === 'url') {
        setShow(false);
      } else if (eventKey === 'galEmails') {
        dispatch(
          saveSettings({
            user: {
              sendGalleryEmails: !sendGalleryEmails,
            },
          }),
        );
      } else if (extraHandler.current?.(eventKey)) {
        // nothing
      }
    },
    [
      dispatch,
      lat,
      lon,
      pointDescription,
      pointTitle,
      zoom,
      layers,
      sendGalleryEmails,
    ],
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
