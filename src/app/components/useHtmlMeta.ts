import { getMessageByKey, useMessages } from '@features/l10n/l10nInjector.js';
import { useTrackingMessages } from '@features/tracking/translations/useTrackingMessages.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import type { MessagePaths } from '@shared/types/common.js';
import { useEffect } from 'react';
import type { Modal } from '../store/actions.js';

// TODO partial: some documents have no title key yet
const modalTitleKeys: Partial<Record<Modal, MessagePaths>> = {
  legend: 'mainMenu.mapLegend',
  'file-import': 'trackViewer.uploadModal.title',
  about: 'mainMenu.contacts',
  'map-features-export': 'mainMenu.mapFeaturesExport',
  'map-to-document-export': 'mainMenu.mapToDocumentExport',
  account: 'mainMenu.account',
  'map-layers-config': 'mapLayers.configureLayers',
  'custom-maps': 'mapLayers.customMaps',
  'map-preferences': 'mapLayers.preferences',
  embed: 'mainMenu.embedMap',
  'support-us': 'mainMenu.supportUs',
  'my-maps': 'tools.myMaps',
  'current-drawing-properties': 'drawing.edit.title',
  login: 'mainMenu.logIn',
  premium: 'premium.title',
  'gallery-filter': 'gallery.filterModal.title',
  'gallery-upload': 'gallery.uploadModal.title',
  'drawing-properties': 'drawing.defProps.menuItem',
};

export function useHtmlMeta(): void {
  const m = useMessages();

  const tm = useTrackingMessages();

  const activeModal = useAppSelector((state) => state.main.activeModal);

  useEffect(() => {
    if (!m) {
      return;
    }

    const { head } = document;

    const { title, description } = m.main;

    const titleElement = head.querySelector('title');

    const modalKey = activeModal && modalTitleKeys[activeModal];

    // tracking modal titles live in the per-feature bundle, not global Messages
    const modalTitle: string | undefined =
      activeModal === 'tracking-watched'
        ? tm?.trackedDevices.modalTitle
        : activeModal === 'tracking-my'
          ? tm?.devices.modalTitle
          : modalKey
            ? String(getMessageByKey(m, modalKey))
            : undefined;

    const fullTitle = (modalTitle ? modalTitle + ' | ' : '') + title;

    if (titleElement) {
      titleElement.innerText = fullTitle;
    }

    document.title = fullTitle;

    head
      .querySelector('meta[name="description"]')
      ?.setAttribute('content', description);

    head
      .querySelector('meta[property="og:title"]')
      ?.setAttribute('content', fullTitle);

    head
      .querySelector('meta[property="og:description"]')
      ?.setAttribute('content', description);
  }, [m, tm, activeModal]);
}
