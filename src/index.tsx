import { lazy, Suspense } from 'react';
import { render } from 'react-dom';
import { AsyncLoadingIndicator } from './components/AsyncLoadingIndicator';

if (window.isRobot && location.search.includes('&osm-')) {
  const OsmElementDetails = lazy(() =>
    import(
      /* webpackChunkName: "OsmElementDetails" */ './components/seo/OsmElementDetails'
    ).then(({ OsmElementDetails }) => ({ default: OsmElementDetails })),
  );

  render(
    <Suspense fallback={<AsyncLoadingIndicator />}>
      <OsmElementDetails />
    </Suspense>,

    document.getElementById('app'),
  );
} else {
  import('./main');
}
