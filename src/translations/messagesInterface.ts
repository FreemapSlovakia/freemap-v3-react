import { HttpError, NetworkError } from '@app/httpRequest.js';
import type { SearchSource } from '@features/search/model/actions.js';
import type { DeepPartial } from '@shared/types/deepPartial.js';
import type { JSX, ReactNode } from 'react';

type Err = { err: unknown };

export type Messages = {
  general: {
    iso: string;
    elevationProfile: string;
    save: string;
    cancel: string;
    modify: string;
    delete: string;
    remove: string;
    close: string;
    collapse: string;
    expand: string;
    apply: string;
    exitFullscreen: string;
    fullscreen: string;
    yes: string;
    no: string;
    masl: string;
    copyCode: string;
    loading: string;
    ok: string;
    preventShowingAgain: string;
    closeWithoutSaving: string;
    resetToDefaults: string;
    back: string;
    internalError: ({ ticketId }: { ticketId?: string }) => JSX.Element;
    processorError: (props: Err) => string;
    seconds: string;
    minutes: string;
    meters: string;
    createdAt: string;
    modifiedAt: string;
    actions: string;
    add: string;
    clear: string;
    convertToDrawing: string;
    simplifyPrompt: string;
    copyUrl: string;
    copyPageUrl: string;
    savingError: (props: Err) => string;
    loadError: (props: Err) => string;
    deleteError: (props: Err) => string;
    operationError: (props: Err) => string;
    saved: string;
    deleted: string;
    visual: string;
    drawingTool: string;
    copyOk: string;
    noCookies: () => JSX.Element;
    name: string;
    load: string;
    unnamed: string;
    enablePopup: string;
    broadcastChannelUnsupported: string;
    componentLoadingError: string;
    offline: string;
    connectionError: string;
    experimentalFunction: string;
    attribution: () => JSX.Element;
    unauthenticatedError: string;
    confirmation: string;
    export: string;
    success: string;
    expiration: string;
    privacyPolicy: string;
    termsOfService: string;
    refundPolicy: string;
    infoAndLegal: string;
    newOptionText: string;
    deleteButtonText: string;
    accept: string;
  };
  generic: {
    color: string;
    size: string;
    weight: string;
    width: string;
  };
  theme: {
    light: string;
    dark: string;
    auto: string;
  };
  selections: {
    objects: string;
    drawPoints: string;
    drawLines: string;
    drawPolygons: string;
    tracking: string;
    linePoint: string;
    polygonPoint: string;
  };
  tools: {
    none: string;
    routePlanner: string;
    objects: string;
    photos: string;
    measurement: string;
    drawPoints: string;
    drawLines: string;
    drawPolygons: string;
    trackViewer: string;
    changesets: string;
    mapDetails: string;
    tracking: string;
    myMap: string;
    myMaps: string;
  };
  mainMenu: {
    title: string;
    logOut: string;
    logIn: string;
    account: string;
    mapFeaturesExport: string;
    gpsDevicesMapExports: string;
    embedMap: string;
    offlineMapExport: string;
    supportUs: string;
    help: string;
    back: string;
    mapLegend: string;
    contacts: string;
    facebook: string;
    twitter: string;
    youtube: string;
    github: string;
    mastodon: string;
    googlePlay: string;
    appStore: string;
    automaticLanguage: string;
    mapToDocumentExport: string;
    osmWiki: string;
    wikiLink: string;
    status: string;
    language: string;
  };
  main: {
    title: string;
    description: string;
    clearMap: string;
    close: string;
    closeTool: string;
    locateMe: string;
    locationError: string;
    zoomIn: string;
    zoomOut: string;
    devInfo: () => JSX.Element;
    copyright: string;
    infoBars: Record<string, () => JSX.Element>;
    cookieConsent: () => JSX.Element;
  };
  search: {
    inProgress: string;
    noResults: string;
    prompt: string;
    routeFrom: string;
    routeTo: string;
    fetchingError: (props: Err) => string;
    buttonTitle: string;
    placeholder: string;
    result: string;
    sources: Record<SearchSource, string>;
  };
  mapLayers: {
    showMore: string;
    showAll: string;
    filterMaps: string;
    noMapsFound: string;
    settings: string;
    layers: string;
    switch: string;
    photoFilterWarning: string;
    interactiveLayerWarning: string;
    minZoomWarning: (minZoom: number) => string;
    outsideViewWarning: string;
    letters: Record<string, string>;
    customBase: string;
    type: {
      map: string;
      data: string;
      photos: string;
    };
    attr: Record<string, ReactNode>;
    configureLayers: string;
    customMaps: string;
    addCustomMap: string;
    activate: string;
    customMapsEmptyMessage: string;
    base: string;
    overlay: string;
    technology: string;
    technologies: {
      tile: string;
      maplibre: string;
      wms: string;
      parametricShading: string;
    };
    url: string;
    minZoom: string;
    maxNativeZoom: string;
    extraScales: string;
    scaleWithDpi: string;
    layer: {
      layer: string;
      base: string;
      overlay: string;
    };
    zIndex: string;
    preferences: string;
    maxZoom: string;
    forcedScale: string;
    resolutionScale: string;
    resolutionScaleAuto: string;
    resolutionScaleHelp: string;
    featureScale: string;
    featureScaleHelp: string;
    searchResultStyle: string;
    resetApp: string;
    resetAppConfirm: string;
    loadWmsLayers: string;
    offlineMaps: string;
    legacy: string;
    legacyMapWarning: (props: { from: string; to: string }) => JSX.Element;
  };
  elevationChart: {
    distance: string;
    ele: string;
    fetchError: (props: Err) => string;
  };
  errorCatcher: {
    html: (ticketId?: string) => string;
  };
  mapCtxMenu: {
    centerMap: string;
    measurePosition: string;
    addPoint: string;
    startLine: string;
    queryFeatures: string;
    startRoute: string;
    finishRoute: string;
    showPhotos: string;
  };
  errorStatus: Record<number, string>;
  gpu: {
    notSupported: string;
    noAdapter: string;
    lost: string;
    errorRequestingDevice: string;
    other: string;
  };
};

export function addError(
  dpMessages: DeepPartial<Messages>,
  message: string,
  err: unknown,
): string {
  const messages = dpMessages as Messages; // our message compiler will make it non-partial

  return (
    message +
    ': ' +
    (err instanceof HttpError
      ? (messages.errorStatus[err.status] ?? err.status) +
        (err.body ? `: ${err.body}` : '')
      : !(err instanceof Error)
        ? String(err)
        : // `NetworkError` is our httpRequest transport failure; a raw `fetch()`
          // failure instead throws a bare `TypeError`. Both mean the request
          // never reached the server, so show a friendly connection message
          // rather than the raw browser text. (Display only — an unrelated
          // `TypeError` mislabeled here is cosmetic, never a logic error.)
          err instanceof NetworkError || err instanceof TypeError
          ? ((window.navigator.onLine === false
              ? messages.general.offline
              : messages.general.connectionError) ?? err.message)
          : err.message)
  );
}
