import { ExternalTargets, openInExternalApp } from 'fm3/actions/mainActions';
import {
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
  getZbgisUrl,
} from 'fm3/externalUrlUtils';
import { useMessages } from 'fm3/l10nInjector';
import { LatLon } from 'fm3/types/common';
import { ReactElement, useCallback } from 'react';
import Dropdown from 'react-bootstrap/Dropdown';
import {
  FaClipboard,
  FaFacebook,
  FaLink,
  FaShareAlt,
  FaTwitter,
  FaWindowMaximize,
} from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { is } from 'typescript-is';

interface Props extends LatLon {
  lat: number;
  lon: number;
  zoom: number;
  mapType: string;
  includePoint?: boolean;
  pointTitle?: string;
  pointDescription?: string;
  url?: string;
  onSelect?: () => void;
  showKbdShortcut?: boolean;
}

export function OpenInExternalAppDropdownItems({
  lat,
  lon,
  zoom,
  mapType,
  includePoint,
  pointTitle,
  pointDescription,
  url,
  onSelect,
  showKbdShortcut,
}: Props): ReactElement {
  const m = useMessages();

  const dispatch = useDispatch();

  const expertMode = useSelector((state) => state.main.expertMode);

  const handleSelect = useCallback(
    (where: string | null) => {
      onSelect?.();

      if (is<ExternalTargets>(where)) {
        dispatch(
          openInExternalApp({
            where,
            lat,
            lon,
            zoom,
            mapType,
            includePoint,
            pointTitle,
            pointDescription,
            url,
          }),
        );
      }
    },
    [
      onSelect,
      dispatch,
      lat,
      lon,
      zoom,
      mapType,
      includePoint,
      pointTitle,
      pointDescription,
      url,
    ],
  );

  const hasShare = 'share' in navigator;

  const hasClipboard = navigator.clipboard?.writeText;

  return (
    <>
      {url && (
        <>
          <Dropdown.Item href={url} target="_blank" onSelect={handleSelect}>
            <FaWindowMaximize /> {m?.external.window}
          </Dropdown.Item>
          {hasShare && (
            <Dropdown.Item as="button" eventKey="url" onSelect={handleSelect}>
              <FaLink /> {m?.external.url}
            </Dropdown.Item>
          )}
          {(navigator as any).canShare && (
            <Dropdown.Item as="button" eventKey="image" onSelect={handleSelect}>
              <FaShareAlt /> {m?.external.image}
            </Dropdown.Item>
          )}
          <Dropdown.Divider />
        </>
      )}
      {!url && hasClipboard && (
        <Dropdown.Item as="button" eventKey="copy" onSelect={handleSelect}>
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
        <Dropdown.Item as="button" eventKey="url" onSelect={handleSelect}>
          <FaLink /> {m?.external.url}
        </Dropdown.Item>
      )}
      {!url && (hasClipboard || hasShare) && <Dropdown.Divider />}
      <Dropdown.Item as="button" eventKey="facebook" onSelect={handleSelect}>
        <FaFacebook /> Facebook
        {showKbdShortcut && (
          <>
            {' '}
            <kbd>j</kbd> <kbd>f</kbd>
          </>
        )}
      </Dropdown.Item>
      <Dropdown.Item
        href={getTwitterUrl()}
        target="_blank"
        eventKey="twitter"
        onSelect={handleSelect}
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
        onSelect={handleSelect}
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
        onSelect={handleSelect}
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
        onSelect={handleSelect}
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
        href={getPeakfinderUrl(lat, lon)}
        target="_blank"
        onSelect={handleSelect}
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
        onSelect={handleSelect}
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
        onSelect={handleSelect}
      >
        OpenStreetCam
      </Dropdown.Item>
      <Dropdown.Item
        href={getOmaUrl(lat, lon, zoom, mapType)}
        targer="_blank"
        onSelect={handleSelect}
      >
        {m?.external.oma} (SK)
      </Dropdown.Item>
      <Dropdown.Item
        href={getHikingSkUrl(lat, lon, zoom, includePoint)}
        target="_blank"
        onSelect={handleSelect}
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
        onSelect={handleSelect}
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
      {expertMode && (
        <Dropdown.Item as="button" eventKey="josm" onSelect={handleSelect}>
          {m?.external.josm}
          {showKbdShortcut && (
            <>
              {' '}
              <kbd>j</kbd> <kbd>j</kbd>
            </>
          )}
        </Dropdown.Item>
      )}
      <Dropdown.Item
        href={getIdUrl(lat, lon, zoom)}
        target="_blank"
        onSelect={handleSelect}
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
