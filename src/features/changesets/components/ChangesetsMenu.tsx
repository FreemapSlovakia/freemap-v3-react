import { convertToDrawing } from '@app/store/actions.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { LongPressTooltip } from '@shared/components/LongPressTooltip.js';
import { SelectDropdown } from '@shared/components/SelectDropdown.js';
import { ToolMenu } from '@shared/components/ToolMenu.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { type ReactElement, useState } from 'react';
import { Button, Form, InputGroup } from 'react-bootstrap';
import { FaDownload, FaEraser, FaHistory, FaPencilAlt } from 'react-icons/fa';
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

  const canRefresh = currentBBox !== null && currentBBox !== lastFetchedBBox;

  const hasChangesets = useAppSelector(
    (state) => state.changesets.changesets.length > 0,
  );

  const dispatch = useDispatch();

  return (
    <ToolMenu tool="changesets">
      <SelectDropdown
        className="ms-1"
        id="days"
        breakpoint="lg"
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
        className="ms-1 d-flex flex-nowrap"
        onSubmit={(e) => {
          e.preventDefault();

          dispatch(changesetsSetParams({ days, authorName }));
        }}
      >
        <InputGroup className="flex-nowrap">
          <Form.Control
            type="text"
            placeholder={cm?.allAuthors}
            onChange={(e) => {
              setAuthorName(e.target.value || null);
            }}
            onBlur={() => dispatch(changesetsSetParams({ days, authorName }))}
            value={authorName ?? ''}
          />

          <Button
            variant="secondary"
            disabled={!authorName}
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
            className="ms-1"
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
        <LongPressTooltip label={m?.general.convertToDrawing}>
          {({ label, labelClassName, props }) => (
            <Button
              className="ms-1"
              variant="secondary"
              onClick={() => dispatch(convertToDrawing({ type: 'changesets' }))}
              {...props}
            >
              <FaPencilAlt />
              <span className={labelClassName}> {label}</span>
            </Button>
          )}
        </LongPressTooltip>
      )}
    </ToolMenu>
  );
}
