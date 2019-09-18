import React from 'react';
import { connect } from 'react-redux';

import ButtonToolbar from 'react-bootstrap/lib/ButtonToolbar';
import ButtonGroup from 'react-bootstrap/lib/ButtonGroup';
import Panel from 'react-bootstrap/lib/Panel';

import ToolsMenuButton from 'fm3/components/ToolsMenuButton';
import MoreMenuButton from 'fm3/components/MoreMenuButton';

import { RootState } from 'fm3/storeCreator';

type Props = ReturnType<typeof mapStateToProps>;

const MenuInt: React.FC<Props> = ({ tool }) => {
  return (
    <Panel className={`fm-toolbar${tool ? ' hidden-xs' : ''}`}>
      <ButtonToolbar>
        <ButtonGroup>
          <ToolsMenuButton />
          <MoreMenuButton />
        </ButtonGroup>
      </ButtonToolbar>
    </Panel>
  );
};

const mapStateToProps = (state: RootState) => ({
  tool: state.main.tool,
});

export const Menu = connect(mapStateToProps)(MenuInt);
