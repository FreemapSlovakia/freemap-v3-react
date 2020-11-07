let gapiPromise: Promise<undefined>;

export function loadGapi(): Promise<undefined> {
  if (gapiPromise) {
    return gapiPromise;
  }

  gapiPromise = new Promise((resolve, reject) => {
    const js = document.createElement('script');

    js.async = true;
    js.defer = true;
    js.src = 'https://apis.google.com/js/api.js';

    js.onload = () => {
      resolve();
    };

    js.onerror = () => {
      reject(new Error('error loading script'));
    };

    const fjs = document.getElementsByTagName('script')[0];

    if (!fjs || !fjs.parentNode) {
      reject(Error('no script'));
    } else {
      fjs.parentNode.insertBefore(js, fjs);
    }
  });

  return gapiPromise;
}

export async function getAuth2(
  cfg: {
    scope?: string;
  } = {},
): Promise<void> {
  await loadGapi();

  await new Promise((resolve) => {
    gapi.load('client:auth2', () => {
      resolve();
    });
  });

  gapi.client.init({
    apiKey: 'AIzaSyC90lMoeLp_Rbfpv-eEOoNVpOe25CNXhFc',
    clientId:
      '120698260366-tt592mqhut3931ct83667sfihdkv69jj.apps.googleusercontent.com',
    ...cfg,
  });
}
