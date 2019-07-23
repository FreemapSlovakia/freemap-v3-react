import { connect } from 'react-redux';
import * as React from 'react';

import Button from 'react-bootstrap/lib/Button';

import FontAwesomeIcon from 'fm3/components/FontAwesomeIcon';
import { trackingActions } from 'fm3/actions/trackingActions';
import { IAccessToken } from 'fm3/types/trackingTypes';
import { withTranslator, Translator } from 'fm3/l10nInjector';
import { Dispatch, bindActionCreators } from 'redux';
import { RootState } from 'fm3/storeCreator';
import { RootAction } from 'fm3/actions';

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps> & {
    t: Translator;
    accessToken: IAccessToken;
  };

const AccessTokenInt: React.FC<Props> = ({
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

const mapStateToProps = (state: RootState) => ({
  language: state.l10n.language,
});

const mapDispatchToProps = (dispatch: Dispatch<RootAction>) =>
  bindActionCreators(
    {
      onModify: trackingActions.modifyAccessToken,
      onDelete: trackingActions.deleteAccessToken,
    },
    dispatch,
  );

export const AccessToken = connect(
  mapStateToProps,
  mapDispatchToProps,
)(withTranslator(AccessTokenInt));
