import type { ReactElement } from 'react';
import type { TagRelation } from '../tagRefs.js';

/**
 * A line per path from a root: "broadest < broader < **tag**"; the first
 * carries the synonyms and narrower tags: "(= synonym) < narrower, narrower".
 */
export function TagRelationLine({
  relation: { paths, morePaths, shown, synonyms, narrower },
}: {
  relation: TagRelation;
}): ReactElement {
  return (
    <>
      {(paths.length ? paths : [[]]).map((path, i) => (
        // By index: two broader tags may be shown alike.
        <div key={i}>
          {path.map((b) => `${b} < `)}
          <b>{shown}</b>
          {i === 0 && synonyms.length > 0 && ` (= ${synonyms.join(', ')})`}
          {i === 0 && narrower.length > 0 && ` < ${narrower.join(', ')}`}
        </div>
      ))}
      {morePaths && <div>…</div>}
    </>
  );
}
