import { httpRequest } from '@app/httpRequest.js';
import type { RootState } from '@app/store/store.js';
import { toastsAdd } from '@features/toasts/model/actions.js';
import { loadGapi, startGoogleAuth } from '@shared/gapiLoader.js';
import { isAbortError } from '@shared/isAbortError.js';
import { saveBlob } from '@shared/saveBlob.js';
import { hasProperty } from '@shared/types/typeUtils.js';
import { shareViaSheet } from '@shared/webShare.js';
import type { Dispatch } from 'redux';
import { loadMapFeaturesExportMessages } from '../../translations/loadMapFeaturesExportMessages.js';
import type { ExportTarget } from '../actions.js';
import {
  type ExportFileType,
  exportFileName,
  FILE_META,
  shareFileMeta,
} from '../fileTypes.js';

export const licenseNotice =
  'Various licenses may apply - like OpenStreetMap (https://www.openstreetmap.org/copyright). Please add missing attributions upon sharing this file.';

// Builds the export Blob with the right MIME, with one wrinkle centralized:
// Dropbox rejects some typed MIMEs (e.g. `application/gpx+xml`), so that target
// gets a neutral `application/octet-stream`; every other target gets `mime`.
export function exportBlob(
  parts: BlobPart[],
  mime: string,
  target: ExportTarget,
): Blob {
  return new Blob(parts, {
    type: target === 'dropbox' ? 'application/octet-stream' : mime,
  });
}

export async function upload(
  type: ExportFileType,
  data: Blob,
  target: ExportTarget,
  getState: () => RootState,
  dispatch: Dispatch,
): Promise<boolean> {
  switch (target) {
    case 'dropbox': {
      const redirUri = encodeURIComponent(
        `${location.protocol}//${location.host}/dropboxAuthCallback.html`,
      );

      const w = window.open(
        `https://www.dropbox.com/oauth2/authorize?client_id=vnycfeumo6jzg5p&response_type=token&redirect_uri=${redirUri}`,
        'freemap-dropbox',
        'height=400,width=600',
      );

      if (!w) {
        dispatch(
          toastsAdd({
            id: 'enablePopup',
            messageKey: 'general.enablePopup',
            style: 'warning',
            timeout: 5000,
          }),
        );

        return false;
      }

      const p = new Promise<string | undefined>((resolve, reject) => {
        const msgListener = (e: MessageEvent) => {
          if (
            e.origin === window.location.origin &&
            typeof e.data === 'object' &&
            typeof e.data?.freemap === 'object' &&
            e.data.freemap.action === 'dropboxAuth'
          ) {
            const sp = new URLSearchParams(e.data.freemap.payload.slice(1));

            const accessToken = sp.get('access_token');

            const error = sp.get('error');

            if (accessToken) {
              resolve(accessToken);
            } else {
              reject(new Error(`OAuth: ${error}`));
            }

            w.close();
          }
        };

        const timer = window.setInterval(() => {
          if (w.closed) {
            window.clearInterval(timer);

            window.removeEventListener('message', msgListener);

            resolve(undefined);
          }
        }, 500);

        window.addEventListener('message', msgListener);
      });

      const authToken = await p; // TODO handle error (https://www.oauth.com/oauth2-servers/authorization/the-authorization-response/)

      if (authToken === undefined) {
        return false;
      }

      await httpRequest({
        getState,
        method: 'POST',
        url: 'https://content.dropboxapi.com/2/files/upload',
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/octet-stream',
          'Dropbox-API-Arg': JSON.stringify({
            path: `/${exportFileName(type)}`,
          }),
        },
        data,
        expectedStatus: 200,
      });

      dispatch(
        toastsAdd({
          id: 'mapFeaturesExport',
          style: 'info',
          timeout: 5000,
          messageKey: 'exportedToDropbox',
          messageLoader: loadMapFeaturesExportMessages,
        }),
      );

      break;
    }

    case 'gdrive':
      {
        await loadGapi();

        await new Promise<void>((resolve) => {
          gapi.load('picker', () => {
            resolve();
          });
        });

        let tokenResponse: google.accounts.oauth2.TokenResponse;

        try {
          tokenResponse = await startGoogleAuth(
            'https://www.googleapis.com/auth/drive.file',
          );
        } catch (err) {
          if (
            hasProperty(err, 'type') &&
            String(err['type']) === 'popup_closed'
          ) {
            return false;
          }

          throw err;
        }

        if (!tokenResponse.access_token) {
          throw new Error(tokenResponse.error_description);
        }

        const folder = await new Promise<
          google.picker.DocumentObject | undefined
        >((resolve) => {
          const pkr = google.picker;

          new pkr.PickerBuilder()
            .addView(
              new pkr.DocsView(pkr.ViewId.FOLDERS).setSelectFolderEnabled(true),
            )
            .setOAuthToken(tokenResponse.access_token)
            .setDeveloperKey('AIzaSyC90lMoeLp_Rbfpv-eEOoNVpOe25CNXhFc')
            .setCallback(pickerCallback)
            .setTitle('Select a folder')
            .build()
            .setVisible(true);

          function pickerCallback(data: google.picker.ResponseObject) {
            switch (data[pkr.Response.ACTION]) {
              case pkr.Action.PICKED:
                resolve(data[pkr.Response.DOCUMENTS]?.[0]);

                break;

              case pkr.Action.CANCEL:
                resolve(undefined);

                break;
            }
          }
        });

        if (!folder) {
          return false;
        }

        const formData = new FormData();

        formData.append(
          'metadata',
          new Blob(
            [
              JSON.stringify({
                name: exportFileName(type),
                mimeType: FILE_META[type].mime,
                parents: [folder.id],
              }),
            ],
            { type: 'application/json' },
          ),
        );

        formData.append('file', data);

        await httpRequest({
          getState,
          method: 'POST',
          url: 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id',
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
          body: formData,
          expectedStatus: 200,
        });
      }

      dispatch(
        toastsAdd({
          id: 'mapFeaturesExport',
          style: 'info',
          timeout: 5000,
          messageKey: 'exportedToGdrive',
          messageLoader: loadMapFeaturesExportMessages,
        }),
      );

      break;

    case 'download':
      try {
        await saveFile(data, type);
      } catch (e) {
        if (isAbortError(e)) {
          return false;
        }

        throw e;
      }

      break;

    case 'share': {
      const meta = shareFileMeta(type);

      // The modal offers this target only where a file can be shared; re-asking
      // here keeps a browser that shares none from throwing an opaque platform
      // error.
      if (!meta) {
        throw new Error('sharing files is not supported');
      }

      const file = new File([data], meta.name, { type: meta.mime });

      // Whether the file ends up saved rather than shared. Two ways to get
      // there: the sheet is already up for an earlier export and the browser
      // opens one at a time, or opening it spends the user activation of the
      // Export click and an export slow enough to outlive it (elevation
      // filling, a photo-heavy KMZ) finds it gone. Either way the file exists
      // and the user asked for it, so it is saved — an outcome, rather than an
      // error over a file that was built, or a silent drop of the export the
      // last click asked for while the sheet holds an earlier one.
      let saveInstead: boolean;

      try {
        saveInstead = !(await shareViaSheet({ files: [file] }));
      } catch (e) {
        // Dismissing the share sheet rejects with AbortError.
        if (isAbortError(e)) {
          return false;
        }

        if (!(e instanceof DOMException && e.name === 'NotAllowedError')) {
          throw e;
        }

        saveInstead = true;
      }

      if (saveInstead) {
        try {
          await saveFile(data, type);
        } catch (saveError) {
          if (isAbortError(saveError)) {
            return false;
          }

          throw saveError;
        }

        dispatch(
          toastsAdd({
            id: 'mapFeaturesExport',
            style: 'warning',
            timeout: 5000,
            messageKey: 'sharedAsDownload',
            messageLoader: loadMapFeaturesExportMessages,
          }),
        );
      }

      break;
    }
  }

  return true;
}

function saveFile(blob: Blob, type: ExportFileType) {
  return saveBlob(blob, exportFileName(type), {
    [blob.type]: FILE_META[type].exts,
  });
}
