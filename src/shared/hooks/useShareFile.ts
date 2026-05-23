import { useEffect } from 'react';

interface LaunchParams {
  files?: FileSystemFileHandle[];
}

interface LaunchQueue {
  setConsumer(consumer: (params: LaunchParams) => void): void;
}

const SHARE_CACHE = 'pending-shares';

const pendingShareId =
  typeof location !== 'undefined'
    ? new URL(location.href).searchParams.get('shared')
    : null;

let pendingShareConsumed = false;

export function useShareFile(handleShare: (files: File[]) => void): void {
  useEffect(() => {
    const launchQueue = (window as unknown as { launchQueue?: LaunchQueue })
      .launchQueue;

    launchQueue?.setConsumer(async (params) => {
      if (!params.files?.length) {
        return;
      }

      const files = await Promise.all(
        params.files.map((handle) => handle.getFile()),
      );

      handleShare(files);
    });

    void consumePendingShare(handleShare);
  }, [handleShare]);
}

async function consumePendingShare(
  handleShare: (files: File[]) => void,
): Promise<void> {
  if (pendingShareConsumed) {
    return;
  }

  pendingShareConsumed = true;

  if (!('caches' in window)) {
    return;
  }

  try {
    const cache = await caches.open(SHARE_CACHE);

    const keys = await cache.keys();

    const shareId = pendingShareId;

    const prefix = shareId ? `/__share/${shareId}/` : null;

    const files: File[] = [];

    for (const req of keys) {
      const path = new URL(req.url).pathname;

      if (prefix && path.startsWith(prefix)) {
        const resp = await cache.match(req);

        if (resp) {
          const name = decodeURIComponent(
            resp.headers.get('x-file-name') ?? 'file',
          );

          const lastModified = Number(
            resp.headers.get('x-file-last-modified') ?? '0',
          );

          const blob = await resp.blob();

          files.push(
            new File([blob], name, {
              type: blob.type,
              lastModified: Number.isFinite(lastModified) ? lastModified : 0,
            }),
          );
        }
      }

      await cache.delete(req);
    }

    if (shareId) {
      history.replaceState(
        history.state,
        '',
        location.pathname + location.hash,
      );
    }

    if (files.length) {
      handleShare(files);
    }
  } catch (err) {
    console.warn('Failed to consume pending share:', err);
  }
}
