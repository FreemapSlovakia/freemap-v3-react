window.fbAsyncInit = function fbAsyncInit(): void {
  FB.init({
    appId: '171410630094006',
    // xfbml: true,
    status: true,
    version: 'v2.10',
  });
  // FB.AppEvents.logPageView();
};

if (!document.getElementById('facebook-jssdk')) {
  const js = document.createElement('script');
  js.id = 'facebook-jssdk';
  js.src = '//connect.facebook.net/sk_SK/sdk.js'; // TODO other languages?
  js.async = true;
  js.defer = true;
  const fjs = document.getElementsByTagName('script')[0];
  if (!fjs || !fjs.parentNode) {
    throw new Error('no script');
  }
  fjs.parentNode.insertBefore(js, fjs);
}
