import { setTool } from 'fm3/actions/mainActions';
import { useAppSelector } from 'fm3/hooks/reduxSelectHook';
import { useScrollClasses } from 'fm3/hooks/useScrollClasses';
import { useMessages } from 'fm3/l10nInjector';
import { toolDefinitions } from 'fm3/toolDefinitions';
import { setSelectedIcon } from 'fm3/actions/drawingPointActions'
import 'leaflet/dist/leaflet.css';
import { ReactElement, ReactNode } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import ButtonToolbar from 'react-bootstrap/ButtonToolbar';
import Card from 'react-bootstrap/Card';
import { FaTimes } from 'react-icons/fa';
import { useDispatch } from 'react-redux';


type Props = {
  children?: ReactNode;
};

export function ToolMenu({ children }: Props): ReactElement {
  const sc1 = useScrollClasses('horizontal');

  const dispatch = useDispatch();

  const m = useMessages();

  const tool = useAppSelector((state) => state.main.tool);

  const toolDef = tool && toolDefinitions.find((td) => td.tool === tool);

  const handleIconChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedIconValue = event.target.value;
    dispatch(setSelectedIcon(selectedIconValue));
    console.log(selectedIconValue)
  };


  return (
    <div className="fm-ib-scroller fm-ib-scroller-top" ref={sc1}>
      <div />

      <Card className="fm-toolbar mx-2 mt-2">
        <ButtonToolbar>
          {toolDef && (
            <span className="align-self-center ml-1 mr-2">
              {toolDef.icon}
              <span className="d-none d-sm-inline">
                {' '}
                {m?.tools[toolDef.msgKey]}
              </span>
              {tool === "objects" &&
                <Form.Control className='mt-1' as="select" onChange={handleIconChange} size='sm'>
                <option value="default">Default Icon</option>
                <option value="ring">Ring Icon</option>
                <option value="rectangle">Rectangle Icon</option>
              </Form.Control>}
            </span>
          )}

          <Button
            className="ml-1"
            variant="secondary"
            // size="sm"
            onClick={() => dispatch(setTool(null))}
            title={m?.general.close + ' [Esc]'}
          >
            <FaTimes />
          </Button>

          {children}
        </ButtonToolbar>
      </Card>
    </div>
  );
}
