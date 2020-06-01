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

    console.log('AAAAAAAAAAA35 START');

    wb.addEventListener('waiting', (event) => {
      console.log('AAAAAAAAAAA1 waiting', event);

      if (event.isUpdate || event.wasWaitingBeforeRegister) {
        showSkipWaitingPrompt();
      }
    });

    wb.addEventListener('externalwaiting', (event) => {
      console.log('AAAAAAAAAAAA1 externalwaiting', event);

      if (event.isUpdate || event.wasWaitingBeforeRegister) {
        showSkipWaitingPrompt();
      }
    });

    wb.addEventListener('installed', () => {
      console.log('AAAAAAAAAAAA1 installed');
    });

    wb.addEventListener('externalactivated', () => {
      console.log('AAAAAAAAAAAA1 externalactivated');
    });

    wb.addEventListener('externalinstalled', () => {
      console.log('AAAAAAAAAAAA1 externalinstalled');
    });

    wb.addEventListener('controlling', () => {
      console.log('AAAAAAAAAAAA1 controlling');
    });

    wb.addEventListener('activated', () => {
      console.log('AAAAAAAAAAAA1 activated');
    });

    wb.register()
      .then((reg) => {
        registration = reg;
        console.log('AAAAAAAAAAAA1 REG');
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

    console.log('AAAAAAAAAAAA1 SW {');
    messageSW(registration.waiting, { type: 'SKIP_WAITING' });
    console.log('AAAAAAAAAAAA1 SW }');
  }
  // window.location.reload();
}
