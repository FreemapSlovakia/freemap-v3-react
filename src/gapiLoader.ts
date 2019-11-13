let gapiPromise;

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
      throw new Error('no script');
    }
    fjs.parentNode.insertBefore(js, fjs);
  });

  return gapiPromise;
}

export async function getAuth2(
  cfg: Partial<gapi.auth2.ClientConfig> = {},
): Promise<[gapi.auth2.GoogleAuth]> {
  await loadGapi();

  await new Promise(resolve => {
    gapi.load('auth2', () => {
      resolve();
    });
  });

  return [
    gapi.auth2.init({
      // eslint-disable-next-line
      client_id:
        '120698260366-tt592mqhut3931ct83667sfihdkv69jj.apps.googleusercontent.com',
      scope: 'profile email',
      ...cfg,
    }),
  ];
}
