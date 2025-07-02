type Props = {
  tilesFrom: string;
  hostedBy: string;
};

export function MaptilerAttribution({ tilesFrom, hostedBy }: Props) {
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
      .
    </>
  );
}
