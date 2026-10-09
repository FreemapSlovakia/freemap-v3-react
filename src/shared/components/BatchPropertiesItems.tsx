import { setActiveModal } from '@app/store/actions.js';
import { useDrawingMessages } from '@features/drawing/translations/useDrawingMessages.js';
import type { BatchCounts, BatchKind } from '@shared/batchProperties.js';
import type { ReactElement } from 'react';
import { Dropdown } from 'react-bootstrap';
import { FaDrawPolygon, FaMapMarkerAlt, FaTags } from 'react-icons/fa';
import { MdPolyline } from 'react-icons/md';
import { useDispatch } from 'react-redux';
import { FmDropdownMenu } from './FmDropdownMenu.js';
import { LongPressTooltip } from './LongPressTooltip.js';

type Props = {
  modal: 'drawing-batch-properties' | 'data-viewer-batch-properties';
  counts: BatchCounts;
};

/** The kinds worth offering: all, and each kind present beside another. */
function kindsOf(counts: BatchCounts): BatchKind[] {
  const present = (['points', 'lines', 'polygons'] as const).filter(
    (kind) => counts[kind] > 0,
  );

  return present.length === 0
    ? []
    : ['all', ...(present.length > 1 ? present : [])];
}

/** Menu items opening the properties of every feature of a kind. */
export function BatchPropertiesItems({
  modal,
  counts,
  divided,
}: Props & {
  /** Set apart from items above them in the same menu. */
  divided?: boolean;
}): ReactElement | null {
  const dm = useDrawingMessages();

  const dispatch = useDispatch();

  const kinds = kindsOf(counts);

  return kinds.length === 0 ? null : (
    <>
      {divided && <Dropdown.Divider />}

      <Dropdown.Header>{dm?.batch.title}</Dropdown.Header>

      {kinds.map((kind) => (
        <Dropdown.Item
          key={kind}
          as="button"
          onClick={() => dispatch(setActiveModal({ type: modal, kind }))}
        >
          {ICONS[kind]} &nbsp;{dm?.batch[kind] ?? '…'}
        </Dropdown.Item>
      ))}
    </>
  );
}

const ICONS: Record<BatchKind, ReactElement> = {
  all: <FaTags />,
  points: <FaMapMarkerAlt />,
  lines: <MdPolyline />,
  polygons: <FaDrawPolygon />,
};

/** The same items under a button of their own. */
export function BatchPropertiesDropdown({
  size,
  ...props
}: Props & { size?: 'sm' }): ReactElement | null {
  const dm = useDrawingMessages();

  return kindsOf(props.counts).length === 0 ? null : (
    <Dropdown>
      <LongPressTooltip label={dm?.batch.title}>
        {({ props: tooltipProps }) => (
          <Dropdown.Toggle variant="secondary" size={size} {...tooltipProps}>
            <FaTags />
          </Dropdown.Toggle>
        )}
      </LongPressTooltip>

      <FmDropdownMenu>
        <BatchPropertiesItems {...props} />
      </FmDropdownMenu>
    </Dropdown>
  );
}
