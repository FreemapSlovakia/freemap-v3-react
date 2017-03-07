import React from 'react';
import { connect } from 'react-redux';

import Modal from 'react-bootstrap/lib/Modal';
import ButtonToolbar from 'react-bootstrap/lib/ButtonToolbar';
import Button from 'react-bootstrap/lib/Button';
import Tab from 'react-bootstrap/lib/Tab';
import Tabs from 'react-bootstrap/lib/Tabs';

// TODO remove import { poiTypeGroups, poiTypes } from 'fm3/poiTypes';
import { setObjectsFilter, cancelObjectsModal } from 'fm3/actions/objectsActions';

class ObjectsModal extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      selections: new Set(),
      group: 0
    };
  }

  showObjects() {
    // this.props.onSearch([ ...this.state.selections ]
    //   .map(i => poiTypes[i])
    //   .map(({ key, value }) => `node["${key}"="${value}"]`)); // TODO move to logic?
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
    const { onCancel, categories, subcategories } = this.props;
    const { selections } = this.state;

    const b = (fn, ...args) => fn.bind(this, ...args);

    return (
      <Modal show onHide={b(onCancel)}>
        <Modal.Header closeButton>
          <Modal.Title>Objekty</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Tabs activeKey={this.state.group} id="groupTabs" onSelect={b(this.handleGroupSelect)} animation={false}>
            {categories.map(({ id: cid, name }) => (
              <Tab key={cid} eventKey={cid} title={name}>
                <ButtonToolbar>
                  {subcategories.map(({ id, name, category_id }) =>
                    category_id === cid && <Button key={id} onClick={b(this.select, id)} bsStyle={selections.has(id) ? 'primary' : undefined}>{name}</Button>)
                  }
                </ButtonToolbar>
              </Tab>
            ))}
          </Tabs>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={b(this.showObjects)} disabled={!selections.size}>Zobraz</Button>
          <Button onClick={b(onCancel)}>Zavri</Button>
        </Modal.Footer>
      </Modal>
    );
  }

}

ObjectsModal.propTypes = {
  onSearch: React.PropTypes.func.isRequired,
  onCancel: React.PropTypes.func.isRequired,
  categories: React.PropTypes.array.isRequired,
  subcategories: React.PropTypes.array.isRequired
};

export default connect(
  function (state) {
    return {
      categories: state.objects.categories,
      subcategories: state.objects.subcategories
    };
  },
  function (dispatch) {
    return {
      onSearch(filter) {
        dispatch(setObjectsFilter(filter));
      },
      onCancel() {
        dispatch(cancelObjectsModal());
      }
    };
  }
)(ObjectsModal);
