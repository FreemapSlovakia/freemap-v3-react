let auth2: gapi.auth2.GoogleAuth;
let r: (arr: gapi.auth2.GoogleAuth) => void;

const p = new Promise<gapi.auth2.GoogleAuth>(resolve => {
  r = resolve;
});

export function getAuth2() {
  return auth2 ? Promise.resolve(auth2) : p;
}

window['handleGoogleAuthApiLoad'] = () => {
  gapi.load('auth2', () => {
    auth2 = gapi.auth2.init({
      client_id:
        '120698260366-tt592mqhut3931ct83667sfihdkv69jj.apps.googleusercontent.com',
      scope: 'profile email',
    });

    window.setTimeout(() => {
      r(auth2);
    }, 100);
  });
};
