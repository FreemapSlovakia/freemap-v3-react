import { Workbox, messageSW } from 'workbox-window';
import { toastsAdd } from 'fm3/actions/toastsActions';
import { MyStore } from './storeCreator';
import { reloadApp } from 'fm3/actions/mainActions';

let registration: ServiceWorkerRegistration | undefined;
let wb: Workbox;

export function initOffline(store: MyStore) {
  function showSkipWaitingPrompt() {
    store.dispatch(
      toastsAdd({
        id: 'app.update',
        messageKey: 'general.appUpdated',
        style: 'info',
        actions: [
          { nameKey: 'general.yes', action: reloadApp() },
          { nameKey: 'general.no' },
        ],
      }),
    );
  }

  if ('serviceWorker' in navigator) {
    wb = new Workbox('/sw.js');

    wb.addEventListener('waiting', (event) => {
      if (event.isUpdate || event.wasWaitingBeforeRegister) {
        showSkipWaitingPrompt();
      }
    });

    wb.addEventListener('externalwaiting', (event) => {
      if (event.isUpdate || event.wasWaitingBeforeRegister) {
        showSkipWaitingPrompt();
      }
    });

    // wb.addEventListener('installed', () => {
    //   console.log('AAAAAAAAAAAA1 installed');
    // });

    // wb.addEventListener('externalactivated', () => {
    //   console.log('AAAAAAAAAAAA1 externalactivated');
    // });

    // wb.addEventListener('externalinstalled', () => {
    //   console.log('AAAAAAAAAAAA1 externalinstalled');
    // });

    // wb.addEventListener('controlling', () => {
    //   console.log('AAAAAAAAAAAA1 controlling');
    // });

    // wb.addEventListener('activated', () => {
    //   console.log('AAAAAAAAAAAA1 activated');
    // });

    wb.register()
      .then((reg) => {
        registration = reg;
      })
      .catch((err) => {
        console.error(err);
      });
  }
}

export function skipWaiting() {
  if (registration && registration.waiting) {
    wb.addEventListener('controlling', () => {
      window.location.reload();
    });

    messageSW(registration.waiting, { type: 'SKIP_WAITING' });
  }
  // window.location.reload();
}
