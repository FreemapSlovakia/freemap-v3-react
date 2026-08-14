import type { ExternalTarget } from '@app/store/actions.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { useOpenInExternalAppMessages } from '@features/openInExternalApp/translations/useOpenInExternalAppMessages.js';
import { OnlineOnlyItem } from '@shared/components/OnlineOnlyItem.js';
import type { LatLon } from '@shared/types/common.js';
import { canShareFile } from '@shared/webShare.js';
import type { ReactElement } from 'react';
import { Dropdown } from 'react-bootstrap';
import {
  FaClipboard,
  FaLink,
  FaShareAlt,
  FaWindowMaximize,
} from 'react-icons/fa';
import { Emoji } from '@/shared/components/Emoji.js';
import {
  getF4mapUrl,
  getGeocachingUrl,
  getGoogleUrl,
  getHikingSkUrl,
  getIdUrl,
  getMapillaryUrl,
  getMapyCzUrl,
  getOmaUrl,
  getOpenStreetCamUrl,
  getOsmUrl,
  getPeakfinderUrl,
  getStravaUrl,
  getWazeUrl,
  getZbgisUrl,
} from '../externalUrlUtils.js';

interface Props extends LatLon {
  lat: number;
  lon: number;
  zoom: number;
  includePoint?: boolean;
  url?: string;
  /** The picture itself, where there is one — what the `image` target shares as a file. */
  imageUrl?: string;
  showKbdShortcut?: boolean;
  copy?: boolean;
}

export function openMenuItemProps(externalTarget: ExternalTarget) {
  return {
    eventKey: `open-${externalTarget}`,
  };
}

export function OpenInExternalAppDropdownItems({
  lat,
  lon,
  zoom: rawZoom,
  includePoint,
  url,
  imageUrl,
  showKbdShortcut,
  copy = true,
}: Props): ReactElement {
  // Whole levels only: several of the targets below — ZBGIS, hiking.sk,
  // Geocaching — take the zoom as an integer and make nothing of a fraction.
  // The items are plain links, so this is the only thing standing between a
  // fractional map zoom and their URLs; the targets reached by dispatching
  // `openInExternalApp` instead are rounded in its processor.
  const zoom = Math.round(rawZoom);

  const m = useMessages();

  const oeam = useOpenInExternalAppMessages();

  const hasShare = 'share' in window.navigator;

  // Sharing the picture itself needs a picture to share and a browser that shares files — which is
  // a different question from knowing the API: Firefox has `canShare` and shares no file at all,
  // and Chromium has a share sheet only on some platforms. So the offer is made only where a photo
  // would actually be taken.
  const canShareImage =
    Boolean(imageUrl) && canShareFile('photo.jpg', 'image/jpeg');

  const hasClipboard = Boolean(window.navigator.clipboard?.writeText);

  return (
    <>
      {url && (
        <>
          <Dropdown.Item href={url} target="_blank" eventKey="url">
            <FaWindowMaximize /> {oeam?.window}
          </Dropdown.Item>

          {hasShare && (
            <Dropdown.Item as="button" {...openMenuItemProps('url')}>
              <FaLink /> {oeam?.url}
            </Dropdown.Item>
          )}
        </>
      )}

      {canShareImage && (
        <Dropdown.Item as="button" {...openMenuItemProps('image')}>
          <FaShareAlt /> {oeam?.image}
        </Dropdown.Item>
      )}

      {(url || canShareImage) && <Dropdown.Divider />}

      {!url && hasClipboard && copy && (
        <Dropdown.Item as="button" {...openMenuItemProps('copy')}>
          <FaClipboard /> {m?.general.copyPageUrl}
          {showKbdShortcut && (
            <>
              {' '}
              <kbd>j</kbd> <kbd>c</kbd>
            </>
          )}
        </Dropdown.Item>
      )}

      {!url && hasShare && (
        <Dropdown.Item as="button" {...openMenuItemProps('url')}>
          <FaLink /> {oeam?.url}
        </Dropdown.Item>
      )}

      {!url && ((hasClipboard && copy) || hasShare) && <Dropdown.Divider />}

      <OnlineOnlyItem
        href={getOsmUrl(lat, lon, zoom, includePoint)}
        target="_blank"
        eventKey="url"
      >
        {oeam?.osm}
        {showKbdShortcut && (
          <>
            {' '}
            <kbd>j</kbd> <kbd>o</kbd>
          </>
        )}
      </OnlineOnlyItem>

      <OnlineOnlyItem
        href={getMapyCzUrl(lat, lon, zoom, includePoint)}
        target="_blank"
        eventKey="url"
      >
        {oeam?.mapy_cz}
        {showKbdShortcut && (
          <>
            {' '}
            <kbd>j</kbd> <kbd>m</kbd>
          </>
        )}
      </OnlineOnlyItem>

      <OnlineOnlyItem
        href={getGoogleUrl(lat, lon, zoom, includePoint)}
        target="_blank"
        eventKey="url"
      >
        {oeam?.googleMaps}
        {showKbdShortcut && (
          <>
            {' '}
            <kbd>j</kbd> <kbd>g</kbd>
          </>
        )}
      </OnlineOnlyItem>

      <OnlineOnlyItem
        href={getGeocachingUrl(lat, lon, zoom)}
        target="_blank"
        eventKey="url"
      >
        Geocaching
      </OnlineOnlyItem>

      <OnlineOnlyItem
        href={getF4mapUrl(lat, lon, zoom)}
        target="_blank"
        eventKey="url"
      >
        F4Map
        {showKbdShortcut && (
          <>
            {' '}
            <kbd>j</kbd> <kbd>4</kbd>
          </>
        )}
      </OnlineOnlyItem>

      <OnlineOnlyItem
        href={getPeakfinderUrl(lat, lon)}
        target="_blank"
        eventKey="url"
      >
        Peakfinder
        {showKbdShortcut && (
          <>
            {' '}
            <kbd>j</kbd> <kbd>p</kbd>
          </>
        )}
      </OnlineOnlyItem>

      <OnlineOnlyItem
        href={getMapillaryUrl(lat, lon, zoom)}
        target="_blank"
        eventKey="url"
      >
        Mapillary
        {showKbdShortcut && (
          <>
            {' '}
            <kbd>j</kbd> <kbd>l</kbd>
          </>
        )}
      </OnlineOnlyItem>

      <OnlineOnlyItem
        href={getOpenStreetCamUrl(lat, lon, zoom)}
        target="_blank"
        eventKey="url"
      >
        OpenStreetCam
      </OnlineOnlyItem>

      <OnlineOnlyItem
        href={getStravaUrl(lat, lon, zoom)}
        target="_blank"
        eventKey="url"
      >
        Strava
      </OnlineOnlyItem>

      <OnlineOnlyItem
        href={getWazeUrl(lat, lon, zoom)}
        target="_blank"
        eventKey="url"
      >
        Waze
      </OnlineOnlyItem>

      <OnlineOnlyItem
        href={getOmaUrl(lat, lon, zoom)}
        target="_blank"
        eventKey="url"
      >
        {oeam?.oma} <Emoji>🇸🇰</Emoji>
      </OnlineOnlyItem>

      <OnlineOnlyItem
        href={getHikingSkUrl(lat, lon, zoom, includePoint)}
        target="_blank"
        eventKey="url"
      >
        {oeam?.hiking_sk} <Emoji>🇸🇰</Emoji>
        {showKbdShortcut && (
          <>
            {' '}
            <kbd>j</kbd> <kbd>h</kbd>
          </>
        )}
      </OnlineOnlyItem>

      <OnlineOnlyItem
        href={getZbgisUrl(lat, lon, zoom)}
        target="_blank"
        eventKey="url"
      >
        {oeam?.zbgis} <Emoji>🇸🇰</Emoji>
        {showKbdShortcut && (
          <>
            {' '}
            <kbd>j</kbd> <kbd>z</kbd>
          </>
        )}
      </OnlineOnlyItem>

      <Dropdown.Divider />

      <Dropdown.Item as="button" {...openMenuItemProps('josm')}>
        {oeam?.josm}
        {showKbdShortcut && (
          <>
            {' '}
            <kbd>j</kbd> <kbd>j</kbd>
          </>
        )}
      </Dropdown.Item>

      <OnlineOnlyItem
        href={getIdUrl(lat, lon, zoom)}
        target="_blank"
        eventKey="url"
      >
        {oeam?.id}
        {showKbdShortcut && (
          <>
            {' '}
            <kbd>j</kbd> <kbd>i</kbd>
          </>
        )}
      </OnlineOnlyItem>
    </>
  );
}
