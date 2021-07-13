import qs from 'query-string';
import { ReactElement, Suspense } from 'react';
import { AsyncLoadingIndicator } from '../AsyncLoadingIndicator';
import { CategoryIndex } from './CategoryIndex';
import { MainIndex } from './MainIndex';
import { OsmElementDetails } from './OsmElementDetails';

export function Seo(): ReactElement {
  const q = qs.parse(window.location.search);

  return Object.keys(q).length === 0 ? (
    <MainIndex />
  ) : (
    <Suspense fallback={<AsyncLoadingIndicator />}>
      {q['bot-category'] ? (
        <CategoryIndex category={q['bot-category'] as string} />
      ) : (
        <OsmElementDetails />
      )}
    </Suspense>
  );
}
