import React from 'react';
import { connect } from 'react-redux';
import { Tooltip } from 'react-leaflet';
import PropTypes from 'prop-types';

import MarkerWithInnerLabel from 'fm3/components/leaflet/MarkerWithInnerLabel';
import { toastsAdd } from 'fm3/actions/toastsActions';
import { changesetsSetAuthorNameAndRefresh } from 'fm3/actions/changesetsActions';

import 'fm3/styles/changesets.scss';

const timeFormat = new Intl.DateTimeFormat('sk',
  { day: '2-digit', month: '2-digit', hour: 'numeric', minute: '2-digit' });

const ONE_DAY = (1000 * 60 * 60 * 24);

class Changesets extends React.Component {
  opacityOf = (changeset, now) => {
    const changesetAgeInDays = (now - changeset.closedAt) / ONE_DAY;
    const freshness = (changesetAgeInDays / this.props.days); // <0.0, 1.0>
    return freshness * 0.4 + 0.6; // <0.6, 1.0> . markers with opacity below 0.6 are almost invisible
  }

  render() {
    const { changesets, onShowChangesetDetail } = this.props;
    const now = new Date();
    return (
      <div>
        { changesets.map((changeset) => {
          const opacity = this.opacityOf(changeset, now);
          return (<MarkerWithInnerLabel
            faIcon="pencil"
            opacity={opacity}
            key={changeset.id}
            faIconLeftPadding="2px"
            position={L.latLng(changeset.centerLat, changeset.centerLon)}
            onClick={() => onShowChangesetDetail(changeset)}
          >
            <Tooltip opacity={opacity} className="compact" offset={new L.Point(9, -25)} direction="right" permanent>
              <div className="shortened">
                <b>{changeset.userName}: </b>
                {changeset.description}
              </div>
            </Tooltip>
          </MarkerWithInnerLabel>);
        }) }
      </div>
    );
  }
}


Changesets.propTypes = {
  changesets: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    centerLat: PropTypes.number.isRequired,
    centerLon: PropTypes.number.isRequired,
    userName: PropTypes.string.isRequired,
    description: PropTypes.string,
    closedAt: PropTypes.instanceOf(Date).isRequired,
  })),
  days: PropTypes.number.isRequired,
  onShowChangesetDetail: PropTypes.func.isRequired,
};

export default connect(
  state => ({
    changesets: state.changesets.changesets,
    days: state.changesets.days,
  }),
  dispatch => ({
    onShowChangesetDetail(changeset) {
      const message = (
        <div>
          <dl className="dl-horizontal">
            <dt>Autor:</dt>
            <dd>
              <a role="link" tabIndex={0} style={{ cursor: 'pointer' }} onClick={() => { dispatch(changesetsSetAuthorNameAndRefresh(changeset.userName)); }}>{changeset.userName}</a>
            </dd>
            <dt>Popis:</dt>
            <dd>{changeset.description || <i>bez popisu</i>}</dd>
            <dt>Čas:</dt>
            <dd>{timeFormat.format(changeset.closedAt)}</dd>
          </dl>
          <p>
            Viac detailov na{' '}
            <a
              href={`https://www.openstreetmap.org/changeset/${changeset.id}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              osm.org
            </a>
            {', alebo '}
            <a
              href={`https://overpass-api.de/achavi/?changeset=${changeset.id}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Achavi
            </a>
            .
          </p>
        </div>
      );

      dispatch(toastsAdd({
        collapseKey: 'changeset.detail',
        message,
        cancelType: ['SET_TOOL', 'CHANGESETS_SET_AUTHOR_NAME_AND_REFRESH'],
        style: 'info',
      }));
    },
  }),
)(Changesets);
