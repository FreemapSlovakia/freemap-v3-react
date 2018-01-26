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

import { changesetsSetDays, changesetsSetAuthorName } from 'fm3/actions/changesetsActions';

class ChangesetsMenu extends React.Component {
  static propTypes = {
    days: PropTypes.number,
    zoom: PropTypes.number.isRequired,
    authorName: PropTypes.string,
    onChangesetsSetDays: PropTypes.func.isRequired,
    onChangesetsSetAuthorNameAndRefresh: PropTypes.func.isRequired,
    t: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      authorName: this.props.authorName,
    };
  }

  componentWillReceiveProps(nextProps) {
    const settingAuthorNameFromChangesetDetailToast = nextProps.authorName !== this.state.authorName
      && nextProps.days === this.props.days
      && nextProps.zoom === this.props.zoom;

    if (settingAuthorNameFromChangesetDetailToast) {
      this.setState({ authorName: nextProps.authorName });
    }
  }

  canSearchWithThisAmountOfDays = (amountOfDays) => {
    if (this.state.authorName) {
      return true;
    }
    const { zoom } = this.props;
    return (amountOfDays === 3 && zoom >= 9) || (amountOfDays === 7 && zoom >= 10) || (amountOfDays === 14 && zoom >= 11);
  }

  render() {
    const { days, onChangesetsSetDays, onChangesetsSetAuthorNameAndRefresh, t } = this.props;

    return (
      <React.Fragment>
        <span className="fm-label">
          <FontAwesomeIcon icon="pencil" />
          <span className="hidden-xs"> {t('tools.changesets')}</span>
        </span>
        {' '}
        <Form inline>
          <ButtonGroup>
            <DropdownButton id="days" title={t('changesets.olderThanFull', { days }, () => '')}>
              {[3, 7, 14, 30].map(d => (
                <MenuItem
                  key={d}
                  disabled={!this.canSearchWithThisAmountOfDays(d)}
                  onClick={() => (this.canSearchWithThisAmountOfDays(d) ? onChangesetsSetDays(d) : false)}
                >
                  {t('changesets.olderThan', { days: d }, () => {})}
                </MenuItem>
              ))}
            </DropdownButton>
          </ButtonGroup>
          {' '}
          <FormGroup>
            <InputGroup>
              <FormControl
                type="text"
                placeholder={t('changesets.allAuthors')}
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
          <Button
            disabled={!this.canSearchWithThisAmountOfDays(days)}
            onClick={() => onChangesetsSetAuthorNameAndRefresh(days, this.state.authorName)}
            title={t('changesets.download')}
          >
            <FontAwesomeIcon icon="refresh" />
            <span className="hidden-xs"> {t('changesets.download')}</span>
          </Button>
        </Form>
      </React.Fragment>
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
