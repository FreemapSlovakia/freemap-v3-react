import React from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import PropTypes from 'prop-types';
import Form from 'react-bootstrap/lib/Form';
import Button from 'react-bootstrap/lib/Button';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import InputGroup from 'react-bootstrap/lib/InputGroup';
import FormControl from 'react-bootstrap/lib/FormControl';
import ButtonGroup from 'react-bootstrap/lib/ButtonGroup';
import MenuItem from 'react-bootstrap/lib/MenuItem';
import DropdownButton from 'react-bootstrap/lib/DropdownButton';
import FontAwesomeIcon from 'fm3/components/FontAwesomeIcon';
import injectL10n from 'fm3/l10nInjector';

import {
  changesetsSetDays,
  changesetsSetAuthorName,
} from 'fm3/actions/changesetsActions';

class ChangesetsMenu extends React.Component {
  static propTypes = {
    days: PropTypes.number,
    zoom: PropTypes.number.isRequired,
    // eslint-disable-next-line
    authorName: PropTypes.string,
    onChangesetsSetDays: PropTypes.func.isRequired,
    onChangesetsSetAuthorNameAndRefresh: PropTypes.func.isRequired,
    t: PropTypes.func.isRequired,
  };

  state = {
    authorName: null,
    // eslint-disable-next-line
    authorNameFromProps: null,
  };

  static getDerivedStateFromProps(props, state) {
    if (props.authorName !== state.authorNameFromProps) {
      return {
        authorName: props.authorName,
        authorNameFromProps: props.authorName,
      };
    }

    return null;
  }

  canSearchWithThisAmountOfDays = amountOfDays => {
    if (this.state.authorName) {
      return true;
    }
    const { zoom } = this.props;
    return (
      (amountOfDays === 3 && zoom >= 9) ||
      (amountOfDays === 7 && zoom >= 10) ||
      (amountOfDays === 14 && zoom >= 11)
    );
  };

  handleAuthorNameChange = e => {
    this.setState({
      authorName: e.target.value === '' ? null : e.target.value,
    });
  };

  render() {
    const {
      days,
      onChangesetsSetDays,
      onChangesetsSetAuthorNameAndRefresh,
      t,
    } = this.props;
    const { authorName } = this.state;

    return (
      <>
        <span className="fm-label">
          <FontAwesomeIcon icon="pencil" />
          <span className="hidden-xs"> {t('tools.changesets')}</span>
        </span>{' '}
        <Form inline>
          <ButtonGroup>
            <DropdownButton
              id="days"
              title={t('changesets.olderThanFull', { days }, () => '')}
            >
              {[3, 7, 14, 30].map(d => (
                <MenuItem
                  key={d}
                  disabled={!this.canSearchWithThisAmountOfDays(d)}
                  onClick={() =>
                    this.canSearchWithThisAmountOfDays(d)
                      ? onChangesetsSetDays(d)
                      : false
                  }
                >
                  {t('changesets.olderThan', { days: d }, () => {})}
                </MenuItem>
              ))}
            </DropdownButton>
          </ButtonGroup>{' '}
          <FormGroup>
            <InputGroup>
              <FormControl
                type="text"
                placeholder={t('changesets.allAuthors')}
                onChange={this.handleAuthorNameChange}
                value={authorName || ''}
              />
              <InputGroup.Button>
                <Button
                  disabled={!authorName}
                  onClick={() => this.setState({ authorName: null })}
                >
                  <FontAwesomeIcon icon="times" />
                </Button>
              </InputGroup.Button>
            </InputGroup>
          </FormGroup>{' '}
          <Button
            disabled={!this.canSearchWithThisAmountOfDays(days)}
            onClick={() =>
              onChangesetsSetAuthorNameAndRefresh(days, authorName)
            }
            title={t('changesets.download')}
          >
            <FontAwesomeIcon icon="refresh" />
            <span className="hidden-xs"> {t('changesets.download')}</span>
          </Button>
        </Form>
      </>
    );
  }
}

export default compose(
  injectL10n(),
  connect(
    state => ({
      days: state.changesets.days || 3,
      authorName: state.changesets.authorName,
      zoom: state.map.zoom,
    }),
    dispatch => ({
      onChangesetsSetDays(days) {
        dispatch(changesetsSetDays(days));
      },
      onChangesetsSetAuthorNameAndRefresh(days, authorName) {
        dispatch(changesetsSetDays(days));
        dispatch(changesetsSetAuthorName(authorName));
      },
    }),
  ),
)(ChangesetsMenu);
