import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import Glyphicon from 'react-bootstrap/lib/Glyphicon';
import Navbar from 'react-bootstrap/lib/Navbar';
import Button from 'react-bootstrap/lib/Button';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import InputGroup from 'react-bootstrap/lib/InputGroup';
import FormControl from 'react-bootstrap/lib/FormControl';
import ButtonGroup from 'react-bootstrap/lib/ButtonGroup';
import MenuItem from 'react-bootstrap/lib/MenuItem';
import DropdownButton from 'react-bootstrap/lib/DropdownButton';
import FontAwesomeIcon from 'fm3/components/FontAwesomeIcon';

import { changesetsSetDays, changesetsSetAuthorNameAndRefresh } from 'fm3/actions/changesetsActions';
import { setTool } from 'fm3/actions/mainActions';

class ChangesetsMenu extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      authorName: this.props.authorName,
    };
  }

  componentWillReceiveProps(nextProps) {
    const settingAuthorNameFromChangesetDetailToast = nextProps.authorName !== this.state.authorName && nextProps.days === this.props.days && nextProps.zoom === this.props.zoom;
    if (settingAuthorNameFromChangesetDetailToast) {
      this.setState({ authorName: nextProps.authorName });
    }
  }

  canSearchWithThisAmountOfDays =(amountOfDays) => {
    if (this.state.authorName) {
      return true;
    }
    const zoom = this.props.zoom;
    return (amountOfDays === 3 && zoom >= 9) || (amountOfDays === 7 && zoom >= 10) || (amountOfDays === 14 && zoom >= 11);
  }

  render() {
    const { days, onChangesetsSetDays, onChangesetsSetAuthorNameAndRefresh, onCancel } = this.props;
    return (
      <div>
        <Navbar.Form pullLeft>
          <ButtonGroup>
            <DropdownButton title={`Zmeny novšie ako ${days} dn${days === 3 ? 'i' : 'í'}`} id="days">
              {[3, 7, 14, 30].map(d => (
                <MenuItem key={d} disabled={!this.canSearchWithThisAmountOfDays(d)} onClick={() => (this.canSearchWithThisAmountOfDays(d) ? onChangesetsSetDays(d) : false)}>{d} dn{d === 3 ? 'i' : 'í'}</MenuItem>
              ))}
            </DropdownButton>
          </ButtonGroup>
          {' '}
          <FormGroup>
            <InputGroup>
              <FormControl
                type="text"
                placeholder="Všetci autori"
                onChange={e => this.setState({ authorName: e.target.value === '' ? null : e.target.value })}
                value={this.state.authorName || ''}
              />
              <InputGroup.Button>
                <Button
                  disabled={!this.state.authorName}
                  onClick={() => this.setState({ authorName: null })}
                >
                  <FontAwesomeIcon icon="times" />
                </Button>
              </InputGroup.Button>
            </InputGroup>
          </FormGroup>
          {' '}
          <ButtonGroup>
            <Button
              disabled={!this.canSearchWithThisAmountOfDays(days)}
              onClick={() => onChangesetsSetAuthorNameAndRefresh(this.state.authorName)}
              title="Stiahnuť zmeny"
            >
              <FontAwesomeIcon icon="refresh" /><span className="hidden-sm"> Stiahnuť zmeny</span>
            </Button>
          </ButtonGroup>
          {' '}
          <Button onClick={onCancel}><Glyphicon glyph="remove" /> Zavrieť</Button>
        </Navbar.Form>
      </div>
    );
  }
}

ChangesetsMenu.propTypes = {
  days: PropTypes.number.isRequired,
  zoom: PropTypes.number.isRequired,
  authorName: PropTypes.string,
  onChangesetsSetDays: PropTypes.func.isRequired,
  onChangesetsSetAuthorNameAndRefresh: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

export default connect(
  state => ({
    days: state.changesets.days,
    authorName: state.changesets.authorName,
    zoom: state.map.zoom,
  }),
  dispatch => ({
    onChangesetsSetDays(days) {
      dispatch(changesetsSetDays(days));
    },
    onChangesetsSetAuthorNameAndRefresh(authorName) {
      dispatch(changesetsSetAuthorNameAndRefresh(authorName));
    },
    onCancel() {
      dispatch(setTool(null));
    },
  }),
)(ChangesetsMenu);
