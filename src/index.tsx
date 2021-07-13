import { lazy, Suspense } from 'react';
import { render } from 'react-dom';
import { AsyncLoadingIndicator } from './components/AsyncLoadingIndicator';

if (
  window.isRobot &&
  (location.search === '' ||
    location.search.startsWith('?bot-category=') ||
    location.search.includes('&osm-'))
) {
  const Seo = lazy(() =>
    import(/* webpackChunkName: "Seo" */ './components/seo/Seo').then(
      ({ Seo }) => ({ default: Seo }),
    ),
  );

  render(
    <Suspense fallback={<AsyncLoadingIndicator />}>
      <Seo />
    </Suspense>,

    document.getElementById('app'),
  );
} else {
  import('./main');
}
