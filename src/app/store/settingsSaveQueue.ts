let queue: Promise<unknown> = Promise.resolve();

/**
 * Runs account-settings saves one after another. The API replaces settings
 * whole, so two in flight could land in the wrong order and the older win.
 */
export function queueSettingsSave<T>(task: () => Promise<T>): Promise<T> {
  const run = queue.then(task);

  queue = run.catch(() => undefined);

  return run;
}
