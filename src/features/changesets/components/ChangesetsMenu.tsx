import { convertToDrawing } from '@app/store/actions.js';
import { useConvertToDataViewer } from '@features/dataViewer/hooks/useConvertToDataViewer.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { LongPressTooltip } from '@shared/components/LongPressTooltip.js';
import {
  Action,
  ResponsiveActions,
} from '@shared/components/ResponsiveActions.js';
import { SelectDropdown } from '@shared/components/SelectDropdown.js';
import { ToolMenu } from '@shared/components/ToolMenu.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useOnline } from '@shared/hooks/useOnline.js';
import { type ReactElement, useState } from 'react';
import { Button, Form, InputGroup } from 'react-bootstrap';
import { FaDownload, FaEraser, FaHistory, FaPencilAlt } from 'react-icons/fa';
import { MdShapeLine } from 'react-icons/md';
import { useDispatch } from 'react-redux';
import { changesetsRefresh, changesetsSetParams } from '../model/actions.js';
import { useChangesetsMessages } from '../translations/useChangesetsMessages.js';

export default function ChangesetsMenu(): ReactElement {
  const m = useMessages();

  const cm = useChangesetsMessages();

  const [authorName, setAuthorName] = useState<string | null>(
    useAppSelector((state) => state.changesets.authorName),
  );

  const days = useAppSelector((state) => state.changesets.days || 3);

  const currentBBox = useAppSelector((state) =>
    state.map.bounds ? state.map.bounds.join(',') : null,
  );

  const lastFetchedBBox = useAppSelector(
    (state) => state.changesets.lastFetchedBBox,
  );

  const online = useOnline();

  const canRefresh =
    online && currentBBox !== null && currentBBox !== lastFetchedBBox;

  const hasChangesets = useAppSelector(
    (state) => state.changesets.changesets.length > 0,
  );

  const dispatch = useDispatch();

  const convertToDataViewer = useConvertToDataViewer();

  return (
    <ToolMenu tool="changesets">
      <SelectDropdown
        id="days"
        breakpoint="lg"
        disabled={!online}
        toggleIcon={<FaHistory />}
        name={cm?.timeWindow}
        value={String(days)}
        onSelect={(d) => {
          dispatch(changesetsSetParams({ days: Number(d) }));
        }}
        options={[3, 7, 14, 30].map((d) => ({
          value: String(d),
          label: cm?.olderThan({ days: d }),
        }))}
      />

      <Form
        className="d-flex flex-nowrap"
        onSubmit={(e) => {
          e.preventDefault();

          dispatch(changesetsSetParams({ days, authorName }));
        }}
      >
        <InputGroup className="flex-nowrap">
          <Form.Control
            type="text"
            disabled={!online}
            placeholder={cm?.allAuthors}
            onChange={(e) => {
              setAuthorName(e.target.value || null);
            }}
            onBlur={() => dispatch(changesetsSetParams({ days, authorName }))}
            value={authorName ?? ''}
          />

          <Button
            variant="secondary"
            disabled={!authorName || !online}
            onClick={() => {
              setAuthorName(null);

              dispatch(changesetsSetParams({ days, authorName: null }));
            }}
          >
            <FaEraser />
          </Button>
        </InputGroup>
      </Form>

      <LongPressTooltip label={cm?.refresh}>
        {({ label, labelClassName, props }) => (
          <Button
            variant="primary"
            disabled={!canRefresh}
            onClick={() => dispatch(changesetsRefresh())}
            {...props}
          >
            <FaDownload />
            <span className={labelClassName}> {label}</span>
          </Button>
        )}
      </LongPressTooltip>

      {hasChangesets && (
        <ResponsiveActions toggleLabel={m?.general.actions}>
          <Action
            icon={<FaPencilAlt />}
            label={m?.general.convertToDrawing}
            onClick={() => {
              dispatch(convertToDrawing({ type: 'changesets' }));
            }}
            showFrom="never"
          />

          <Action
            icon={<MdShapeLine />}
            label={m?.general.convertTo({ tool: m?.tools.dataViewer })}
            onClick={() => {
              convertToDataViewer({ type: 'changesets' });
            }}
            showFrom="never"
          />
        </ResponsiveActions>
      )}
    </ToolMenu>
  );
}
