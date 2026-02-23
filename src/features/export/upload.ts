import { Dispatch } from 'redux';
import { ExportTarget } from './model/actions.js';
import { toastsAdd } from '../toasts/model/actions.js';
import { loadGapi, startGoogleAuth } from '../../gapiLoader.js';
import { httpRequest } from '../../httpRequest.js';
import type { RootState } from '../../store.js';
import { hasProperty } from '../../typeUtils.js';

export const licenseNotice =
  'Various licenses may apply - like OpenStreetMap (https://www.openstreetmap.org/copyright). Please add missing attributions upon sharing this file.';

export async function upload(
  type: 'gpx' | 'geojson',
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
            style: 'danger',
            timeout: 5000,
          }),
        );

        return false;
      }

      const p = new Promise<string | void>((resolve, reject) => {
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

            resolve();
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
            path: `/freemap-export-${new Date().toISOString()}.${type}`,
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
          messageKey: 'exportMapFeatures.exportedToDropbox',
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
                name: `freemap-export-${new Date().toISOString()}.${type}`,
                mimeType:
                  type === 'gpx'
                    ? 'application/gpx+xml'
                    : 'application/geo+json',
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
          messageKey: 'exportMapFeatures.exportedToGdrive',
        }),
      );

      break;

    case 'download':
      try {
        await saveFile(data, type);
      } catch (e) {
        if (e instanceof DOMException && e.name === 'AbortError') {
          return false;
        }

        throw e;
      }

      break;
  }

  return true;
}

async function saveFile(blob: Blob, type: 'gpx' | 'geojson') {
  const suggestedName = `freemap-export-${new Date().toISOString()}.${type}`;

  if ('showSaveFilePicker' in window) {
    const handle = await showSaveFilePicker({
      suggestedName,
      types: [
        {
          description: blob.type || 'File',
          accept: {
            [blob.type]: type === 'gpx' ? ['.gpx'] : ['.geojson', '.json'],
          } as any,
        },
      ],
    });

    const writable = await handle.createWritable();

    await writable.write(blob);

    await writable.close();

    return;
  }

  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');

  a.href = url;

  a.download = suggestedName;

  a.click();

  URL.revokeObjectURL(url);
}
