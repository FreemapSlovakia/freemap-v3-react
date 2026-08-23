import {
  clearMapFeatures,
  openTool,
  setActiveModal,
} from '@app/store/actions.js';
import { type ModalId, modalOf } from '@app/store/activeModal.js';
import {
  DocumentSchema,
  documentShow,
} from '@features/documents/model/actions.js';
import { getLegendLayers } from '@features/legend/legendLayers.js';
import {
  type LayerSettings,
  mapToggleLayer,
} from '@features/map/model/actions.js';
import type { UnknownAction } from '@reduxjs/toolkit';
import type { MapLayerItemDef } from '@shared/components/MapLayerItem.js';
import { formatShortcut } from '@shared/components/ShortcutRecorder.js';
import type { ReactElement, ReactNode } from 'react';
import { BiWifiOff } from 'react-icons/bi';
import {
  FaChartArea,
  FaCode,
  FaDatabase,
  FaEraser,
  FaFileExport,
  FaHeart,
  FaLayerGroup,
  FaList,
  FaPrint,
  FaRegAddressCard,
  FaRegMap,
  FaSignInAlt,
  FaSlidersH,
  FaUser,
} from 'react-icons/fa';
import { MdDashboardCustomize } from 'react-icons/md';
import { getDocuments } from '@/documents/index.js';
import type { Messages } from '../translations/messagesInterface.js';
import { type CustomLayerDef, integratedLayerDefs } from './mapDefinitions.js';
import { isToolAvailable, toolDefinitions } from './toolDefinitions.js';

/**
 * A thing the app can do, offered by the search box beside the places it finds.
 * `kind` decides which caption the row sits under.
 */
export type Command = {
  /** Names the row's synonyms in `search.commands.keywords`, and what Matomo records. */
  id: string;
  kind: 'function' | 'map';
  /** A map row is drawn by `MapLayerItem`, so it carries its marks instead of an icon. */
  layerDef?: MapLayerItemDef;
  icon?: ReactNode;
  label: string;
  /** Extra words the row is found by, on top of its label. */
  keywords?: string;
  /** What tells two rows of the same name apart: flags, the shortcut. */
  badges?: ReactNode;
  /**
   * The same place as a link, so the row can be copied or opened in a tab. A
   * map row has none: `layers=` names the whole set, so the link would take the
   * other layers off rather than add this one.
   */
  href?: string;
  action: UnknownAction;
  requiresOnline?: boolean;
  /** Overrides the live connection check — for a row a signed-out browser can still use. */
  offline?: boolean;
  experimental?: boolean;
};

export type CommandContext = {
  m: Messages;
  language: string;
  loggedIn: boolean;
  /** `unavailableToolsSelector`'s answer. */
  unavailableTools: string;
  canPreviewLayers: boolean;
  canSaveSettings: boolean;
  /** The layers that are on. */
  layers: string[];
  customLayers: CustomLayerDef[];
  layersSettings: Record<string, LayerSettings>;
  embedFeatures: string[];
};

type ModalCommand = {
  id: ModalId;
  icon: ReactElement;
  label: (m: Messages) => string;
  requiresOnline?: boolean;
  /** Answers what the modal's menu item passes to `OnlineOnlyItem`. */
  offline?: (ctx: CommandContext) => boolean;
  available?: (ctx: CommandContext) => boolean;
};

/**
 * Only modals whose label is in the global message bundle: a lazily loaded
 * per-feature bundle would have to be fetched before the row could be named.
 */
const modalCommands: ModalCommand[] = [
  {
    id: 'account',
    icon: <FaUser />,
    label: (m) => m.mainMenu.account,
    requiresOnline: true,
    available: (ctx) => ctx.loggedIn,
  },
  {
    id: 'login',
    icon: <FaSignInAlt />,
    label: (m) => m.mainMenu.logIn,
    requiresOnline: true,
    available: (ctx) => !ctx.loggedIn,
  },
  { id: 'my-maps', icon: <FaRegMap />, label: (m) => m.tools.myMaps },
  {
    id: 'map-features-export',
    icon: <FaFileExport />,
    label: (m) => m.mainMenu.mapFeaturesExport,
  },
  {
    id: 'map-to-document-export',
    icon: <FaPrint />,
    label: (m) => m.mainMenu.mapToDocumentExport,
    requiresOnline: true,
  },
  {
    id: 'offline-map-export',
    icon: <FaDatabase />,
    label: (m) => m.mainMenu.offlineMapExport,
    requiresOnline: true,
  },
  { id: 'embed', icon: <FaCode />, label: (m) => m.mainMenu.embedMap },
  {
    id: 'support-us',
    icon: <FaHeart color="red" />,
    label: (m) => m.mainMenu.supportUs,
    requiresOnline: true,
  },
  {
    id: 'legend',
    icon: <FaList />,
    label: (m) => m.mainMenu.mapLegend,
    requiresOnline: true,
    // The modal describes the layers that are on, so with none of them on it
    // would open empty.
    available: (ctx) => {
      const legendLayers = getLegendLayers(ctx.customLayers);

      return ctx.layers.some((layer) => legendLayers.has(layer));
    },
  },
  {
    id: 'about',
    icon: <FaRegAddressCard />,
    label: (m) => m.mainMenu.contacts,
  },
  // Both write the settings, which a signed-in account keeps on the server.
  {
    id: 'map-layers-config',
    icon: <FaLayerGroup />,
    label: (m) => m.mapLayers.layersConfiguration,
    offline: (ctx) => !ctx.canSaveSettings,
  },
  {
    id: 'custom-maps',
    icon: <MdDashboardCustomize />,
    label: (m) => m.mapLayers.customMaps,
    offline: (ctx) => !ctx.canSaveSettings,
  },
  {
    id: 'offline-maps',
    icon: <BiWifiOff />,
    label: (m) => m.mapLayers.offlineMaps,
  },
  {
    id: 'browse-cache',
    icon: <FaDatabase />,
    label: (m) => m.mapLayers.browseCache,
  },
  {
    id: 'map-preferences',
    icon: <FaSlidersH />,
    label: (m) => m.mapLayers.preferences,
  },
  {
    id: 'elevation-settings',
    icon: <FaChartArea />,
    label: (m) => m.elevationChart.settings,
  },
];

/**
 * Everything the search box can offer to do, unranked. An embedded map keeps
 * only the maps, and only while it lets the map be switched at all: its menus
 * are gone, so nothing else could be reached or closed again.
 */
export function getCommands(ctx: CommandContext): Command[] {
  const { m } = ctx;

  const keywords = m.search.commands.keywords;

  const commands: Command[] = [];

  const embedded = Boolean(window.fmEmbedded);

  const add = (command: Omit<Command, 'keywords'>) => {
    commands.push({ ...command, keywords: keywords[command.id] });
  };

  if (!embedded) {
    for (const td of toolDefinitions) {
      if (!isToolAvailable(ctx.unavailableTools, td.tool)) {
        continue;
      }

      add({
        id: `tool-${td.tool}`,
        kind: 'function',
        icon: td.icon,
        label: m.tools[td.msgKey],
        badges: td.kbd && (
          <>
            <kbd>g</kbd> <kbd>{td.kbd.replace(/^Key/, '').toLowerCase()}</kbd>
          </>
        ),
        href: `#tools=${td.tool}`,
        action: openTool(td.tool),
        // A tool's `requiresOnline` is about the controls that fetch, not about
        // opening it, so the row stays live offline — as its menu item does.
        experimental: td.experimental,
      });
    }

    for (const mc of modalCommands) {
      if (mc.available && !mc.available(ctx)) {
        continue;
      }

      add({
        id: `modal-${mc.id}`,
        kind: 'function',
        icon: mc.icon,
        label: mc.label(m),
        href: `#show=${mc.id}`,
        action: setActiveModal(modalOf(mc.id)),
        requiresOnline: mc.requiresOnline,
        offline: mc.offline?.(ctx),
      });
    }

    add({
      id: 'clear-map-features',
      kind: 'function',
      icon: <FaEraser />,
      label: m.main.clearMap,
      action: clearMapFeatures(),
    });

    for (const doc of getDocuments(ctx.language)) {
      const key = DocumentSchema.safeParse(doc.key);

      if (!key.success || doc.listed === false || !doc.title) {
        continue;
      }

      add({
        id: `document-${doc.key}`,
        kind: 'function',
        icon: doc.icon ?? <FaRegAddressCard />,
        label: doc.title,
        href: `#document=${doc.key}`,
        action: documentShow(key.data),
      });
    }
  }

  if (!embedded || !ctx.embedFeatures.includes('noMapSwitch')) {
    for (const def of integratedLayerDefs) {
      const label = m.mapLayers.letters[def.type];

      // `i` is the one layer that hides rather than shows what it names, so
      // switching it on here would read as the opposite of what it does.
      if (
        !label ||
        def.type === 'i' ||
        (def.layerPreview && !ctx.canPreviewLayers)
      ) {
        continue;
      }

      const shortcut =
        ctx.layersSettings[def.type]?.shortcut === undefined
          ? def.shortcut
          : ctx.layersSettings[def.type].shortcut;

      add({
        id: `layer-${def.type}`,
        kind: 'map',
        layerDef: def,
        label,
        // The key that switches the map, which `MapLayerItem` doesn't carry.
        // Several maps share a name — the three parametric shadings among them
        // — so it is a part of telling them apart.
        badges: shortcut && <kbd>{formatShortcut(shortcut)}</kbd>,
        action: mapToggleLayer({ type: def.type, enable: true }),
      });
    }

    for (const def of ctx.customLayers) {
      if (!def.name) {
        continue;
      }

      add({
        id: `layer-${def.type}`,
        kind: 'map',
        layerDef: def,
        label: def.name,
        action: mapToggleLayer({ type: def.type, enable: true }),
      });
    }
  }

  return commands;
}
