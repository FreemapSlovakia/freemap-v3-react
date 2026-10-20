import type { ExternalTarget } from '@app/store/actions.js';
import { Text } from '@features/l10n/Text.js';
import { useOpenInExternalAppMessages } from '@features/openInExternalApp/translations/useOpenInExternalAppMessages.js';
import { Chord } from '@shared/components/Chord.js';
import { CountryFlag } from '@shared/components/CountryFlag.js';
import { MenuGutter } from '@shared/components/MenuGutter.js';
import { MenuLabel } from '@shared/components/MenuLabel.js';
import { OnlineOnlyItem } from '@shared/components/OnlineOnlyItem.js';
import { trackMatomo } from '@shared/trackMatomo.js';
import type { LatLon } from '@shared/types/common.js';
import { canShareFile } from '@shared/webShare.js';
import type { ReactElement, ReactNode } from 'react';
import { Dropdown } from 'react-bootstrap';
import {
  FaAndroid,
  FaClipboard,
  FaLink,
  FaMapMarkedAlt,
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
  getFreemapAndroidUrl,
  getGeocachingUrl,
  getGeoportailUrl,
  getGeoportalPlUrl,
  getGeoUrl,
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
  /** Off where the menu carries "Share location" among its place actions instead. */
  share?: boolean;
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

const isAndroid = /Android/i.test(navigator.userAgent);

// Matomo's outlink tracking sees only http(s) links, not `intent:` or `geo:`.
const trackOpenApp = (where: string) =>
  trackMatomo(['trackEvent', 'Share', 'openExternal', where]);

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
function pageItemFlags({
  url,
  imageUrl,
  copy = true,
  share = true,
}: PageProps) {
  return {
    canCopy: !url && Boolean(window.navigator.clipboard?.writeText) && copy,
    hasShare: 'share' in window.navigator && share,
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
  const oeam = useOpenInExternalAppMessages();

  const { canCopy, hasShare, canShareImage } = pageItemFlags(props);

  return (
    <>
      {canCopy && (
        <Dropdown.Item as="button" {...openMenuItemProps('copy')}>
          <FaClipboard />
          <MenuLabel>
            <Text k="general.copyPageUrl" />
          </MenuLabel>
          {showKbdShortcut && (
            <MenuGutter>
              <Chord external="copy" />
            </MenuGutter>
          )}
        </Dropdown.Item>
      )}

      {hasShare && (
        <Dropdown.Item as="button" {...openMenuItemProps('url')}>
          <FaLink />
          <MenuLabel>
            <Text m={oeam} k="url" />
          </MenuLabel>
        </Dropdown.Item>
      )}

      {canShareImage && (
        <Dropdown.Item as="button" {...openMenuItemProps('image')}>
          <FaShareAlt />
          <MenuLabel>
            <Text m={oeam} k="image" />
          </MenuLabel>
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
          <FaWindowMaximize />
          <MenuLabel>
            <Text m={oeam} k="window" />
          </MenuLabel>
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
        <SiOpenstreetmap />
        <MenuLabel>
          <Text m={oeam} k="osm" />
        </MenuLabel>
        {showKbdShortcut && (
          <MenuGutter>
            <Chord external="osm.org" />
          </MenuGutter>
        )}
      </OnlineOnlyItem>

      {/* The editors of what the item above shows, so they stand with it. */}
      {editors && (
        <>
          <Dropdown.Item as="button" {...openMenuItemProps('josm')}>
            {noIcon}
            <MenuLabel>
              <Text m={oeam} k="josm" />
            </MenuLabel>
            {showKbdShortcut && (
              <MenuGutter>
                <Chord external="josm" />
              </MenuGutter>
            )}
          </Dropdown.Item>

          <OnlineOnlyItem
            href={getIdUrl(lat, lon, zoom)}
            target="_blank"
            eventKey="url"
          >
            {noIcon}
            <MenuLabel>
              <Text m={oeam} k="id" />
            </MenuLabel>
            {showKbdShortcut && (
              <MenuGutter>
                <Chord external="osm.org/id" />
              </MenuGutter>
            )}
          </OnlineOnlyItem>
        </>
      )}

      <OnlineOnlyItem
        href={getOsmoseUrl(lat, lon, zoom)}
        target="_blank"
        eventKey="url"
      >
        {noIcon}
        <MenuLabel>Osmose</MenuLabel>
      </OnlineOnlyItem>

      <Dropdown.Divider />

      {/* General-purpose maps. */}
      {/* Android only: elsewhere a `geo:` link reaches no map app — on desktop
          Chromium, Freemap registers itself as its handler. */}
      {isAndroid && (
        <Dropdown.Item
          href={getFreemapAndroidUrl(lat, lon, zoom, includePoint)}
          eventKey="url"
          onClick={() => trackOpenApp('freemap-android')}
        >
          <FaAndroid />
          <MenuLabel>Freemap (Android)</MenuLabel>
        </Dropdown.Item>
      )}

      <OnlineOnlyItem
        href={getMapyCzUrl(lat, lon, zoom, includePoint)}
        target="_blank"
        eventKey="url"
      >
        {noIcon}
        <MenuLabel>
          <Text m={oeam} k="mapy_cz" />
        </MenuLabel>
        {showKbdShortcut && (
          <MenuGutter>
            <Chord external="mapy.com" />
          </MenuGutter>
        )}
      </OnlineOnlyItem>

      <OnlineOnlyItem
        href={getGoogleUrl(lat, lon, zoom, includePoint)}
        target="_blank"
        eventKey="url"
      >
        <SiGooglemaps />
        <MenuLabel>
          <Text m={oeam} k="googleMaps" />
        </MenuLabel>
        {showKbdShortcut && (
          <MenuGutter>
            <Chord external="google" />
          </MenuGutter>
        )}
      </OnlineOnlyItem>

      <OnlineOnlyItem
        href={getAppleMapsUrl(lat, lon, zoom, includePoint)}
        target="_blank"
        eventKey="url"
      >
        <SiApple />
        <MenuLabel>
          <Text m={oeam} k="appleMaps" />
        </MenuLabel>
        {showKbdShortcut && (
          <MenuGutter>
            <Chord external="apple" />
          </MenuGutter>
        )}
      </OnlineOnlyItem>

      <OnlineOnlyItem
        href={getWazeUrl(lat, lon, zoom)}
        target="_blank"
        eventKey="url"
      >
        <SiWaze />
        <MenuLabel>Waze</MenuLabel>
      </OnlineOnlyItem>

      {/* Whichever map app the user picks; Android only, as above. */}
      {isAndroid && (
        <Dropdown.Item
          href={getGeoUrl(lat, lon, zoom, includePoint)}
          eventKey="url"
          onClick={() => trackOpenApp('geo-app')}
        >
          <FaMapMarkedAlt />
          <MenuLabel>
            <Text m={oeam} k="geoApp" />
          </MenuLabel>
        </Dropdown.Item>
      )}

      <Dropdown.Divider />

      {/* Seeing the place rather than a map of it. */}
      <OnlineOnlyItem
        href={getStreetViewUrl(lat, lon)}
        target="_blank"
        eventKey="url"
      >
        <SiGooglestreetview />
        <MenuLabel>Google Street View</MenuLabel>
        {showKbdShortcut && (
          <MenuGutter>
            <Chord external="streetview" />
          </MenuGutter>
        )}
      </OnlineOnlyItem>

      <OnlineOnlyItem
        href={getMapillaryUrl(lat, lon, zoom)}
        target="_blank"
        eventKey="url"
      >
        <SiMapillary />
        <MenuLabel>Mapillary</MenuLabel>
        {showKbdShortcut && (
          <MenuGutter>
            <Chord external="mapillary" />
          </MenuGutter>
        )}
      </OnlineOnlyItem>

      <OnlineOnlyItem
        href={getPanoramaxUrl(lat, lon, zoom)}
        target="_blank"
        eventKey="url"
      >
        {noIcon}
        <MenuLabel>Panoramax</MenuLabel>
        {showKbdShortcut && (
          <MenuGutter>
            <Chord external="panoramax" />
          </MenuGutter>
        )}
      </OnlineOnlyItem>

      <OnlineOnlyItem
        href={getF4mapUrl(lat, lon, zoom)}
        target="_blank"
        eventKey="url"
      >
        {noIcon}
        <MenuLabel>F4Map</MenuLabel>
        {showKbdShortcut && (
          <MenuGutter>
            <Chord external="f4map" />
          </MenuGutter>
        )}
      </OnlineOnlyItem>

      <OnlineOnlyItem
        href={getPeakfinderUrl(lat, lon)}
        target="_blank"
        eventKey="url"
      >
        {noIcon}
        <MenuLabel>Peakfinder</MenuLabel>
        {showKbdShortcut && (
          <MenuGutter>
            <Chord external="peakfinder" />
          </MenuGutter>
        )}
      </OnlineOnlyItem>

      <Dropdown.Divider />

      {/* Being out there. */}
      <OnlineOnlyItem
        href={getStravaUrl(lat, lon, zoom)}
        target="_blank"
        eventKey="url"
      >
        <SiStrava />
        <MenuLabel>Strava</MenuLabel>
      </OnlineOnlyItem>

      <OnlineOnlyItem
        href={getGeocachingUrl(lat, lon, zoom)}
        target="_blank"
        eventKey="url"
      >
        <SiGeocaching />
        <MenuLabel>Geocaching</MenuLabel>
      </OnlineOnlyItem>

      <OnlineOnlyItem
        href={getWindyUrl(lat, lon, zoom)}
        target="_blank"
        eventKey="url"
      >
        <TbBrandWindy />
        <MenuLabel>Windy</MenuLabel>
        {showKbdShortcut && (
          <MenuGutter>
            <Chord external="windy" />
          </MenuGutter>
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
          {noIcon}
          <MenuLabel>
            <Text m={oeam} k="oma" />
          </MenuLabel>
          <CountryFlag country="sk" />
        </OnlineOnlyItem>
      )}

      {skcz && (
        <OnlineOnlyItem
          href={getHikingSkUrl(lat, lon, zoom, includePoint)}
          target="_blank"
          eventKey="url"
        >
          {noIcon}
          <MenuLabel>
            <Text m={oeam} k="hiking_sk" />
          </MenuLabel>
          <CountryFlag country="sk" />
          <CountryFlag country="cz" />
          {showKbdShortcut && (
            <MenuGutter>
              <Chord external="hiking.sk" />
            </MenuGutter>
          )}
        </OnlineOnlyItem>
      )}

      {sk && (
        <OnlineOnlyItem
          href={getZbgisUrl(lat, lon, zoom)}
          target="_blank"
          eventKey="url"
        >
          {noIcon}
          <MenuLabel>
            <Text m={oeam} k="zbgis" />
          </MenuLabel>
          <CountryFlag country="sk" />
          {showKbdShortcut && (
            <MenuGutter>
              <Chord external="zbgis" />
            </MenuGutter>
          )}
        </OnlineOnlyItem>
      )}

      {cz && (
        <OnlineOnlyItem
          href={getCuzkUrl(lat, lon, zoom)}
          target="_blank"
          eventKey="url"
        >
          {noIcon}
          <MenuLabel>ČÚZK</MenuLabel>
          <CountryFlag country="cz" />
        </OnlineOnlyItem>
      )}

      {at && (
        <OnlineOnlyItem
          href={getBasemapAtUrl(lat, lon, zoom)}
          target="_blank"
          eventKey="url"
        >
          {noIcon}
          <MenuLabel>basemap.at</MenuLabel>
          <CountryFlag country="at" />
        </OnlineOnlyItem>
      )}

      {pl && (
        <OnlineOnlyItem
          href={getGeoportalPlUrl(lat, lon, zoom)}
          target="_blank"
          eventKey="url"
        >
          {noIcon}
          <MenuLabel>Geoportal</MenuLabel>
          <CountryFlag country="pl" />
        </OnlineOnlyItem>
      )}

      {si && (
        <OnlineOnlyItem
          href={getAtlasOkoljaUrl(lat, lon, zoom)}
          target="_blank"
          eventKey="url"
        >
          {noIcon}
          <MenuLabel>Atlas okolja</MenuLabel>
          <CountryFlag country="si" />
        </OnlineOnlyItem>
      )}

      {it && (
        <OnlineOnlyItem
          href={getPcnUrl(lat, lon, zoom)}
          target="_blank"
          eventKey="url"
        >
          {noIcon}
          <MenuLabel>Geoportale Nazionale</MenuLabel>
          <CountryFlag country="it" />
        </OnlineOnlyItem>
      )}

      {fr && (
        <OnlineOnlyItem
          href={getGeoportailUrl(lat, lon, zoom)}
          target="_blank"
          eventKey="url"
        >
          {noIcon}
          <MenuLabel>Géoportail</MenuLabel>
          <CountryFlag country="fr" />
        </OnlineOnlyItem>
      )}

      {hr && (
        <OnlineOnlyItem
          href={getArkodUrl(lat, lon, zoom)}
          target="_blank"
          eventKey="url"
        >
          {noIcon}
          <MenuLabel>ARKOD</MenuLabel>
          <CountryFlag country="hr" />
        </OnlineOnlyItem>
      )}

      {es && (
        <OnlineOnlyItem
          href={getIberpixUrl(lat, lon, zoom)}
          target="_blank"
          eventKey="url"
        >
          {noIcon}
          <MenuLabel>Iberpix</MenuLabel>
          <CountryFlag country="es" />
        </OnlineOnlyItem>
      )}

      {pt && (
        <OnlineOnlyItem
          href={getMapasPtUrl(lat, lon, zoom)}
          target="_blank"
          eventKey="url"
        >
          {noIcon}
          <MenuLabel>MapasPT</MenuLabel>
          <CountryFlag country="pt" />
        </OnlineOnlyItem>
      )}

      {be && (
        <OnlineOnlyItem
          href={getTopomapviewerUrl(lat, lon, zoom)}
          target="_blank"
          eventKey="url"
        >
          {noIcon}
          <MenuLabel>Topomapviewer</MenuLabel>
          <CountryFlag country="be" />
        </OnlineOnlyItem>
      )}

      {nl && (
        <OnlineOnlyItem
          href={getPdokUrl(lat, lon, zoom)}
          target="_blank"
          eventKey="url"
        >
          {noIcon}
          <MenuLabel>PDOK</MenuLabel>
          <CountryFlag country="nl" />
        </OnlineOnlyItem>
      )}

      {no && (
        <OnlineOnlyItem
          href={getNorgeskartUrl(lat, lon, zoom)}
          target="_blank"
          eventKey="url"
        >
          {noIcon}
          <MenuLabel>Norgeskart</MenuLabel>
          <CountryFlag country="no" />
        </OnlineOnlyItem>
      )}

      {se && (
        <OnlineOnlyItem
          href={getMinKartaUrl(lat, lon, zoom)}
          target="_blank"
          eventKey="url"
        >
          {noIcon}
          <MenuLabel>Min karta</MenuLabel>
          <CountryFlag country="se" />
        </OnlineOnlyItem>
      )}

      {fi && (
        <OnlineOnlyItem
          href={getKarttapaikkaUrl(lat, lon, zoom)}
          target="_blank"
          eventKey="url"
        >
          {noIcon}
          <MenuLabel>Karttapaikka</MenuLabel>
          <CountryFlag country="fi" />
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
