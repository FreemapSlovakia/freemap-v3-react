let fbPromise: Promise<void>;

export function loadFb(): Promise<void> {
  if (fbPromise) {
    return fbPromise;
  }

  window.fbAsyncInit = function fbAsyncInit() {
    FB.init({
      appId: '171410630094006',
      // xfbml: true,
      status: true,
      version: 'v8.0',
    });
    // FB.AppEvents.logPageView();
  };

  fbPromise = new Promise<void>((resolve, reject) => {
    const js = document.createElement('script');

    js.async = true;
    js.defer = true;
    js.src = '//connect.facebook.net/sk_SK/sdk.js'; // TODO other languages?

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

  return fbPromise;
}
