import {
  clearMapFeatures,
  closeTool,
  openTool,
  setActiveModal,
  ToolSchema,
} from '@app/store/actions.js';
import { modalOf, UrlModalIdSchema } from '@app/store/activeModal.js';
import { openToolsSelector } from '@app/store/selectors.js';
import z from 'zod';
import { defineTool } from '../tool.js';

export const appTools = [
  defineTool({
    name: 'get-app-state',
    description:
      'Returns what the app is doing right now: the open tools and dialog, the selected feature, the UI language and who is signed in.',
    input: z.object({}),
    execute(_args, { store }) {
      const state = store.getState();

      return {
        openTools: openToolsSelector(state),
        openDialog: state.main.activeModal?.type ?? null,
        selection: state.main.selection?.type ?? null,
        language: state.l10n.language,
        user: state.auth.user?.name ?? null,
        online: window.navigator.onLine,
      };
    },
  }),

  defineTool({
    name: 'open-tool',
    description:
      "Opens one of the app's tools — its toolbar, and whatever it takes over map clicks for.",
    input: z.object({ tool: ToolSchema }),
    execute({ tool }, { store }) {
      store.dispatch(openTool(tool));

      return { openTools: openToolsSelector(store.getState()) };
    },
  }),

  defineTool({
    name: 'close-tool',
    description: 'Closes one open tool.',
    input: z.object({ tool: ToolSchema }),
    execute({ tool }, { store }) {
      store.dispatch(closeTool(tool));

      return { openTools: openToolsSelector(store.getState()) };
    },
  }),

  defineTool({
    name: 'open-dialog',
    description:
      "Opens one of the app's dialogs, for the user to carry on in themselves — signing in, exporting, buying credits, configuring the map. Call get-app-guide for what each one does.",
    input: z.object({ dialog: UrlModalIdSchema }),
    execute({ dialog }, { store }) {
      store.dispatch(setActiveModal(modalOf(dialog)));
    },
  }),

  defineTool({
    name: 'clear-map',
    description:
      'Takes everything the user put on the map off it — searched places, the planned route, drawings, imported tracks.',
    input: z.object({}),
    execute(_args, { store }) {
      store.dispatch(clearMapFeatures());
    },
  }),
];
