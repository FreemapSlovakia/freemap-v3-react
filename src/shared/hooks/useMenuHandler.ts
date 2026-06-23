import {
  clearMapFeatures,
  closeTool,
  ExternalTarget,
  Modal,
  openInExternalApp,
  saveSettings,
  setActiveModal,
  setTool,
  Tool,
  ToolSchema,
} from '@app/store/actions.js';
import { Document, documentShow } from '@features/documents/model/actions.js';
import { l10nSetChosenLanguage } from '@features/l10n/model/actions.js';
import { Submenu } from '@features/mainMenu/components/submenu.js';
import { mapRefocus } from '@features/map/model/actions.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { Language } from '@shared/langUtils.js';
import storage from 'local-storage-fallback';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { afterPrefix } from '../types/typeUtils.js';

export type EventKey =
  | 'url'
  | 'drawing'
  | 'clear-map-features'
  | 'close'
  | 'gallery'
  | 'galEmails'
  | `submenu-${NonNullable<Submenu> | ''}`
  | `document-${Document}`
  | `tool-${Tool}`
  | `lang-${Language | ''}`
  | `open-${ExternalTarget}`
  | `modal-${Modal}`;

export function modalMenuItemProps(modal: Modal) {
  return {
    eventKey: `modal-${modal}`,
    href: `#show=${modal}`,
  };
}

export function documentMenuItemProps(document: string) {
  return {
    eventKey: `document-${document}`,
    href: `document=${document}`,
  };
}

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

  const tools = useAppSelector((state) => state.main.tools);

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
    if (!menuShown) {
      stack.current = [];

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

      const key = eventKey as EventKey;

      const modal = afterPrefix(key, 'modal-');

      if (modal !== undefined) {
        dispatch(setActiveModal(modal));

        setShow(false);

        return;
      }

      const submenu = afterPrefix(key, 'submenu-');

      if (submenu !== undefined) {
        setSubmenu(submenu || null);

        return;
      }

      const document = afterPrefix(key, 'document-');

      if (document !== undefined) {
        dispatch(documentShow(document));

        setShow(false);

        return;
      }

      const tool = afterPrefix(key, 'tool-');

      if (tool !== undefined) {
        if (!tool) {
          dispatch(setTool(null));
        } else {
          const parsed = ToolSchema.safeParse(tool);

          if (parsed.success) {
            const t = parsed.data;

            // Menu items toggle: close if open, otherwise open and focus it.
            dispatch(tools.includes(t) ? closeTool(t) : setTool(t));
          }
        }

        setShow(false);

        return;
      }

      if (key === 'drawing') {
        const parsed = ToolSchema.safeParse(storage.getItem('fm.drawingTool'));

        dispatch(setTool(parsed.success ? parsed.data : 'draw-points'));

        setShow(false);

        return;
      }

      if (key === 'clear-map-features') {
        dispatch(clearMapFeatures());

        setShow(false);

        return;
      }

      const lang = afterPrefix(key, 'lang-');

      if (lang !== undefined) {
        dispatch(l10nSetChosenLanguage({ language: lang || null }));

        setShow(false);

        return;
      }

      const where = afterPrefix(key, 'open-');

      if (where !== undefined) {
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

        setShow(false);

        return;
      }

      if (key === 'gallery') {
        dispatch(
          mapRefocus({
            layers: layers.includes('I')
              ? layers.filter((o) => o !== 'I')
              : [...layers, 'I'],
          }),
        );

        setShow(false);

        return;
      }

      if (key === 'close' || key === 'url') {
        setShow(false);

        return;
      }

      if (key === 'galEmails') {
        dispatch(
          saveSettings({
            user: {
              sendGalleryEmails: !sendGalleryEmails,
            },
          }),
        );

        return;
      }

      extraHandler.current?.(key);
    },
    [
      dispatch,
      lat,
      lon,
      pointDescription,
      pointTitle,
      zoom,
      layers,
      tools,
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
