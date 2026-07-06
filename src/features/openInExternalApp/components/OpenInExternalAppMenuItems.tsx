import { useMessages } from '@features/l10n/l10nInjector.js';
import { useOpenInExternalAppMessages } from '@features/openInExternalApp/translations/useOpenInExternalAppMessages.js';
import type { LatLon } from '@shared/types/common.js';
import type { ReactElement } from 'react';
import { Dropdown } from 'react-bootstrap';
import {
  FaClipboard,
  FaLink,
  FaShareAlt,
  FaWindowMaximize,
} from 'react-icons/fa';
import type { ExternalTarget } from '@/app/store/actions.js';
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
  zoom,
  includePoint,
  url,
  showKbdShortcut,
  copy = true,
}: Props): ReactElement {
  const m = useMessages();

  const oeam = useOpenInExternalAppMessages();

  const hasShare = 'share' in window.navigator;

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

          {'canShare' in window.navigator && (
            <Dropdown.Item as="button" {...openMenuItemProps('image')}>
              <FaShareAlt /> {oeam?.image}
            </Dropdown.Item>
          )}

          <Dropdown.Divider />
        </>
      )}

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

      <Dropdown.Item
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
      </Dropdown.Item>

      <Dropdown.Item
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
      </Dropdown.Item>

      <Dropdown.Item
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
      </Dropdown.Item>

      <Dropdown.Item
        href={getGeocachingUrl(lat, lon, zoom)}
        target="_blank"
        eventKey="url"
      >
        Geocaching
      </Dropdown.Item>

      <Dropdown.Item
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
      </Dropdown.Item>

      <Dropdown.Item
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
      </Dropdown.Item>

      <Dropdown.Item
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
      </Dropdown.Item>

      <Dropdown.Item
        href={getOpenStreetCamUrl(lat, lon, zoom)}
        target="_blank"
        eventKey="url"
      >
        OpenStreetCam
      </Dropdown.Item>

      <Dropdown.Item
        href={getStravaUrl(lat, lon, zoom)}
        target="_blank"
        eventKey="url"
      >
        Strava
      </Dropdown.Item>

      <Dropdown.Item
        href={getWazeUrl(lat, lon, zoom)}
        target="_blank"
        eventKey="url"
      >
        Waze
      </Dropdown.Item>

      <Dropdown.Item
        href={getOmaUrl(lat, lon, zoom)}
        target="_blank"
        eventKey="url"
      >
        {oeam?.oma} (SK)
      </Dropdown.Item>

      <Dropdown.Item
        href={getHikingSkUrl(lat, lon, zoom, includePoint)}
        target="_blank"
        eventKey="url"
      >
        {oeam?.hiking_sk} (SK)
        {showKbdShortcut && (
          <>
            {' '}
            <kbd>j</kbd> <kbd>h</kbd>
          </>
        )}
      </Dropdown.Item>

      <Dropdown.Item
        href={getZbgisUrl(lat, lon, zoom)}
        target="_blank"
        eventKey="url"
      >
        {oeam?.zbgis} (SK)
        {showKbdShortcut && (
          <>
            {' '}
            <kbd>j</kbd> <kbd>z</kbd>
          </>
        )}
      </Dropdown.Item>

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

      <Dropdown.Item
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
      </Dropdown.Item>
    </>
  );
}
