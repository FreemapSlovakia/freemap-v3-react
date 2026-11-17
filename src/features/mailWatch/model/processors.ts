import { httpRequest } from '@app/httpRequest.js';
import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import type { RootState } from '@app/store/store.js';
import z from 'zod';
import {
  mailWatchKey,
  mailWatchLoad,
  mailWatchSet,
  mailWatchToggle,
  mailWatchToggleDone,
} from './actions.js';

const StateSchema = z.object({ watching: z.boolean() });

// Requests are numbered in the order they are sent; per target, an answer is
// taken only if it was sent after the one last taken, so a late older answer
// never overwrites a newer one, and a newer one failing leaves an older one.
let lastSeq = 0;

const applied = new Map<string, number>();

/** Whether the answer to `seq` is newer than what the target shows; takes it if so. */
const take = (key: string, seq: number) => {
  if (seq <= (applied.get(key) ?? 0)) {
    return false;
  }

  applied.set(key, seq);

  return true;
};

// The answer is the asking user's: another may have logged in meanwhile.
const sameUser = (getState: () => RootState, userId: number) =>
  getState().auth.user?.id === userId;

export const mailWatchLoadProcessor: Processor<typeof mailWatchLoad> = {
  actionCreator: mailWatchLoad,
  async handle({ getState, dispatch, action }) {
    const userId = getState().auth.user?.id;

    if (userId === undefined) {
      return;
    }

    const key = mailWatchKey(action.payload);

    // A toggle on its way settles it: a load answered before the toggle lands
    // on the server would show the state from before it.
    if (getState().mailWatch.byKey[key]?.busy) {
      return;
    }

    const seq = ++lastSeq;

    // Without a toast: the bell just stays as it was.
    try {
      const res = await httpRequest({
        getState,
        url: `/mail-watch/${key}`,
        expectedStatus: 200,
        cancelActions: [],
      });

      const { watching } = StateSchema.parse(await res.json());

      if (sameUser(getState, userId) && take(key, seq)) {
        dispatch(mailWatchSet({ key, userId, watching }));
      }
    } catch (err) {
      console.warn('Mail watch state not loaded', err);
    }
  },
};

export const mailWatchToggleProcessor: Processor<typeof mailWatchToggle> = {
  actionCreator: mailWatchToggle,
  errorKey: 'general.operationError',
  async handle({ getState, dispatch, action }) {
    const { watching, ...ref } = action.payload;

    const userId = getState().auth.user?.id;

    const key = mailWatchKey(ref);

    const seq = ++lastSeq;

    // After the toggle is done, as a load while it is on its way is skipped.
    let reload = false;

    try {
      if (userId === undefined) {
        return;
      }

      const res = await httpRequest({
        getState,
        method: 'PUT',
        url: `/mail-watch/${key}`,
        data: { watching },
        expectedStatus: 200,
        cancelActions: [],
      });

      const parsed = StateSchema.parse(await res.json());

      if (!sameUser(getState, userId)) {
        return;
      }

      if (take(key, seq)) {
        dispatch(mailWatchSet({ key, userId, watching: parsed.watching }));
      } else {
        reload = true;
      }
    } catch (err) {
      // What the server has now is unknown: ask it.
      reload = true;

      throw err;
    } finally {
      dispatch(mailWatchToggleDone(key));

      if (reload) {
        dispatch(mailWatchLoad(ref));
      }
    }
  },
};
