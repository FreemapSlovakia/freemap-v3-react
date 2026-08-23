import type { ExternalTarget } from '@app/store/actions.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { useOpenInExternalAppMessages } from '@features/openInExternalApp/translations/useOpenInExternalAppMessages.js';
import { Chord } from '@shared/components/Chord.js';
import { CountryFlag } from '@shared/components/CountryFlag.js';
import { OnlineOnlyItem } from '@shared/components/OnlineOnlyItem.js';
import type { LatLon } from '@shared/types/common.js';
import { canShareFile } from '@shared/webShare.js';
import type { ReactElement, ReactNode } from 'react';
import { Dropdown } from 'react-bootstrap';
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
  getStravaUrl,
  getWazeUrl,
  getZbgisUrl,
} from '../externalUrlUtils.js';

interface PageProps {
  /** The page this menu is about: opened in a window, or shared as a link. */
  url?: string;
  /** The picture itself, where there is one — what the `image` target shares as a file. */
  imageUrl?: string;
  showKbdShortcut?: boolean;
  copy?: boolean;
}

interface TargetProps
  extends LatLon,
    Pick<PageProps, 'url' | 'showKbdShortcut'> {
  zoom: number;
  includePoint?: boolean;
  /**
   * Offer the two editors. Off where the caller has editor entries of its own —
   * these open whatever is at the position, which for a selected OSM element is
   * not the same thing as opening the element.
   */
  editors?: boolean;
  /** Targets of the caller's own, standing before the rest. */
  children?: ReactNode;
}

export function openMenuItemProps(externalTarget: ExternalTarget) {
  return {
    eventKey: `open-${externalTarget}`,
  };
}

/**
 * Which of the page items would render. Sharing the picture itself needs a picture and a browser
 * that shares files — a different question from knowing the API: Firefox has `canShare` and shares
 * no file at all, and Chromium has a share sheet only on some platforms.
 */
function pageItemFlags({ url, imageUrl, copy = true }: PageProps) {
  return {
    canCopy: !url && Boolean(window.navigator.clipboard?.writeText) && copy,
    hasShare: 'share' in window.navigator,
    canShareImage: Boolean(imageUrl) && canShareFile('photo.jpg', 'image/jpeg'),
  };
}

/**
 * Whether anything acts on the page itself here — what {@link SharePageItems}
 * would render, which decides whether it needs separating from the targets.
 */
export function hasPageItems(props: PageProps): boolean {
  return Object.values(pageItemFlags(props)).some(Boolean);
}

/** Acting on the page itself: copying its address, sharing it, sharing the picture. */
export function SharePageItems({
  showKbdShortcut,
  ...props
}: PageProps): ReactElement {
  const m = useMessages();

  const oeam = useOpenInExternalAppMessages();

  const { canCopy, hasShare, canShareImage } = pageItemFlags(props);

  return (
    <>
      {canCopy && (
        <Dropdown.Item as="button" {...openMenuItemProps('copy')}>
          <FaClipboard /> {m?.general.copyPageUrl}
          {showKbdShortcut && (
            <>
              {' '}
              <Chord external="copy" />
            </>
          )}
        </Dropdown.Item>
      )}

      {hasShare && (
        <Dropdown.Item as="button" {...openMenuItemProps('url')}>
          <FaLink /> {oeam?.url}
        </Dropdown.Item>
      )}

      {canShareImage && (
        <Dropdown.Item as="button" {...openMenuItemProps('image')}>
          <FaShareAlt /> {oeam?.image}
        </Dropdown.Item>
      )}
    </>
  );
}

/** Everywhere the place itself can be opened. */
export function OpenInExternalTargetItems({
  lat,
  lon,
  zoom: rawZoom,
  includePoint,
  url,
  showKbdShortcut,
  editors = true,
  children,
}: TargetProps): ReactElement {
  // Whole levels only: several of the targets below — ZBGIS, hiking.sk,
  // Geocaching — take the zoom as an integer and make nothing of a fraction.
  // The items are plain links, so this is the only thing standing between a
  // fractional map zoom and their URLs; the targets reached by dispatching
  // `openInExternalApp` instead are rounded in its processor.
  const zoom = Math.round(rawZoom);

  const oeam = useOpenInExternalAppMessages();

  return (
    <>
      {url && (
        <Dropdown.Item href={url} target="_blank" eventKey="url">
          <FaWindowMaximize /> {oeam?.window}
        </Dropdown.Item>
      )}

      {children}

      <OnlineOnlyItem
        href={getOsmUrl(lat, lon, zoom, includePoint)}
        target="_blank"
        eventKey="url"
      >
        {oeam?.osm}
        {showKbdShortcut && (
          <>
            {' '}
            <Chord external="osm.org" />
          </>
        )}
      </OnlineOnlyItem>

      {/* The editors of what the item above shows, so they stand with it. */}
      {editors && (
        <>
          <Dropdown.Item as="button" {...openMenuItemProps('josm')}>
            {oeam?.josm}
            {showKbdShortcut && (
              <>
                {' '}
                <Chord external="josm" />
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
                <Chord external="osm.org/id" />
              </>
            )}
          </OnlineOnlyItem>
        </>
      )}

      <OnlineOnlyItem
        href={getMapyCzUrl(lat, lon, zoom, includePoint)}
        target="_blank"
        eventKey="url"
      >
        {oeam?.mapy_cz}
        {showKbdShortcut && (
          <>
            {' '}
            <Chord external="mapy.com" />
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
            <Chord external="google" />
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
            <Chord external="f4map" />
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
            <Chord external="peakfinder" />
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
            <Chord external="mapillary" />
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
        {oeam?.oma} <CountryFlag country="sk" />
      </OnlineOnlyItem>

      <OnlineOnlyItem
        href={getHikingSkUrl(lat, lon, zoom, includePoint)}
        target="_blank"
        eventKey="url"
      >
        {oeam?.hiking_sk} <CountryFlag country="sk" />
        {showKbdShortcut && (
          <>
            {' '}
            <Chord external="hiking.sk" />
          </>
        )}
      </OnlineOnlyItem>

      <OnlineOnlyItem
        href={getZbgisUrl(lat, lon, zoom)}
        target="_blank"
        eventKey="url"
      >
        {oeam?.zbgis} <CountryFlag country="sk" />
        {showKbdShortcut && (
          <>
            {' '}
            <Chord external="zbgis" />
          </>
        )}
      </OnlineOnlyItem>
    </>
  );
}

/** Both halves in one menu, for a menu that is nothing but this. */
export function OpenInExternalAppDropdownItems(
  props: TargetProps & PageProps,
): ReactElement {
  return (
    <>
      <SharePageItems {...props} />

      {hasPageItems(props) && <Dropdown.Divider />}

      <OpenInExternalTargetItems {...props} />
    </>
  );
}
