import { useMessages } from 'fm3/l10nInjector';
import {
  resolveBicycleTypeSuitableForTrack,
  resolveTrackClass,
  resolveTrackSurface,
} from 'fm3/osmOntologyTools';
import { RootState } from 'fm3/storeCreator';
import { ReactElement } from 'react';
import Alert from 'react-bootstrap/Alert';
import { useSelector } from 'react-redux';

type Props = {
  way: {
    id: number;
    tags: {
      [key: string]: string;
    };
    timestamp: string;
  };
};

export function RoadDetails({ way }: Props): ReactElement {
  const m = useMessages();

  const mapType = useSelector((state: RootState) => state.map.mapType);

  const language = useSelector((state: RootState) => state.l10n.language);

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
        <dt>{m?.roadDetails.roadType}</dt>
        <dd>{m?.roadDetails.trackClasses[trackClass] ?? trackClass}</dd>
        <dt>{m?.roadDetails.surface}</dt>
        <dd>{m?.roadDetails.surfaces[surface] ?? surface}</dd>
        {isBicycleMap && <dt>{m?.roadDetails.suitableBikeType}</dt>}
        {isBicycleMap && (
          <dd className="text-nowrap">
            {m?.roadDetails.bicycleTypes[bicycleType]}
          </dd>
        )}
        <dt>{m?.roadDetails.lastChange}</dt>
        <dd>{lastEditAt}</dd>
      </dl>
      <p>
        <Alert.Link
          key="allDetails"
          href={`https://www.openstreetmap.org/way/${way.id}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          {m?.roadDetails.showDetails}
        </Alert.Link>
      </p>
    </div>
  );
}
