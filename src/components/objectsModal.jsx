import React from 'react';
import Modal from 'react-bootstrap/lib/Modal';
import Checkbox from 'react-bootstrap/lib/Checkbox';
import Button from 'react-bootstrap/lib/Button';

const types = [
  { title: 'Vrchol', key: 'natural', value: 'peak' },
  { title: 'Prameň', key: 'natural', value: 'spring' }
];

export default class ObjectsModal extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      selections: new Set()
    }
  }

  showObjects() {
    this.props.onClose([ ...this.state.selections ]
      .map(i => types[i])
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
          {
            types.map(({ title }, i) => <Checkbox key={i} onClick={b(this.select, i)} checked={selections.has(i)}>{title}</Checkbox>)
          }
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={b(this.showObjects)}>Zobraz</Button>
          <Button onClick={b(onClose)}>Zavri</Button>
        </Modal.Footer>
      </Modal>
    );
  }

}

ObjectsModal.propTypes = {
  onClose: React.PropTypes.func.isRequired
};
