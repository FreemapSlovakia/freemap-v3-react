import type { IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { resolveGenericName } from '@osm/osmNameResolver.js';
import { osmTagToIconMapping } from '@osm/osmTagToIconMapping.js';
import type { Node } from '@osm/types.js';
import type { IconSvg } from '@shared/components/RichMarker.js';
import { useEffect, useMemo, useState } from 'react';

// The `icon` field on a drawing point is one of these forms.
export type IconSpec =
  | { kind: 'fa'; name: string }
  | { kind: 'poi'; name: string }
  | { kind: 'text'; text: string };

export function parseIconSpec(icon: string | undefined): IconSpec | undefined {
  if (!icon) {
    return undefined;
  }

  if (icon.startsWith('fa:')) {
    return { kind: 'fa', name: icon.slice(3) };
  }

  if (icon.startsWith('poi:')) {
    return { kind: 'poi', name: icon.slice(4) };
  }

  // Anything else is literal text; only the first 2 chars fit in the marker.
  return { kind: 'text', text: [...icon].slice(0, 2).join('') };
}

export const faSpec = (name: string) => `fa:${name}`;

export const poiSpec = (name: string) => `poi:${name}`;

// `iconName` -> definition cache, filled the first time the solid set loads.
const iconCache = new Map<string, IconDefinition>();

let allIconsPromise: Promise<IconDefinition[]> | undefined;

// Curated subset of the FA solid set that's actually useful as a map marker:
// places/amenities, transport, nature, activities, hazards, common symbols,
// religious symbols, food/drink, animals. Everything else (arrows, chevrons,
// UI controls, text formatting, file/code icons, charts, emoji faces, single
// letters/digits, most currency/zodiac/gesture icons) is dropped so the picker
// stays scannable. Names that aren't in this set still resolve via the cache,
// so previously-stored markers keep rendering even if they're not pickable.
const pickerAllowlist: ReadonlySet<string> = new Set([
  // places & buildings
  'house',
  'house-chimney',
  'house-user',
  'house-medical',
  'house-flag',
  'building',
  'building-columns',
  'building-flag',
  'building-shield',
  'building-ngo',
  'building-un',
  'building-wheat',
  'building-user',
  'hospital',
  'hospital-user',
  'school',
  'school-flag',
  'church',
  'mosque',
  'synagogue',
  'vihara',
  'kaaba',
  'gopuram',
  'torii-gate',
  'place-of-worship',
  'monument',
  'landmark',
  'landmark-dome',
  'landmark-flag',
  'city',
  'hotel',
  'shop',
  'store',
  'warehouse',
  'industry',
  'igloo',
  'dungeon',
  'tent',
  'tents',
  'campground',
  'archway',
  'bridge',
  'bridge-water',
  'road',
  'road-bridge',
  'road-barrier',
  'road-spikes',
  'tower-broadcast',
  'tower-cell',
  'tower-observation',
  'gas-pump',
  'charging-station',
  'square-parking',
  'restroom',
  'elevator',
  'stairs',
  'door-open',
  'door-closed',
  'traffic-light',
  'signs-post',
  'sign-hanging',
  'bore-hole',
  'oil-well',
  'oil-can',
  'solar-panel',
  'satellite-dish',
  'satellite',
  'vault',

  // transport
  'car',
  'car-side',
  'car-rear',
  'taxi',
  'bus',
  'bus-simple',
  'train',
  'train-subway',
  'train-tram',
  'plane',
  'plane-departure',
  'plane-arrival',
  'plane-up',
  'ship',
  'sailboat',
  'ferry',
  'helicopter',
  'motorcycle',
  'bicycle',
  'truck',
  'truck-pickup',
  'truck-front',
  'truck-fast',
  'truck-medical',
  'truck-moving',
  'truck-field',
  'tractor',
  'cable-car',
  'caravan',
  'van-shuttle',
  'anchor',
  'rocket',
  'jet-fighter',
  'trailer',

  // people & activities
  'person',
  'person-hiking',
  'person-walking',
  'person-walking-luggage',
  'person-walking-with-cane',
  'person-running',
  'person-biking',
  'person-skating',
  'person-skiing',
  'person-skiing-nordic',
  'person-snowboarding',
  'person-swimming',
  'person-praying',
  'person-falling',
  'person-drowning',
  'person-shelter',
  'person-pregnant',
  'person-cane',
  'person-digging',
  'hot-tub-person',
  'baby',
  'baby-carriage',
  'child',
  'children',
  'user',
  'users',
  'user-group',
  'user-doctor',
  'user-nurse',
  'user-injured',
  'wheelchair',
  'wheelchair-move',
  'shoe-prints',

  // nature & weather
  'tree',
  'tree-city',
  'mountain',
  'mountain-sun',
  'mountain-city',
  'leaf',
  'seedling',
  'clover',
  'fire',
  'water',
  'droplet',
  'cloud',
  'sun',
  'moon',
  'cloud-rain',
  'cloud-bolt',
  'cloud-showers-heavy',
  'cloud-showers-water',
  'cloud-moon',
  'cloud-sun',
  'cloud-moon-rain',
  'cloud-sun-rain',
  'snowflake',
  'snowman',
  'tornado',
  'hurricane',
  'volcano',
  'rainbow',
  'wind',
  'meteor',
  'hill-avalanche',
  'hill-rockslide',
  'smog',
  'icicles',
  'spa',
  'umbrella-beach',
  'umbrella',
  'bolt',
  'bolt-lightning',
  'fire-flame-simple',
  'fire-flame-curved',
  'sun-plant-wilt',
  'plant-wilt',
  'mound',
  'wheat-awn',
  'temperature-high',
  'temperature-low',
  'thermometer',

  // animals
  'dog',
  'cat',
  'cow',
  'horse',
  'horse-head',
  'fish',
  'fish-fins',
  'frog',
  'dove',
  'crow',
  'otter',
  'hippo',
  'kiwi-bird',
  'paw',
  'worm',
  'shrimp',
  'spider',
  'mosquito',
  'bugs',
  'bug',
  'locust',
  'dragon',

  // food & drink
  'utensils',
  'mug-hot',
  'mug-saucer',
  'beer-mug-empty',
  'wine-glass',
  'wine-bottle',
  'wine-glass-empty',
  'martini-glass',
  'martini-glass-citrus',
  'martini-glass-empty',
  'whiskey-glass',
  'champagne-glasses',
  'pizza-slice',
  'burger',
  'hotdog',
  'bowl-food',
  'bowl-rice',
  'bread-slice',
  'cheese',
  'ice-cream',
  'candy-cane',
  'carrot',
  'apple-whole',
  'lemon',
  'pepper-hot',
  'drumstick-bite',
  'egg',
  'bacon',
  'cookie',
  'bottle-water',
  'bottle-droplet',
  'jar',
  'jar-wheat',
  'plate-wheat',
  'glass-water',

  // hazards & warnings
  'triangle-exclamation',
  'ban',
  'biohazard',
  'radiation',
  'skull',
  'skull-crossbones',
  'explosion',
  'bomb',
  'land-mine-on',
  'virus',
  'viruses',
  'bacteria',
  'bacterium',
  'mosquito-net',
  'mask-face',
  'circle-radiation',
  'gun',

  // healthcare
  'kit-medical',
  'briefcase-medical',
  'suitcase-medical',
  'syringe',
  'pills',
  'capsules',
  'pump-medical',
  'stethoscope',
  'heart-pulse',
  'bed-pulse',
  'bed',
  'prescription',
  'prescription-bottle',
  'prescription-bottle-medical',
  'x-ray',
  'tooth',
  'lungs',
  'brain',
  'dna',
  'vial',
  'vials',
  'flask',
  'flask-vial',
  'microscope',
  'hand-holding-medical',
  'staff-snake',

  // tools
  'hammer',
  'wrench',
  'screwdriver',
  'screwdriver-wrench',
  'toolbox',
  'gear',
  'gears',
  'pen',
  'pencil',
  'paintbrush',
  'brush',
  'scissors',
  'ruler',
  'helmet-safety',
  'vest',
  'vest-patches',
  'broom',

  // symbols & markers
  'flag',
  'flag-checkered',
  'flag-usa',
  'star',
  'star-half',
  'heart',
  'key',
  'lock',
  'lock-open',
  'exclamation',
  'info',
  'question',
  'location-dot',
  'location-pin',
  'map-pin',
  'map',
  'map-location',
  'map-location-dot',
  'thumbtack',
  'bookmark',
  'gem',
  'crown',
  'certificate',
  'award',
  'medal',
  'trophy',
  'ribbon',
  'gift',
  'crosshairs',
  'bullseye',
  'location-arrow',
  'compass',
  'route',
  'diamond-turn-right',

  // communication
  'phone',
  'wifi',
  'signal',
  'envelope',
  'comment',
  'comments',
  'walkie-talkie',

  // money & commerce
  'money-bill',
  'dollar-sign',
  'euro-sign',
  'sterling-sign',
  'yen-sign',
  'credit-card',
  'cart-shopping',
  'bag-shopping',
  'basket-shopping',
  'piggy-bank',
  'sack-dollar',
  'coins',
  'cash-register',

  // religious
  'cross',
  'star-of-david',
  'om',
  'dharmachakra',
  'ankh',
  'peace',
  'yin-yang',
  'khanda',
  'hamsa',
  'hanukiah',
  'menorah',
  'bahai',
  'star-and-crescent',
  'scroll-torah',
  'book-bible',
  'book-quran',
  'book-tanakh',
  'hands-praying',

  // music & entertainment
  'music',
  'headphones',
  'microphone',
  'guitar',
  'drum',
  'drum-steelpan',
  'masks-theater',
  'film',
  'ticket',
  'ticket-simple',
  'camera',
  'camera-retro',
  'video',
  'gamepad',
  'chess',
  'dice',
  'puzzle-piece',

  // sports
  'futbol',
  'football',
  'baseball',
  'baseball-bat-ball',
  'basketball',
  'volleyball',
  'golf-ball-tee',
  'bowling-ball',
  'hockey-puck',
  'table-tennis-paddle-ball',
  'dumbbell',
  'water-ladder',

  // industrial / waste
  'jug-detergent',
  'boxes-stacked',
  'pallet',
  'dolly',
  'dumpster',
  'dumpster-fire',
  'recycle',
  'trash',
  'trash-can',
  'faucet',
  'faucet-drip',
  'fire-extinguisher',
  'fire-burner',

  // hygiene & furniture
  'bath',
  'shower',
  'toilet',
  'toilet-paper',
  'toilet-portable',
  'soap',
  'sink',
  'pump-soap',
  'couch',
  'chair',
  'mattress-pillow',

  // misc useful
  'eye',
  'lightbulb',
  'plug',
  'battery-full',
  'microchip',
  'fingerprint',
  'qrcode',
  'barcode',
  'magnifying-glass',
  'magnifying-glass-location',
  'book',
  'book-open',
  'book-atlas',
  'graduation-cap',
  'bell',
  'calendar',
  'image',
  'images',
  'briefcase',
  'suitcase',
  'suitcase-rolling',
  'scale-balanced',
  'gavel',
  'hat-cowboy',
  'hat-wizard',
  'glasses',
  'binoculars',
  'palette',
  'layer-group',
  'life-ring',
  'shield',
  'shield-halved',
  'shield-heart',
  'fan',
  'feather',
  'crutch',
]);

/**
 * Lazily loads the entire Font Awesome solid set as a single on-demand chunk.
 * Caches every name (so any previously-stored `fa:<name>` can still resolve via
 * `useFaIcon`) but returns only the curated picker subset, sorted by name.
 */
export function loadAllIcons(): Promise<IconDefinition[]> {
  allIconsPromise ??= import('@fortawesome/free-solid-svg-icons').then(
    ({ fas }) => {
      const byName = new Map<string, IconDefinition>();

      for (const def of Object.values(fas)) {
        byName.set(def.iconName, def);

        iconCache.set(def.iconName, def);
      }

      return [...byName.values()]
        .filter((def) => pickerAllowlist.has(def.iconName))
        .sort((a, b) => a.iconName.localeCompare(b.iconName));
    },
  );

  return allIconsPromise;
}

/**
 * Resolves a Font Awesome solid icon by `iconName`. Returns a cached definition
 * synchronously when available, otherwise triggers the lazy load and resolves
 * on the next render. Returns `undefined` until ready / if the name is unknown.
 */
export function useFaIcon(
  name: string | undefined,
): IconDefinition | undefined {
  const [, force] = useState(0);

  const cached = name ? iconCache.get(name) : undefined;

  useEffect(() => {
    if (name && !cached) {
      let cancelled = false;

      loadAllIcons().then(() => {
        if (!cancelled) {
          force((n) => n + 1);
        }
      });

      return () => {
        cancelled = true;
      };
    }
  }, [name, cached]);

  return cached;
}

// Bundled OSM poi icons, mapped name <-> built asset URL. The URLs are taken
// straight from `osmTagToIconMapping` (the same strings used to display the OSM
// objects), so converting an object to a drawing point can round-trip its icon
// as `poi:<name>` without a second enumeration mechanism that could drift.
export const poiIconNameToUrl: Record<string, string> = {};

export const poiIconUrlToName: Record<string, string> = {};

// Derives the stable icon name from an asset URL by taking the filename stem
// (poi filenames have no dots in them, only an extension and optional hash).
function urlToPoiName(url: string): string {
  const file = url.split(/[?#]/)[0].split('/').pop() ?? url;

  return file.split('.')[0];
}

(function collectPoiIcons(node: Node) {
  for (const value of Object.values(node)) {
    if (typeof value === 'string') {
      const name = urlToPoiName(value);

      poiIconNameToUrl[name] = value;

      poiIconUrlToName[value] = name;
    } else {
      collectPoiIcons(value);
    }
  }
})(osmTagToIconMapping);

/**
 * Resolves the bundled poi icon for a feature's OSM tags as a `poi:<name>`
 * spec, or undefined if the tags map to no icon.
 */
export function tagsToPoiIconSpec(
  tags: Record<string, string>,
): string | undefined {
  const url = resolveGenericName(osmTagToIconMapping, tags)[0];

  const name = url ? poiIconUrlToName[url] : undefined;

  return name ? poiSpec(name) : undefined;
}

// Flattens a Font Awesome `IconDefinition`'s `icon` tuple into a renderable
// `{ width, height, path }`.
export function faIconToSvg(def: IconDefinition): IconSvg {
  const [width, height, , , path] = def.icon;

  return { width, height, path: Array.isArray(path) ? path.join(' ') : path };
}

/**
 * Resolves an icon-spec string (`fa:*`, `poi:*`, short literal text) into the
 * `RichMarker` content prop it maps to. Returns `{}` when the spec is missing
 * or a `fa:*` icon hasn't lazy-loaded yet; callers decide how to fall back.
 *
 * The return type is a discriminated union (exactly one of `image`/`iconSvg`/
 * `label` is set, or none) so callers can `{...spread}` it into RichMarker
 * without TS widening the props into a forbidden intersection.
 */
export function useIconContentProps(icon: string | undefined) {
  const spec = parseIconSpec(icon);

  const faDef = useFaIcon(spec?.kind === 'fa' ? spec.name : undefined);

  // Memoized on the (stable, cached) definition so consumers don't rebuild
  // the marker icon on unrelated re-renders / mid-drag.
  const iconSvg = useMemo(() => faDef && faIconToSvg(faDef), [faDef]);

  return spec?.kind === 'poi'
    ? { image: poiIconNameToUrl[spec.name] }
    : spec?.kind === 'fa'
      ? iconSvg
        ? { iconSvg }
        : {}
      : spec?.kind === 'text'
        ? { label: spec.text }
        : {};
}

/**
 * Renders a Font Awesome icon definition as a standalone `<svg>` (used for the
 * picker grid and previews). For the map marker the path is embedded directly
 * into the marker SVG instead — see `RichMarker`.
 */
export function FaIconSvg({
  def,
  size = '1em',
}: {
  def: IconDefinition;
  size?: number | string;
}) {
  const { width, height, path } = faIconToSvg(def);

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${width} ${height}`}
      fill="currentColor"
      aria-hidden="true"
    >
      <path d={path} />
    </svg>
  );
}
