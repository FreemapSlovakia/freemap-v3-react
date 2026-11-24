import type { ReactElement } from 'react';
import type { TagRelation } from '../tagRefs.js';

/** "broadest < broader < **tag** (= synonym) < narrower, narrower" */
export function TagRelationLine({
  relation: { broader, shown, synonyms, narrower },
}: {
  relation: TagRelation;
}): ReactElement {
  return (
    <div>
      {broader.map((b) => `${b} < `)}
      <b>{shown}</b>
      {synonyms.length > 0 && ` (= ${synonyms.join(', ')})`}
      {narrower.length > 0 && ` < ${narrower.join(', ')}`}
    </div>
  );
}
