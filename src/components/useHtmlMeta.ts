import { useEffect } from 'react';
import type { Modal } from '../actions/mainActions.js';
import { useAppSelector } from '../hooks/reduxSelectHook.js';
import { getMessageByKey, useMessages } from '../l10nInjector.js';
import type { MessagePaths } from '../types/common.js';

// TODO Partiel because of missing documents (formerly tips)
const modalTitleKeys: Partial<Record<Modal, MessagePaths>> = {
  legend: 'mainMenu.mapLegend',
  'upload-track': 'trackViewer.uploadModal.title',
  about: 'mainMenu.contacts',
  'export-map-features': 'mainMenu.mapFeaturesExport',
  'export-map': 'mainMenu.mapExport',
  account: 'mainMenu.account',
  'map-settings': 'mapLayers.layers',
  embed: 'mainMenu.embedMap',
  'support-us': 'mainMenu.supportUs',
  'tracking-watched': 'tracking.trackedDevices.modalTitle',
  'tracking-my': 'tracking.devices.modalTitle',
  maps: 'tools.maps',
  'edit-label': 'drawing.edit.title',
  login: 'mainMenu.logIn',
  premium: 'premium.title',
  'gallery-filter': 'gallery.filterModal.title',
  'gallery-upload': 'gallery.uploadModal.title',
  'drawing-properties': 'drawing.defProps.menuItem',
};

export function useHtmlMeta(): void {
  const m = useMessages();

  const activeModal = useAppSelector((state) => state.main.activeModal);

  useEffect(() => {
    if (!m) {
      return;
    }

    const { head } = document;

    const { title, description } = m.main;

    const titleElement = head.querySelector('title');

    const modalKey = activeModal && modalTitleKeys[activeModal];

    const fullTitle =
      (modalKey ? getMessageByKey(m, modalKey) + ' | ' : '') + title;

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
  }, [m, activeModal]);
}
