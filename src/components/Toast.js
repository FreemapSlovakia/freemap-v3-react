import React from 'react';
import PropTypes from 'prop-types';
import ButtonToolbar from 'react-bootstrap/lib/ButtonToolbar';
import Button from 'react-bootstrap/lib/Button';
import Alert from 'react-bootstrap/lib/Alert';

import 'fm3/styles/toasts.scss';

export default class Toast extends React.Component {
  static propTypes = {
    id: PropTypes.number.isRequired,
    message: PropTypes.string.isRequired,
    onAction: PropTypes.func.isRequired,
    actions: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string,
        action: PropTypes.object,
        style: PropTypes.string,
      }),
    ).isRequired,
  }

  handleToastClicked = () => {
    this.props.onAction(this.props.id);
  }

  render() {
    const { message, actions, onAction, id } = this.props;
    const defaultAction = actions.find(({ name }) => !name);
    const clickHandler = defaultAction ? () => onAction(id, defaultAction.action) : undefined;
    const buttonActions = actions.filter(({ name }) => name);

    return (
      <Alert className="new-toast" bsStyle="danger" onClick={clickHandler}>
        <p>{message}</p>
        {buttonActions.length &&
          <ButtonToolbar>
            {
              buttonActions.map(({ name, action, style }) => (
                <Button key={name} bsStyle={style} onClick={() => onAction(id, action)}>{name}</Button>
              ))
            }
          </ButtonToolbar>
        }
      </Alert>
    );
  }
}
