import { ReactElement, useEffect, useState } from 'react';
import { Alert, Spinner } from 'react-bootstrap';
import { useAppSelector } from '../hooks/useAppSelector.js';
import { CustomLayerDef, IsWmsLayerDef } from '../mapDefinitions.js';
import { Layer, wms } from '../wms.js';

type Props = {
  def: CustomLayerDef<IsWmsLayerDef>;
};

export function WmsMapLegend({ def }: Props) {
  const [layers, setLayers] = useState<Layer[]>();

  const [error, setError] = useState('');

  const scale = useAppSelector((state) => leafletZoomToScale(state.map.zoom));

  useEffect(() => {
    wms(def.url).then(
      (data) => {
        console.log(data);
        setLayers(data.layersTree);
      },
      (err) => {
        setError(String(err));
      },
    );
  }, [def.url]);

  return error ? (
    <Alert variant="danger">{error}</Alert>
  ) : layers ? (
    layersLegend(layers)
  ) : (
    <Spinner />
  );

  function layersLegend(layers: Layer[]): ReactElement[] {
    return layers.map((layer) => (
      <>
        {layer.name &&
        layer.legendUrl &&
        def.layers.includes(layer.name) &&
        (layer.maxScale == null || layer.maxScale >= scale) &&
        (layer.minScale == null || layer.minScale <= scale) ? (
          <div>
            <img src={layer.legendUrl} /> {layer.title}
          </div>
        ) : null}

        {...layersLegend(layer.children)}
      </>
    ));
  }
}

function leafletZoomToScale(zoom: number): number {
  const earthRadius = 6378137; // in meters (WGS84)
  const earthCircumference = 2 * Math.PI * earthRadius;
  const tileSize = 256; // Leaflet default
  const resolution = earthCircumference / tileSize / 2 ** zoom;
  return resolution / 0.00028; // WMS standard pixel size = 0.28 mm
}
