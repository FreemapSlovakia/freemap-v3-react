import React from 'react';
import { connect } from 'react-redux';
import { compose, Dispatch } from 'redux';
import Form from 'react-bootstrap/lib/Form';
import Button from 'react-bootstrap/lib/Button';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import InputGroup from 'react-bootstrap/lib/InputGroup';
import FormControl from 'react-bootstrap/lib/FormControl';
import ButtonGroup from 'react-bootstrap/lib/ButtonGroup';
import MenuItem from 'react-bootstrap/lib/MenuItem';
import DropdownButton from 'react-bootstrap/lib/DropdownButton';
import FontAwesomeIcon from 'fm3/components/FontAwesomeIcon';
import { withTranslator, Translator } from 'fm3/l10nInjector';

import {
  changesetsSetDays,
  changesetsSetAuthorName,
} from 'fm3/actions/changesetsActions';
import { RootState } from 'fm3/storeCreator';
import { RootAction } from 'fm3/actions';

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps> & {
    t: Translator;
  };

interface IState {
  authorName: string | null;
  authorNameFromProps: string | null;
}

class ChangesetsMenu extends React.Component<Props> {
  state: IState = {
    authorName: null,
    authorNameFromProps: null,
  };

  static getDerivedStateFromProps(props: Props, state: IState) {
    if (props.authorName !== state.authorNameFromProps) {
      return {
        authorName: props.authorName,
        authorNameFromProps: props.authorName,
      };
    }

    return null;
  }

  canSearchWithThisAmountOfDays = (amountOfDays: number) => {
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

  handleAuthorNameChange = (e: React.FormEvent<FormControl>) => {
    const input = e.target as HTMLInputElement;
    this.setState({
      authorName: input.value === '' ? null : input.value,
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
              title={t('changesets.olderThanFull', { days })}
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
                  {t('changesets.olderThan', { days: d })}
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

const mapStateToProps = (state: RootState) => ({
  days: state.changesets.days || 3,
  authorName: state.changesets.authorName,
  zoom: state.map.zoom,
});

const mapDispatchToProps = (dispatch: Dispatch<RootAction>) => ({
  onChangesetsSetDays(days: number | null) {
    dispatch(changesetsSetDays(days));
  },
  onChangesetsSetAuthorNameAndRefresh(
    days: number | null,
    authorName: string | null,
  ) {
    dispatch(changesetsSetDays(days));
    dispatch(changesetsSetAuthorName(authorName));
  },
});

export default compose(
  withTranslator,
  connect(
    mapStateToProps,
    mapDispatchToProps,
  ),
)(ChangesetsMenu);
