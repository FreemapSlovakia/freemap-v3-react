import React from 'react';
import Modal from 'react-bootstrap/lib/Modal';
import ButtonToolbar from 'react-bootstrap/lib/ButtonToolbar';
import Button from 'react-bootstrap/lib/Button';
import Tab from 'react-bootstrap/lib/Tab';
import Tabs from 'react-bootstrap/lib/Tabs';

import { poiTypeGroups, poiTypes } from '../poiTypes';

export default class ObjectsModal extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      selections: new Set(),
      group: 0
    };
  }

  showObjects() {
    this.props.onClose([ ...this.state.selections ]
      .map(i => poiTypes[i])
      .map(({ key, value }) => `node["${key}"="${value}"]`));
  }

  select(i) {
    const s = new Set(this.state.selections);
    if (s.has(i)) {
      s.delete(i);
    } else {
      s.add(i);
    }

    this.setState({ selections: s });
  }

  handleGroupSelect(group) {
    this.setState({ group });
  }

  render() {
    const { onClose } = this.props;
    const { selections } = this.state;

    const b = (fn, ...args) => fn.bind(this, ...args);

    return (
      <Modal show onHide={b(onClose)}>
        <Modal.Header closeButton>
          <Modal.Title>Objekty</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Tabs activeKey={this.state.group} id="groupTabs" onSelect={b(this.handleGroupSelect)} animation={false}>
            {poiTypeGroups.map(({ id, title }, i) => (
              <Tab key={i} eventKey={i} title={title}>
                <ButtonToolbar>
                  {poiTypes.map(({ group, title }, i) =>
                    group === id && <Button key={i} onClick={b(this.select, i)} bsStyle={selections.has(i) ? 'primary' : undefined}>{title}</Button>)
                  }
                </ButtonToolbar>
              </Tab>
            ))}
          </Tabs>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={b(this.showObjects)} disabled={!selections.size}>Zobraz</Button>
          <Button onClick={b(onClose)}>Zavri</Button>
        </Modal.Footer>
      </Modal>
    );
  }

}

ObjectsModal.propTypes = {
  onClose: React.PropTypes.func.isRequired
};
