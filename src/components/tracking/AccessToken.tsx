import { connect } from 'react-redux';
import * as React from 'react';

import Button from 'react-bootstrap/lib/Button';

import FontAwesomeIcon from 'fm3/components/FontAwesomeIcon';
import { trackingActions } from 'fm3/actions/trackingActions';
import { IAccessToken } from 'fm3/types/trackingTypes';
import injectL10n, { Translator } from 'fm3/l10nInjector';
import { compose } from 'redux';

interface Props {
  onDelete: (id: number) => void;
  onModify: (id: number) => void;
  language: string;
  accessToken: IAccessToken;
  t: Translator;
}

const AccessToken: React.FC<Props> = ({
  onDelete,
  onModify,
  accessToken,
  language,
  t,
}) => {
  const dateFormat = new Intl.DateTimeFormat(language, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const handleModify = React.useCallback(() => {
    onModify(accessToken.id);
  }, [accessToken.id, onModify]);

  const handleDelete = React.useCallback(() => {
    onDelete(accessToken.id);
  }, [accessToken.id, onDelete]);

  return (
    <tr>
      <td>
        <a
          href={`/?track=${encodeURIComponent(
            accessToken.token,
          )}&follow=${encodeURIComponent(accessToken.token)}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          {accessToken.token}
        </a>
      </td>
      <td>{dateFormat.format(accessToken.createdAt)}</td>
      <td>{accessToken.timeFrom && dateFormat.format(accessToken.timeFrom)}</td>
      <td>{accessToken.timeTo && dateFormat.format(accessToken.timeTo)}</td>
      <td>{accessToken.listingLabel}</td>
      <td>{accessToken.note}</td>
      <td>
        <Button
          bsSize="small"
          type="button"
          onClick={handleModify}
          title={t('general.modify')}
        >
          <FontAwesomeIcon icon="edit" />
        </Button>{' '}
        <Button
          bsStyle="danger"
          bsSize="small"
          type="button"
          onClick={handleDelete}
          title={t('general.delete')}
        >
          <FontAwesomeIcon icon="close" />
        </Button>
      </td>
    </tr>
  );
};

export default compose(
  injectL10n(),
  connect(
    (state: any) => ({
      language: state.l10n.language,
    }),
    dispatch => ({
      onModify(id) {
        dispatch(trackingActions.modifyAccessToken(id));
      },
      onDelete(id) {
        dispatch(trackingActions.deleteAccessToken(id));
      },
    }),
  ),
)(AccessToken);
