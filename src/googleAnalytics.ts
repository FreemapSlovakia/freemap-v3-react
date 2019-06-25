(window as any).ga =
  ga ||
  function initGa(...args: any[]) {
    (ga.q = ga.q || []).push(args);
  };

if (process.env.GA_TRACKING_CODE) {
  ga('create', process.env.GA_TRACKING_CODE, 'auto');
  ga('set', 'page', '/');
  ga('send', 'pageview');
}
