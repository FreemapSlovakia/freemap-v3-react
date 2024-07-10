import FileSaver from 'file-saver';
import { ExportTarget } from 'fm3/actions/mainActions';
import { toastsAdd } from 'fm3/actions/toastsActions';
import { getAuth2, loadGapi } from 'fm3/gapiLoader';
import { httpRequest } from 'fm3/httpRequest';
import { RootState } from 'fm3/reducers';
import { hasProperty } from 'fm3/typeUtils';
import { Dispatch } from 'redux';

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

        // await new Promise(resolve => {
        //   gapi.client.load('drive', 'v3', resolve);
        // });

        await getAuth2({
          scope: 'https://www.googleapis.com/auth/drive.file',
        });

        const auth2 = gapi.auth2.getAuthInstance();

        let result: gapi.auth2.GoogleUser;

        try {
          result = await auth2.signIn({
            scope: 'https://www.googleapis.com/auth/drive.file',
          });
        } catch (err) {
          if (
            hasProperty(err, 'error') &&
            ['popup_closed_by_user', 'access_denied'].includes(
              String(err['error']),
            )
          ) {
            return false;
          }

          throw err;
        }

        const ar = result.getAuthResponse();

        const folder = await new Promise<any>((resolve) => {
          const pkr = google.picker;

          new pkr.PickerBuilder()
            .addView(
              new pkr.DocsView(pkr.ViewId.FOLDERS).setSelectFolderEnabled(true),
            )
            .setOAuthToken(ar.access_token)
            .setDeveloperKey('AIzaSyC90lMoeLp_Rbfpv-eEOoNVpOe25CNXhFc')
            .setCallback(pickerCallback)
            .setTitle('Select a folder')
            .build()
            .setVisible(true);

          function pickerCallback(data: any) {
            switch (data[pkr.Response.ACTION]) {
              case pkr.Action.PICKED:
                resolve(data[pkr.Response.DOCUMENTS][0]);

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
          headers: { Authorization: `Bearer ${ar.access_token}` },
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
      FileSaver.saveAs(
        data,
        `freemap-export-${new Date().toISOString()}.${type}`,
      );

      break;
  }

  return true;
}
