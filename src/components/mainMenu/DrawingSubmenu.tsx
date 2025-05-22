import type { ReactElement } from 'react';
import { Dropdown } from 'react-bootstrap';
import {
  FaDrawPolygon,
  FaMapMarkerAlt,
  FaPalette,
  FaPencilRuler,
} from 'react-icons/fa';
import { MdTimeline } from 'react-icons/md';
import { useAppSelector } from '../../hooks/reduxSelectHook.js';
import { useMessages } from '../../l10nInjector.js';
import { SubmenuHeader } from './SubmenuHeader.js';

export function DrawingSubmenu(): ReactElement {
  const m = useMessages();

  const tool = useAppSelector((state) => state.main.tool);

  return (
    <>
      <SubmenuHeader icon={<FaPencilRuler />} title={m?.tools.measurement} />

      <Dropdown.Item
        href="#tool=draw-points"
        eventKey="tool-draw-points"
        active={tool === 'draw-points'}
      >
        <FaMapMarkerAlt /> {m?.measurement.elevation} <kbd>g</kbd> <kbd>p</kbd>
      </Dropdown.Item>

      <Dropdown.Item
        href="#tool=draw-lines"
        eventKey="tool-draw-lines"
        active={tool === 'draw-lines'}
      >
        <MdTimeline /> {m?.measurement.distance} <kbd>g</kbd> <kbd>l</kbd>
      </Dropdown.Item>

      <Dropdown.Item
        href="#tool=draw-polygons"
        eventKey="tool-draw-polygons"
        active={tool === 'draw-polygons'}
      >
        <FaDrawPolygon /> {m?.measurement.area} <kbd>g</kbd> <kbd>n</kbd>
      </Dropdown.Item>

      <Dropdown.Divider />

      <Dropdown.Item
        href="#show=drawing-properties"
        eventKey="modal-drawing-properties"
      >
        <FaPalette /> {m?.drawing.defProps.menuItem} <kbd>e</kbd> <kbd>d</kbd>
      </Dropdown.Item>
    </>
  );
}
