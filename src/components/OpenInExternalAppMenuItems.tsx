import { ReactElement } from 'react';
import { Dropdown } from 'react-bootstrap';
import {
  FaClipboard,
  // FaFacebook,
  FaLink,
  FaShareAlt,
  FaTwitter,
  FaWindowMaximize,
} from 'react-icons/fa';
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
  getTwitterUrl,
  getWazeUrl,
  getZbgisUrl,
} from '../externalUrlUtils.js';
import { useMessages } from '../l10nInjector.js';
import { LatLon } from '../types/common.js';

interface Props extends LatLon {
  lat: number;
  lon: number;
  zoom: number;
  mapType: string;
  includePoint?: boolean;
  url?: string;
  showKbdShortcut?: boolean;
  copy?: boolean;
}

export function OpenInExternalAppDropdownItems({
  lat,
  lon,
  zoom,
  mapType,
  includePoint,
  url,
  showKbdShortcut,
  copy = true,
}: Props): ReactElement {
  const m = useMessages();

  const hasShare = 'share' in window.navigator;

  const hasClipboard = !!window.navigator.clipboard?.writeText;

  return (
    <>
      {url && (
        <>
          <Dropdown.Item href={url} target="_blank" eventKey="url">
            <FaWindowMaximize /> {m?.external.window}
          </Dropdown.Item>

          {hasShare && (
            <Dropdown.Item as="button" eventKey="open-url">
              <FaLink /> {m?.external.url}
            </Dropdown.Item>
          )}

          {'canShare' in window.navigator && (
            <Dropdown.Item as="button" eventKey="open-image">
              <FaShareAlt /> {m?.external.image}
            </Dropdown.Item>
          )}

          <Dropdown.Divider />
        </>
      )}

      {!url && hasClipboard && copy && (
        <Dropdown.Item as="button" eventKey="open-copy">
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
        <Dropdown.Item as="button" eventKey="open-url">
          <FaLink /> {m?.external.url}
        </Dropdown.Item>
      )}

      {!url && ((hasClipboard && copy) || hasShare) && <Dropdown.Divider />}

      {/* <Dropdown.Item as="button" eventKey="open-facebook">
        <FaFacebook /> Facebook
        {showKbdShortcut && (
          <>
            {' '}
            <kbd>j</kbd> <kbd>f</kbd>
          </>
        )}
      </Dropdown.Item> */}

      <Dropdown.Item
        href={getTwitterUrl()}
        target="_blank"
        eventKey="open-twitter"
      >
        <FaTwitter /> Twitter
        {showKbdShortcut && (
          <>
            {' '}
            <kbd>j</kbd> <kbd>t</kbd>
          </>
        )}
      </Dropdown.Item>

      <Dropdown.Divider />

      <Dropdown.Item
        href={getOsmUrl(lat, lon, zoom, includePoint)}
        target="_blank"
        eventKey="url"
      >
        {m?.external.osm}
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
        {m?.external.mapy_cz}
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
        {m?.external.googleMaps}
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
        href={getWazeUrl(lat, lon, zoom)}
        target="_blank"
        eventKey="url"
      >
        Waze
      </Dropdown.Item>

      <Dropdown.Item
        href={getOmaUrl(lat, lon, zoom, mapType)}
        target="_blank"
        eventKey="url"
      >
        {m?.external.oma} (SK)
      </Dropdown.Item>

      <Dropdown.Item
        href={getHikingSkUrl(lat, lon, zoom, includePoint)}
        target="_blank"
        eventKey="url"
      >
        {m?.external.hiking_sk} (SK)
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
        {m?.external.zbgis} (SK)
        {showKbdShortcut && (
          <>
            {' '}
            <kbd>j</kbd> <kbd>z</kbd>
          </>
        )}
      </Dropdown.Item>

      <Dropdown.Divider />

      <Dropdown.Item as="button" eventKey="open-josm">
        {m?.external.josm}
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
        {m?.external.id}
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
