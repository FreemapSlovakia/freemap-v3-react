import { setTool, Tool } from 'fm3/actions/mainActions';
import { useMessages } from 'fm3/l10nInjector';
import { ReactElement, SyntheticEvent, useCallback } from 'react';
import Dropdown from 'react-bootstrap/Dropdown';
import { FaDrawPolygon, FaMapMarkerAlt, FaPencilRuler } from 'react-icons/fa';
import { MdTimeline } from 'react-icons/md';
import { useDispatch, useSelector } from 'react-redux';
import { is } from 'typescript-is';
import { SubmenuHeader, useMenuClose } from './SubmenuHeader';

export function DrawingSubmenu(): ReactElement {
  const m = useMessages();

  const tool = useSelector((state) => state.main.tool);

  const closeMenu = useMenuClose();

  const dispatch = useDispatch();

  const setToolAndClose = useCallback(
    (tool: string | null, e: SyntheticEvent<unknown>) => {
      e.preventDefault();

      closeMenu();

      if (is<Tool>(tool)) {
        dispatch(setTool(tool));
      }
    },
    [closeMenu, dispatch],
  );

  return (
    <>
      <SubmenuHeader icon={<FaPencilRuler />} title={m?.tools.measurement} />

      <Dropdown.Item
        href="?tool=draw-points"
        eventKey="draw-points"
        onSelect={setToolAndClose}
        active={tool === 'draw-points'}
      >
        <FaMapMarkerAlt /> {m?.measurement.elevation} <kbd>g</kbd> <kbd>p</kbd>
      </Dropdown.Item>

      <Dropdown.Item
        href="?tool=draw-lines"
        eventKey="draw-lines"
        onSelect={setToolAndClose}
        active={tool === 'draw-lines'}
      >
        <MdTimeline /> {m?.measurement.distance} <kbd>g</kbd> <kbd>l</kbd>
      </Dropdown.Item>

      <Dropdown.Item
        href="?tool=draw-polygons"
        eventKey="draw-polygons"
        onSelect={setToolAndClose}
        active={tool === 'draw-polygons'}
      >
        <FaDrawPolygon /> {m?.measurement.area} <kbd>g</kbd> <kbd>n</kbd>
      </Dropdown.Item>
    </>
  );
}
