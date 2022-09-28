import { useAppSelector } from 'fm3/hooks/reduxSelectHook';

type Props = {
  tilesFrom: string;
  hostedBy: string;
  see: string;
  _3Dterrain: string;
};

export function MaptilerAttribution({
  tilesFrom,
  hostedBy,
  see,
  _3Dterrain,
}: Props) {
  const map = useAppSelector((state) => state.map);

  const lang = useAppSelector((state) => state.l10n.chosenLanguage);

  return (
    <>
      {tilesFrom + ' '}
      <a href="https://openmaptiles.org" target="_blank" rel="noreferrer">
        OpenMapTiles
      </a>{' '}
      {hostedBy + ' '}
      <a href="https://www.maptiler.com" target="_blank" rel="noreferrer">
        MapTiler
      </a>
      {`. ${see} `}
      <a
        href={`https://labs.maptiler.com/showcase/osm-3d-terrain/#map=${
          map.zoom - 1
        }/${map.lat}/${map.lon}&style=osm&is3d=true&language=${lang}`}
        target="_blank"
        rel="noreferrer"
      >
        {_3Dterrain}
      </a>
      .
    </>
  );
}
