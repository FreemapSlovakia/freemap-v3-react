import axios from 'axios';
import React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import injectL10n from 'fm3/l10nInjector';
import PropTypes from 'prop-types';
import * as FmPropTypes from 'fm3/propTypes';
import { resolveTrackSurface, resolveTrackClass, resolveBicycleTypeSuitableForTrack, translate } from 'fm3/osmOntologyTools';
import { splitByVars } from 'fm3/stringUtils';

function RoadDetails({ way, bbox, mapType, language, t }) {
  function handleJosmClick() {
    axios.get(`${window.location.protocol}//localhost:${window.location.protocol === 'http:' ? 8111 : 8112}/load_and_zoom`, {
      params: {
        select: `way${way.id}`,
        left: bbox[1],
        right: bbox[3],
        top: bbox[2],
        bottom: bbox[0],
      },
    });
  }

  const dateFormat = new Intl.DateTimeFormat(language, { day: '2-digit', month: '2-digit', year: 'numeric' });

  const trackClass = resolveTrackClass(way.tags);
  const surface = resolveTrackSurface(way.tags);
  const bicycleType = resolveBicycleTypeSuitableForTrack(way.tags);
  const isBicycleMap = mapType === 'C';
  const lastEditAt = dateFormat.format(new Date(way.timestamp));
  return (
    <div>
      <dl className="dl-horizontal">
        <dt>{t('roadDetails.roadType')}</dt>
        <dd style={{ whiteSpace: 'nowrap' }}>{translate('track-class', trackClass)}</dd>
        <dt>{t('roadDetails.surface')}</dt>
        <dd>{translate('surface', surface)}</dd>
        {isBicycleMap && <dt>{t('roadDetails.suitableBikeType')}</dt>}
        {isBicycleMap && <dd style={{ whiteSpace: 'nowrap' }}>{translate('bicycle-type', bicycleType)}</dd>}
        <dt>{t('roadDetails.lastChange')}</dt>
        <dd>{lastEditAt}</dd>
      </dl>
      <p>
        {
          splitByVars(t('roadDetails.edit')).map((token, i) => {
            switch (token) {
              case '{id}':
                return (
                  <a
                    key={i}
                    href={`https://www.openstreetmap.org/edit?editor=id&way=${way.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    iD
                  </a>
                );
              case '{josm}':
                return (
                  <a
                    key={i}
                    onClick={handleJosmClick}
                    role="button"
                    tabIndex={0}
                  >
                    JOSM
                  </a>
                );
              default:
                return token;
            }
          })
        }
      </p>
    </div>
  );
}

RoadDetails.propTypes = {
  language: PropTypes.string,
  t: PropTypes.func.isRequired,
  way: PropTypes.shape({
    tags: PropTypes.object.isRequired,
    id: PropTypes.number.isRequired,
    timestamp: PropTypes.number.isRequired,
  }),
  bbox: PropTypes.arrayOf(PropTypes.number.isRequired).isRequired,
  mapType: FmPropTypes.mapType.isRequired,
};

export default compose(
  injectL10n(),
  connect(
    state => ({
      mapType: state.map.mapType,
      language: state.l10n.language,
    }),
  ),
)(RoadDetails);
