let auth2;
let r;

const p = new Promise(resolve => {
  r = resolve;
});

export default function getAuth2() {
  return auth2 ? Promise.resolve([auth2]) : p;
}

window.handleGoogleAuthApiLoad = () => {
  window.gapi.load('auth2', () => {
    auth2 = window.gapi.auth2.init({
      client_id:
        '120698260366-tt592mqhut3931ct83667sfihdkv69jj.apps.googleusercontent.com',
      scope: 'profile email',
    });

    setTimeout(() => {
      r([auth2]);
    }, 100);
  });
};
