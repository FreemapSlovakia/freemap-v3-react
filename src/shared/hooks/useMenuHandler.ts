import {
  clearMapFeatures,
  closeTool,
  type ExternalTarget,
  openInExternalApp,
  openTool,
  resetApp,
  saveSettings,
  setActiveModal,
  type Tool,
  ToolSchema,
} from '@app/store/actions.js';
import { type ModalId, modalOf } from '@app/store/activeModal.js';
import { openToolsSelector } from '@app/store/selectors.js';
import {
  type Document,
  documentShow,
} from '@features/documents/model/actions.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { l10nSetChosenLanguage } from '@features/l10n/model/actions.js';
import type { Submenu } from '@features/mainMenu/components/submenu.js';
import { mapRefocus } from '@features/map/model/actions.js';
import { useConfirm } from '@shared/components/ConfirmProvider.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import type { Language } from '@shared/langUtils.js';
import type { LatLon } from '@shared/types/common.js';
import storage from 'local-storage-fallback';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { afterPrefix } from '../types/typeUtils.js';

export type EventKey =
  | 'url'
  | 'drawing'
  | 'clear-map-features'
  | 'reset-app'
  | 'close'
  | 'gallery'
  | 'galEmails'
  | `submenu-${NonNullable<Submenu> | ''}`
  | `document-${Document}`
  | `tool-${Tool}`
  | `lang-${Language | ''}`
  | `open-${ExternalTarget}`
  | `modal-${ModalId}`;

export function modalMenuItemProps(modalId: ModalId) {
  return {
    eventKey: `modal-${modalId}`,
    href: `#show=${modalId}`,
  };
}

export function documentMenuItemProps(document: string) {
  return {
    eventKey: `document-${document}`,
    href: `#document=${document}`,
  };
}

export function useMenuHandler({
  pointTitle,
  pointTags,
  pointDescription,
  imageUrl,
  at,
  includePoint,
}: {
  pointTitle?: string;
  /** What the place is, as OSM tags; see the `openInExternalApp` payload. */
  pointTags?: Record<string, string>;
  pointDescription?: string;
  /** The picture the `image` target shares as a file; nothing else here needs an address. */
  imageUrl?: string;
  /**
   * Where the external-app targets act, when that is not the middle of the map
   * — the position a menu belongs to, such as a drawn point's.
   */
  at?: LatLon;
  /** The position is a place in its own right: JOSM puts a node there. */
  includePoint?: boolean;
} = {}) {
  const dispatch = useDispatch();

  const m = useMessages();

  const confirm = useConfirm();

  // A caller that says where it acts doesn't re-render with the map.
  const lat = useAppSelector((state) => at?.lat ?? state.map.lat);

  const lon = useAppSelector((state) => at?.lon ?? state.map.lon);

  const zoom = useAppSelector((state) => state.map.zoom);

  const layers = useAppSelector((state) => state.map.layers);

  const openTools = useAppSelector(openToolsSelector);

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
        dispatch(setActiveModal(modalOf(modal)));

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
        const parsed = ToolSchema.safeParse(tool);

        if (parsed.success) {
          const t = parsed.data;

          // Menu items toggle: close it if it is open, otherwise open it beside
          // whatever else is.
          dispatch(openTools.includes(t) ? closeTool(t) : openTool(t));
        }

        setShow(false);

        return;
      }

      if (key === 'drawing') {
        const parsed = ToolSchema.safeParse(storage.getItem('fm.drawingTool'));

        dispatch(openTool(parsed.success ? parsed.data : 'draw-points'));

        setShow(false);

        return;
      }

      if (key === 'clear-map-features') {
        dispatch(clearMapFeatures());

        setShow(false);

        return;
      }

      if (key === 'reset-app') {
        setShow(false);

        confirm({
          message: m?.mapLayers.resetAppConfirm,
          confirmLabel: m?.mapLayers.resetApp,
          confirmStyle: 'danger',
        }).then((ok) => {
          if (ok) {
            // resetAppProcessor owns the side effect (drop the store, reload).
            dispatch(resetApp());
          }
        });

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
            includePoint,
            pointTitle,
            pointTags,
            pointDescription,
            imageUrl,
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
      m,
      confirm,
      lat,
      lon,
      includePoint,
      pointDescription,
      pointTitle,
      pointTags,
      imageUrl,
      zoom,
      layers,
      openTools,
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
