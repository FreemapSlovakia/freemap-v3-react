import React from 'react';
import { connect } from 'react-redux';
import { withTranslator, Translator } from 'fm3/l10nInjector';
import {
  resolveTrackSurface,
  resolveTrackClass,
  resolveBicycleTypeSuitableForTrack,
} from 'fm3/osmOntologyTools';
import { RootState } from 'fm3/storeCreator';

type Props = ReturnType<typeof mapStateToProps> & {
  t: Translator;
  way: {
    id: number;
    tags: {
      [key: string]: string;
    };
    timestamp: string;
  };
};

const RoadDetailsInt: React.FC<Props> = ({ way, mapType, language, t }) => {
  const dateFormat = new Intl.DateTimeFormat(language, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  const trackClass = resolveTrackClass(way.tags);
  const surface = resolveTrackSurface(way.tags);
  const bicycleType = resolveBicycleTypeSuitableForTrack(way.tags);
  const isBicycleMap = mapType === 'C';
  const lastEditAt = dateFormat.format(new Date(way.timestamp));

  return (
    <div>
      <dl className="dl-horizontal">
        <dt>{t('roadDetails.roadType')}</dt>
        <dd>{t(`roadDetails.trackClasses.${trackClass}`, {}, trackClass)}</dd>
        <dt>{t('roadDetails.surface')}</dt>
        <dd>{t(`roadDetails.surfaces.${surface}`) || surface}</dd>
        {isBicycleMap && <dt>{t('roadDetails.suitableBikeType')}</dt>}
        {isBicycleMap && (
          <dd style={{ whiteSpace: 'nowrap' }}>
            {t(`roadDetails.bicycleTypes.${bicycleType}`)}
          </dd>
        )}
        <dt>{t('roadDetails.lastChange')}</dt>
        <dd>{lastEditAt}</dd>
      </dl>
      <p>
        <a
          key="allDetails"
          href={`https://www.openstreetmap.org/way/${way.id}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          {t('roadDetails.showDetails')}
        </a>
      </p>
    </div>
  );
};

const mapStateToProps = (state: RootState) => ({
  mapType: state.map.mapType,
  language: state.l10n.language,
});

export const RoadDetails = connect(mapStateToProps)(
  withTranslator(RoadDetailsInt),
);
