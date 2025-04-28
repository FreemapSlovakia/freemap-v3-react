const gapiPromise: Record<string, Promise<void> | undefined> = {};

export function loadGapi(
  src = 'https://apis.google.com/js/api.js',
): Promise<void> {
  if (gapiPromise[src]) {
    return gapiPromise[src];
  }

  gapiPromise[src] = new Promise<void>((resolve, reject) => {
    const js = document.createElement('script');

    js.async = true;

    js.defer = true;

    js.src = src;

    js.onload = () => {
      resolve();
    };

    js.onerror = () => {
      reject(new Error('error loading script'));
    };

    const fjs = document.getElementsByTagName('script')[0];

    if (!fjs || !fjs.parentNode) {
      reject(new Error('no script'));
    } else {
      fjs.parentNode.insertBefore(js, fjs);
    }
  });

  return gapiPromise[src];
}

export async function startGoogleAuth(
  scope: string,
): Promise<google.accounts.oauth2.TokenResponse> {
  await loadGapi('https://accounts.google.com/gsi/client');

  return new Promise((resolve, reject) => {
    const tokenClient = google.accounts.oauth2.initTokenClient({
      client_id:
        '120698260366-tt592mqhut3931ct83667sfihdkv69jj.apps.googleusercontent.com',
      scope,
      error_callback(e) {
        reject(e);
      },
      callback(tokenResponse) {
        resolve(tokenResponse);
      },
    });

    tokenClient.requestAccessToken();
  });
}
