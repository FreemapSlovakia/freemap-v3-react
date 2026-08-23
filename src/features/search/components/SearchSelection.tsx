import { convertToDrawing, setActiveModal } from '@app/store/actions.js';
import { useConvertToDataViewer } from '@features/dataViewer/hooks/useConvertToDataViewer.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { DetailsToggle } from '@features/objects/components/DetailsToggle.js';
import { useObjectActions } from '@features/objects/components/useObjectActions.js';
import { LongPressTooltip } from '@shared/components/LongPressTooltip.js';
import {
  Action,
  ResponsiveActions,
} from '@shared/components/ResponsiveActions.js';
import { Selection } from '@shared/components/Selection.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useSimplifyPrompt } from '@shared/hooks/useSimplifyPrompt.js';
import { convertibleLines } from '@shared/simplifyTolerance.js';
import type { ReactElement } from 'react';
import { Button } from 'react-bootstrap';
import {
  FaPaintBrush,
  FaPencilAlt,
  FaSearch,
  FaThumbtack,
} from 'react-icons/fa';
import { MdShapeLine } from 'react-icons/md';
import { useDispatch } from 'react-redux';
import { searchKeepResult } from '../model/actions.js';
import {
  activeSearchResultKeptSelector,
  activeSearchResultSelector,
} from '../model/selectors.js';

type Props = {
  hidden?: boolean;
};

export function SearchSelection({ hidden }: Props): ReactElement | null {
  const m = useMessages();

  const dispatch = useDispatch();

  const askSimplification = useSimplifyPrompt();

  const convertToDataViewer = useConvertToDataViewer();

  const selectedResult = useAppSelector(activeSearchResultSelector);

  // False for every freshly picked result: it is on the map because it is being
  // looked at, and goes when that stops.
  const kept = useAppSelector(activeSearchResultKeptSelector);

  const { actions, onSelect } = useObjectActions({
    result: selectedResult ?? null,
  });

  return selectedResult &&
    !selectedResult.loading &&
    !window.fmEmbedded &&
    !hidden ? (
    // One button says what can be done about the result being on the map, and
    // which one it is says what it is doing there: a result being looked at can
    // be kept, and a kept one can be taken off. They share the slot the delete
    // button holds on every other selection toolbar, right before the ×.
    <Selection icon={<FaSearch />} label={m?.search.result} deletable={kept}>
      <DetailsToggle />

      <ResponsiveActions
        gap={1}
        align="start"
        toggleLabel={m?.general.actions}
        onSelect={onSelect}
      >
        <Action
          icon={<FaPencilAlt />}
          label={m?.general.convertToDrawing}
          onClick={() => {
            const tolerance = askSimplification(
              selectedResult.geojson
                ? convertibleLines(selectedResult.geojson)
                : [],
            );

            if (tolerance !== null) {
              dispatch(convertToDrawing({ type: 'search-result', tolerance }));
            }
          }}
          showFrom="never"
        />

        <Action
          icon={<MdShapeLine />}
          label={m?.general.convertTo({ tool: m?.tools.dataViewer })}
          onClick={() => {
            convertToDataViewer({ type: 'search-result' });
          }}
          showFrom="never"
        />

        <Action
          icon={<FaPaintBrush />}
          label={m?.mapLayers.lookupStyle}
          onClick={() => {
            dispatch(setActiveModal({ type: 'search-result-style' }));
          }}
          showFrom="never"
        />

        {actions}
      </ResponsiveActions>

      {!kept && (
        <LongPressTooltip breakpoint="sm" label={m?.search.keepOnMap}>
          {({ label, labelClassName, props }) => (
            <Button
              variant="secondary"
              onClick={() => {
                dispatch(searchKeepResult(selectedResult.id));
              }}
              {...props}
            >
              <FaThumbtack />
              <span className={labelClassName}> {label}</span>
            </Button>
          )}
        </LongPressTooltip>
      )}
    </Selection>
  ) : null;
}
