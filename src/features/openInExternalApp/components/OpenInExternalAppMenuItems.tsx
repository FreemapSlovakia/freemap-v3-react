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
  SiApple,
  SiGeocaching,
  SiGooglemaps,
  SiGooglestreetview,
  SiMapillary,
  SiOpenstreetmap,
  SiStrava,
  SiWaze,
} from 'react-icons/si';
import { TbBrandWindy } from 'react-icons/tb';
import {
  getAppleMapsUrl,
  getArkodUrl,
  getAtlasOkoljaUrl,
  getBasemapAtUrl,
  getCuzkUrl,
  getF4mapUrl,
  getGeocachingUrl,
  getGeoportailUrl,
  getGeoportalPlUrl,
  getGoogleUrl,
  getHikingSkUrl,
  getIberpixUrl,
  getIdUrl,
  getKarttapaikkaUrl,
  getMapasPtUrl,
  getMapillaryUrl,
  getMapyCzUrl,
  getMinKartaUrl,
  getNorgeskartUrl,
  getOmaUrl,
  getOsmoseUrl,
  getOsmUrl,
  getPanoramaxUrl,
  getPcnUrl,
  getPdokUrl,
  getPeakfinderUrl,
  getStravaUrl,
  getStreetViewUrl,
  getTopomapviewerUrl,
  getWazeUrl,
  getWindyUrl,
  getZbgisUrl,
} from '../externalUrlUtils.js';
import { usePlaceCountries } from '../usePlaceCountries.js';

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

/**
 * Stands where a target has no brand mark, keeping the labels in one column.
 * An empty `<svg>` rather than a sized box: a menu row lays a glyph out by the
 * rules it has for `svg`, so only an `svg` gets exactly the same width.
 */
const noIcon = <svg width="1em" height="1em" />;

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

  // `includePoint` is what tells the two apart: a menu about one place marks it
  // in the addresses it builds, a menu about the visible map has none to mark.
  const countries = usePlaceCountries(lat, lon, Boolean(includePoint));

  const sk = countries.includes('sk');

  const fr = countries.includes('fr');

  const pl = countries.includes('pl');

  const at = countries.includes('at');

  const si = countries.includes('si');

  const it = countries.includes('it');

  const no = countries.includes('no');

  const se = countries.includes('se');

  const fi = countries.includes('fi');

  const nl = countries.includes('nl');

  const be = countries.includes('be');

  const es = countries.includes('es');

  const hr = countries.includes('hr');

  const pt = countries.includes('pt');

  const cz = countries.includes('cz');

  // hiking.sk maps Czechia too.
  const skcz = sk || cz;

  return (
    <>
      {url && (
        <Dropdown.Item href={url} target="_blank" eventKey="url">
          <FaWindowMaximize /> {oeam?.window}
        </Dropdown.Item>
      )}

      {children}

      {(url || children) && <Dropdown.Divider />}

      {/* The map data itself, and the tools that work on it. */}
      <OnlineOnlyItem
        href={getOsmUrl(lat, lon, zoom, includePoint)}
        target="_blank"
        eventKey="url"
      >
        <SiOpenstreetmap /> {oeam?.osm}
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
            {noIcon} {oeam?.josm}
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
            {noIcon} {oeam?.id}
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
        href={getOsmoseUrl(lat, lon, zoom)}
        target="_blank"
        eventKey="url"
      >
        {noIcon} Osmose
      </OnlineOnlyItem>

      <Dropdown.Divider />

      {/* General-purpose maps. */}
      <OnlineOnlyItem
        href={getMapyCzUrl(lat, lon, zoom, includePoint)}
        target="_blank"
        eventKey="url"
      >
        {noIcon} {oeam?.mapy_cz}
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
        <SiGooglemaps /> {oeam?.googleMaps}
        {showKbdShortcut && (
          <>
            {' '}
            <Chord external="google" />
          </>
        )}
      </OnlineOnlyItem>

      <OnlineOnlyItem
        href={getAppleMapsUrl(lat, lon, zoom, includePoint)}
        target="_blank"
        eventKey="url"
      >
        <SiApple /> {oeam?.appleMaps}
        {showKbdShortcut && (
          <>
            {' '}
            <Chord external="apple" />
          </>
        )}
      </OnlineOnlyItem>

      <OnlineOnlyItem
        href={getWazeUrl(lat, lon, zoom)}
        target="_blank"
        eventKey="url"
      >
        <SiWaze /> Waze
      </OnlineOnlyItem>

      <Dropdown.Divider />

      {/* Seeing the place rather than a map of it. */}
      <OnlineOnlyItem
        href={getStreetViewUrl(lat, lon)}
        target="_blank"
        eventKey="url"
      >
        <SiGooglestreetview /> Google Street View
        {showKbdShortcut && (
          <>
            {' '}
            <Chord external="streetview" />
          </>
        )}
      </OnlineOnlyItem>

      <OnlineOnlyItem
        href={getMapillaryUrl(lat, lon, zoom)}
        target="_blank"
        eventKey="url"
      >
        <SiMapillary /> Mapillary
        {showKbdShortcut && (
          <>
            {' '}
            <Chord external="mapillary" />
          </>
        )}
      </OnlineOnlyItem>

      <OnlineOnlyItem
        href={getPanoramaxUrl(lat, lon, zoom)}
        target="_blank"
        eventKey="url"
      >
        {noIcon} Panoramax
        {showKbdShortcut && (
          <>
            {' '}
            <Chord external="panoramax" />
          </>
        )}
      </OnlineOnlyItem>

      <OnlineOnlyItem
        href={getF4mapUrl(lat, lon, zoom)}
        target="_blank"
        eventKey="url"
      >
        {noIcon} F4Map
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
        {noIcon} Peakfinder
        {showKbdShortcut && (
          <>
            {' '}
            <Chord external="peakfinder" />
          </>
        )}
      </OnlineOnlyItem>

      <Dropdown.Divider />

      {/* Being out there. */}
      <OnlineOnlyItem
        href={getStravaUrl(lat, lon, zoom)}
        target="_blank"
        eventKey="url"
      >
        <SiStrava /> Strava
      </OnlineOnlyItem>

      <OnlineOnlyItem
        href={getGeocachingUrl(lat, lon, zoom)}
        target="_blank"
        eventKey="url"
      >
        <SiGeocaching /> Geocaching
      </OnlineOnlyItem>

      <OnlineOnlyItem
        href={getWindyUrl(lat, lon, zoom)}
        target="_blank"
        eventKey="url"
      >
        <TbBrandWindy /> Windy
        {showKbdShortcut && (
          <>
            {' '}
            <Chord external="windy" />
          </>
        )}
      </OnlineOnlyItem>

      {/* Targets with data in some countries only, offered where the place is in one. */}
      {(skcz ||
        at ||
        pl ||
        si ||
        it ||
        hr ||
        fr ||
        es ||
        pt ||
        no ||
        se ||
        fi ||
        nl ||
        be) && <Dropdown.Divider />}

      {sk && (
        <OnlineOnlyItem
          href={getOmaUrl(lat, lon, zoom)}
          target="_blank"
          eventKey="url"
        >
          {noIcon} {oeam?.oma} <CountryFlag country="sk" />
        </OnlineOnlyItem>
      )}

      {skcz && (
        <OnlineOnlyItem
          href={getHikingSkUrl(lat, lon, zoom, includePoint)}
          target="_blank"
          eventKey="url"
        >
          {noIcon} {oeam?.hiking_sk} <CountryFlag country="sk" />{' '}
          <CountryFlag country="cz" />
          {showKbdShortcut && (
            <>
              {' '}
              <Chord external="hiking.sk" />
            </>
          )}
        </OnlineOnlyItem>
      )}

      {sk && (
        <OnlineOnlyItem
          href={getZbgisUrl(lat, lon, zoom)}
          target="_blank"
          eventKey="url"
        >
          {noIcon} {oeam?.zbgis} <CountryFlag country="sk" />
          {showKbdShortcut && (
            <>
              {' '}
              <Chord external="zbgis" />
            </>
          )}
        </OnlineOnlyItem>
      )}

      {cz && (
        <OnlineOnlyItem
          href={getCuzkUrl(lat, lon, zoom)}
          target="_blank"
          eventKey="url"
        >
          {noIcon} ČÚZK <CountryFlag country="cz" />
        </OnlineOnlyItem>
      )}

      {at && (
        <OnlineOnlyItem
          href={getBasemapAtUrl(lat, lon, zoom)}
          target="_blank"
          eventKey="url"
        >
          {noIcon} basemap.at <CountryFlag country="at" />
        </OnlineOnlyItem>
      )}

      {pl && (
        <OnlineOnlyItem
          href={getGeoportalPlUrl(lat, lon, zoom)}
          target="_blank"
          eventKey="url"
        >
          {noIcon} Geoportal <CountryFlag country="pl" />
        </OnlineOnlyItem>
      )}

      {si && (
        <OnlineOnlyItem
          href={getAtlasOkoljaUrl(lat, lon, zoom)}
          target="_blank"
          eventKey="url"
        >
          {noIcon} Atlas okolja <CountryFlag country="si" />
        </OnlineOnlyItem>
      )}

      {it && (
        <OnlineOnlyItem
          href={getPcnUrl(lat, lon, zoom)}
          target="_blank"
          eventKey="url"
        >
          {noIcon} Geoportale Nazionale <CountryFlag country="it" />
        </OnlineOnlyItem>
      )}

      {fr && (
        <OnlineOnlyItem
          href={getGeoportailUrl(lat, lon, zoom)}
          target="_blank"
          eventKey="url"
        >
          {noIcon} Géoportail <CountryFlag country="fr" />
        </OnlineOnlyItem>
      )}

      {hr && (
        <OnlineOnlyItem
          href={getArkodUrl(lat, lon, zoom)}
          target="_blank"
          eventKey="url"
        >
          {noIcon} ARKOD <CountryFlag country="hr" />
        </OnlineOnlyItem>
      )}

      {es && (
        <OnlineOnlyItem
          href={getIberpixUrl(lat, lon, zoom)}
          target="_blank"
          eventKey="url"
        >
          {noIcon} Iberpix <CountryFlag country="es" />
        </OnlineOnlyItem>
      )}

      {pt && (
        <OnlineOnlyItem
          href={getMapasPtUrl(lat, lon, zoom)}
          target="_blank"
          eventKey="url"
        >
          {noIcon} MapasPT <CountryFlag country="pt" />
        </OnlineOnlyItem>
      )}

      {be && (
        <OnlineOnlyItem
          href={getTopomapviewerUrl(lat, lon, zoom)}
          target="_blank"
          eventKey="url"
        >
          {noIcon} Topomapviewer <CountryFlag country="be" />
        </OnlineOnlyItem>
      )}

      {nl && (
        <OnlineOnlyItem
          href={getPdokUrl(lat, lon, zoom)}
          target="_blank"
          eventKey="url"
        >
          {noIcon} PDOK <CountryFlag country="nl" />
        </OnlineOnlyItem>
      )}

      {no && (
        <OnlineOnlyItem
          href={getNorgeskartUrl(lat, lon, zoom)}
          target="_blank"
          eventKey="url"
        >
          {noIcon} Norgeskart <CountryFlag country="no" />
        </OnlineOnlyItem>
      )}

      {se && (
        <OnlineOnlyItem
          href={getMinKartaUrl(lat, lon, zoom)}
          target="_blank"
          eventKey="url"
        >
          {noIcon} Min karta <CountryFlag country="se" />
        </OnlineOnlyItem>
      )}

      {fi && (
        <OnlineOnlyItem
          href={getKarttapaikkaUrl(lat, lon, zoom)}
          target="_blank"
          eventKey="url"
        >
          {noIcon} Karttapaikka <CountryFlag country="fi" />
        </OnlineOnlyItem>
      )}
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
