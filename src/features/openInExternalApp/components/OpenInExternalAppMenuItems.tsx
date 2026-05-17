import { useMessages } from '@features/l10n/l10nInjector.js';
import { Kbd, Menu } from '@mantine/core';
import type { LatLon } from '@shared/types/common.js';
import type { ReactElement } from 'react';
import {
  FaClipboard,
  FaLink,
  FaShareAlt,
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
  onSelect?: (eventKey: string) => void;
}

export function OpenInExternalAppDropdownItems({
  lat,
  lon,
  zoom,
  includePoint,
  url,
  showKbdShortcut,
  copy = true,
  onSelect,
}: Props): ReactElement {
  const m = useMessages();

  const hasShare = 'share' in window.navigator;

  const hasClipboard = Boolean(window.navigator.clipboard?.writeText);

  const select = (eventKey: string) => () => onSelect?.(eventKey);

  return (
    <>
      {url && (
        <>
          <Menu.Item
            component="a"
            href={url}
            target="_blank"
            leftSection={<FaWindowMaximize />}
            onClick={select('url')}
          >
            {m?.external.window}
          </Menu.Item>

          {hasShare && (
            <Menu.Item leftSection={<FaLink />} onClick={select('open-url')}>
              {m?.external.url}
            </Menu.Item>
          )}

          {'canShare' in window.navigator && (
            <Menu.Item
              leftSection={<FaShareAlt />}
              onClick={select('open-image')}
            >
              {m?.external.image}
            </Menu.Item>
          )}

          <Menu.Divider />
        </>
      )}

      {!url && hasClipboard && copy && (
        <Menu.Item
          leftSection={<FaClipboard />}
          rightSection={
            showKbdShortcut ? (
              <>
                <Kbd>j</Kbd> <Kbd>c</Kbd>
              </>
            ) : null
          }
          onClick={select('open-copy')}
        >
          {m?.general.copyPageUrl}
        </Menu.Item>
      )}

      {!url && hasShare && (
        <Menu.Item leftSection={<FaLink />} onClick={select('open-url')}>
          {m?.external.url}
        </Menu.Item>
      )}

      {!url && ((hasClipboard && copy) || hasShare) && <Menu.Divider />}

      <Menu.Item
        component="a"
        href={getOsmUrl(lat, lon, zoom, includePoint)}
        target="_blank"
        rightSection={
          showKbdShortcut ? (
            <>
              <Kbd>j</Kbd> <Kbd>o</Kbd>
            </>
          ) : null
        }
        onClick={select('url')}
      >
        {m?.external.osm}
      </Menu.Item>

      <Menu.Item
        component="a"
        href={getMapyCzUrl(lat, lon, zoom, includePoint)}
        target="_blank"
        rightSection={
          showKbdShortcut ? (
            <>
              <Kbd>j</Kbd> <Kbd>m</Kbd>
            </>
          ) : null
        }
        onClick={select('url')}
      >
        {m?.external.mapy_cz}
      </Menu.Item>

      <Menu.Item
        component="a"
        href={getGoogleUrl(lat, lon, zoom, includePoint)}
        target="_blank"
        rightSection={
          showKbdShortcut ? (
            <>
              <Kbd>j</Kbd> <Kbd>g</Kbd>
            </>
          ) : null
        }
        onClick={select('url')}
      >
        {m?.external.googleMaps}
      </Menu.Item>

      <Menu.Item
        component="a"
        href={getGeocachingUrl(lat, lon, zoom)}
        target="_blank"
        onClick={select('url')}
      >
        Geocaching
      </Menu.Item>

      <Menu.Item
        component="a"
        href={getF4mapUrl(lat, lon, zoom)}
        target="_blank"
        rightSection={
          showKbdShortcut ? (
            <>
              <Kbd>j</Kbd> <Kbd>4</Kbd>
            </>
          ) : null
        }
        onClick={select('url')}
      >
        F4Map
      </Menu.Item>

      <Menu.Item
        component="a"
        href={getPeakfinderUrl(lat, lon)}
        target="_blank"
        rightSection={
          showKbdShortcut ? (
            <>
              <Kbd>j</Kbd> <Kbd>p</Kbd>
            </>
          ) : null
        }
        onClick={select('url')}
      >
        Peakfinder
      </Menu.Item>

      <Menu.Item
        component="a"
        href={getMapillaryUrl(lat, lon, zoom)}
        target="_blank"
        rightSection={
          showKbdShortcut ? (
            <>
              <Kbd>j</Kbd> <Kbd>l</Kbd>
            </>
          ) : null
        }
        onClick={select('url')}
      >
        Mapillary
      </Menu.Item>

      <Menu.Item
        component="a"
        href={getOpenStreetCamUrl(lat, lon, zoom)}
        target="_blank"
        onClick={select('url')}
      >
        OpenStreetCam
      </Menu.Item>

      <Menu.Item
        component="a"
        href={getWazeUrl(lat, lon, zoom)}
        target="_blank"
        onClick={select('url')}
      >
        Waze
      </Menu.Item>

      <Menu.Item
        component="a"
        href={getOmaUrl(lat, lon, zoom)}
        target="_blank"
        onClick={select('url')}
      >
        {m?.external.oma} (SK)
      </Menu.Item>

      <Menu.Item
        component="a"
        href={getHikingSkUrl(lat, lon, zoom, includePoint)}
        target="_blank"
        rightSection={
          showKbdShortcut ? (
            <>
              <Kbd>j</Kbd> <Kbd>h</Kbd>
            </>
          ) : null
        }
        onClick={select('url')}
      >
        {m?.external.hiking_sk} (SK)
      </Menu.Item>

      <Menu.Item
        component="a"
        href={getZbgisUrl(lat, lon, zoom)}
        target="_blank"
        rightSection={
          showKbdShortcut ? (
            <>
              <Kbd>j</Kbd> <Kbd>z</Kbd>
            </>
          ) : null
        }
        onClick={select('url')}
      >
        {m?.external.zbgis} (SK)
      </Menu.Item>

      <Menu.Divider />

      <Menu.Item
        rightSection={
          showKbdShortcut ? (
            <>
              <Kbd>j</Kbd> <Kbd>j</Kbd>
            </>
          ) : null
        }
        onClick={select('open-josm')}
      >
        {m?.external.josm}
      </Menu.Item>

      <Menu.Item
        component="a"
        href={getIdUrl(lat, lon, zoom)}
        target="_blank"
        rightSection={
          showKbdShortcut ? (
            <>
              <Kbd>j</Kbd> <Kbd>i</Kbd>
            </>
          ) : null
        }
        onClick={select('url')}
      >
        {m?.external.id}
      </Menu.Item>
    </>
  );
}
