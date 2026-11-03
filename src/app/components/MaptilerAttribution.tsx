type Props = {
  tilesFrom: string;
  hostedBy: string;
};

export function MaptilerAttribution({ tilesFrom, hostedBy }: Props) {
  return (
    <>
      {`${tilesFrom} `}
      <a
        href="https://openmaptiles.org"
        target="_blank"
        rel="noopener noreferrer"
      >
        OpenMapTiles
      </a>{' '}
      {`${hostedBy} `}
      <a
        href="https://www.maptiler.com"
        target="_blank"
        rel="noopener noreferrer"
      >
        MapTiler
      </a>
      .
    </>
  );
}
