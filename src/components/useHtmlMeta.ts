import { Modal } from 'fm3/actions/mainActions';
import { getMessageByKey, useMessages } from 'fm3/l10nInjector';
import { MessagePaths } from 'fm3/types/common';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';

const modalTitleKeys: Record<Modal, MessagePaths> = {
  legend: 'mainMenu.mapLegend',
  'upload-track': 'trackViewer.uploadModal.title',
  about: 'mainMenu.contacts',
  'export-gpx': 'mainMenu.gpxExport',
  'export-pdf': 'mainMenu.pdfExport',
  settings: 'mainMenu.settings',
  mapSettings: 'mapLayers.layers',
  embed: 'mainMenu.embedMap',
  supportUs: 'mainMenu.supportUs',
  'tracking-watched': 'tracking.trackedDevices.modalTitle',
  'tracking-my': 'tracking.devices.modalTitle',
  maps: 'tools.maps',
  tips: 'mainMenu.tips',
  'edit-label': 'drawing.edit.title',
  login: 'mainMenu.logIn',
  'remove-ads': 'removeAds.title',
};

export function useHtmlMeta(): void {
  const m = useMessages();

  const activeModal = useSelector((state) => state.main.activeModal);

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
