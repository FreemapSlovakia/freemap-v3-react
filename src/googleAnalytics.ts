(window as any).ga =
  window.ga ||
  function initGa(...args: any[]) {
    (window.ga.q = window.ga.q || []).push(args);
  };

if (process.env['GA_TRACKING_CODE']) {
  window.ga('create', process.env['GA_TRACKING_CODE'], 'auto');
  window.ga('set', 'page', '/');
  window.ga('send', 'pageview');
}
