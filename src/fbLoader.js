window.fbAsyncInit = function fbAsyncInit() {
  window.FB.init({
    appId: '171410630094006',
    // xfbml: true,
    status: true,
    version: 'v2.10',
  });
  // window.FB.AppEvents.logPageView();
};

if (!document.getElementById('facebook-jssdk')) {
  const js = document.createElement('script');
  js.id = 'facebook-jssdk';
  js.src = '//connect.facebook.net/sk_SK/sdk.js';
  const fjs = document.getElementsByTagName('script')[0];
  fjs.parentNode.insertBefore(js, fjs);
}
