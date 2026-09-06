import { convertToDrawing } from '@app/store/actions.js';
import type { RootState } from '@app/store/store.js';
import { useConvertToDataViewer } from '@features/dataViewer/hooks/useConvertToDataViewer.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { fetchOsmFullGeojson } from '@features/osm/model/fetchOsmFullGeojson.js';
import type { SelectCallback } from '@restart/ui/types';
import {
  Action,
  ResponsiveActions,
} from '@shared/components/ResponsiveActions.js';
import { geometryKind, useConvertPrompt } from '@shared/convertDialog.js';
import { convertibleLines } from '@shared/simplifyTolerance.js';
import type { Feature } from 'geojson';
import type { ReactElement, ReactNode } from 'react';
import { FaPencilAlt, FaSearch } from 'react-icons/fa';
import { MdShapeLine } from 'react-icons/md';
import { useDispatch, useStore } from 'react-redux';
import type { ObjectsResult } from '../model/actions.js';
import { objectsShowAsLookup } from '../model/actions.js';
import { useObjectsMessages } from '../translations/useObjectsMessages.js';

type Props = {
  /** The one object to act on. Absent acts on every visible object. */
  object?: ObjectsResult;
  /** Further `Action`s for the same menu — what the one object can do. */
  children?: ReactNode;
  onSelect?: SelectCallback;
};

/**
 * What can be made of an object somewhere else — a drawing, loaded data, a
 * lookup. Shared by
 * the selection toolbar and the tool's own, so that acting on one object and
 * acting on all of them are the same gesture, and the next thing they can
 * become is added once.
 *
 * Acting on all of them hands them over for good, so it "converts"; one object
 * stays where it is, so it is copied. Both ask what to take along, and the
 * element's own geometry is offered there for a single object only: fetching it
 * for a whole screenful would be an OSM request per object.
 */
export function ObjectsConvertMenu({
  object,
  children,
  onSelect,
}: Props): ReactElement {
  const m = useMessages();

  const om = useObjectsMessages();

  const dispatch = useDispatch();

  const store = useStore<RootState>();

  const convertToDataViewer = useConvertToDataViewer();

  const askConversion = useConvertPrompt();

  const id = object?.id;

  // A node is the geometry it is drawn at, so there is nothing to choose.
  const geometry = id !== undefined && id.elementType !== 'node';

  const drawingLabel = object
    ? m?.general.copyToDrawing
    : m?.general.convertAllToDrawing;

  const dataViewerLabel = (
    object ? m?.general.copyTo : m?.general.convertAllTo
  )?.({ tool: m?.tools.dataViewer });

  const convertToDrawingWithChoices = () => {
    const targets = object ? [object] : store.getState().objects.objects;

    // Kept from the probe so the conversion doesn't fetch the element a second
    // time — and so the tolerance answers for the geometry it will thin.
    let fetched: Feature | undefined;

    void askConversion({
      title: drawingLabel,
      props: targets.map((target) => target.tags ?? {}),
      geometry,
      osm: true,
      probeGeometry:
        geometry && id
          ? async () => {
              fetched = await fetchOsmFullGeojson(id, store.getState);

              return {
                lines: convertibleLines(fetched),
                kind: geometryKind(fetched),
              };
            }
          : undefined,
    }).then((choices) => {
      if (!choices) {
        return;
      }

      dispatch(
        choices.geometry === 'full' && id
          ? convertToDrawing({
              type: 'objects-geometry',
              id,
              carry: choices.carry,
              geojson: fetched,
              tolerance: choices.tolerance,
            })
          : convertToDrawing({ type: 'objects', id, carry: choices.carry }),
      );
    });
  };

  return (
    <ResponsiveActions onSelect={onSelect} toggleLabel={m?.general.actions}>
      <Action
        icon={<FaPencilAlt />}
        label={drawingLabel}
        onClick={convertToDrawingWithChoices}
        showFrom="never"
      />

      <Action
        icon={<MdShapeLine />}
        label={dataViewerLabel}
        onClick={() => {
          convertToDataViewer(
            { type: 'objects', id },
            { geometry, title: dataViewerLabel },
          );
        }}
        showFrom="never"
      />

      <Action
        icon={<FaSearch />}
        label={om?.showAsLookup}
        onClick={() => {
          dispatch(objectsShowAsLookup({ id }));
        }}
        showFrom="never"
      />

      {children}
    </ResponsiveActions>
  );
}
