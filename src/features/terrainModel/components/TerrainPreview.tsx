import type { Bbox } from '@features/mapArea/model/actions.js';
import {
  type ReactElement,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Spinner } from 'react-bootstrap';
import {
  AmbientLight,
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  Color,
  DirectionalLight,
  DoubleSide,
  Mesh,
  MeshLambertMaterial,
  PerspectiveCamera,
  Scene,
  SRGBColorSpace,
  WebGLRenderer,
} from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { mercatorV } from '../model/mapTexture.js';
import {
  fullGrid,
  type Mesh as ModelMesh,
  perimeterRing,
} from '../model/stl.js';

/** The coarse grid of the area, smooth: for framing and judging the relief. */
export type AreaView = {
  kind: 'area';
  heights: Float32Array;
  cols: number;
  rows: number;
  mmPerM: number;
  exaggeration: number;
  baseMm: number;
  /** A newer area is loading; this grid is the previous one. */
  stale?: boolean;
};

/** The built model, triangle for triangle: what the file holds. */
export type ModelView = {
  kind: 'model';
  mesh: ModelMesh;
  /** `#rrggbb` per palette index of a coloured mesh, which then shows no texture. */
  palette?: string[];
};

type Props = {
  view: AreaView | ModelView;
  bbox: Bbox;
  widthMm: number;
  depthMm: number;
  texture: HTMLCanvasElement | null;
  /** The texture's next version is being made. */
  texturePending?: boolean;
  /** Shown while the GPU has dropped the view. */
  unavailable: ReactNode;
};

const HEIGHT_PX = 300;

type Stage = {
  renderer: WebGLRenderer;
  scene: Scene;
  camera: PerspectiveCamera;
  controls: OrbitControls;
  render: () => void;
};

type Dims = { bbox: Bbox; widthMm: number; depthMm: number };

/** Texture coordinates of a point in model millimetres, x east, y north. */
function uv(d: Dims, x: number, y: number): [number, number] {
  const [, south, , north] = d.bbox;

  return [
    x / d.widthMm,
    mercatorV(d.bbox, south + (y / d.depthMm) * (north - south)),
  ];
}

/** One geometry; group 0 the top surface, group 1 walls and bottom. */
function modelGeometry(view: ModelView, d: Dims): BufferGeometry {
  const { positions, index, topVertices, topTriangles } = view.mesh;

  const uvs = new Float32Array((positions.length / 3) * 2);

  for (let v = 0; v < topVertices; v++) {
    uvs.set(uv(d, positions[v * 3]!, positions[v * 3 + 1]!), v * 2);
  }

  const geometry = new BufferGeometry();

  // The worker's arrays as they are, never written: they become the STL on
  // download. No normals: flat shading takes each facet's from the shader.
  geometry.setAttribute('position', new BufferAttribute(positions, 3));

  geometry.setAttribute('uv', new BufferAttribute(uvs, 2));

  geometry.setIndex(new BufferAttribute(index, 1));

  const { colours } = view.mesh;

  if (colours && view.palette) {
    // A group per run of one colour, its material the palette index.
    let start = 0;

    for (let t = 1; t <= colours.length; t++) {
      if (t === colours.length || colours[t] !== colours[start]) {
        geometry.addGroup(start * 3, (t - start) * 3, colours[start]!);

        start = t;
      }
    }
  } else {
    geometry.addGroup(0, topTriangles * 3, 0);

    geometry.addGroup(topTriangles * 3, index.length - topTriangles * 3, 1);
  }

  return geometry;
}

/**
 * The model's x east, y north, z up into three's y up and z south, centred:
 * a rotation, so the winding stays outward.
 */
function modelMesh(
  geometry: BufferGeometry,
  materials: MeshLambertMaterial[],
  d: Dims,
): Mesh {
  const mesh = new Mesh(geometry, materials);

  mesh.rotation.x = -Math.PI / 2;

  mesh.position.set(-d.widthMm / 2, 0, d.depthMm / 2);

  return mesh;
}

/** What a grid's geometry keeps across exaggeration and base: all but heights. */
type GridShape = {
  min: number;
  index: Uint32Array;
  ring: number[];
  uvs: Float32Array;
};

// By heights array, one per fetched grid, whose area is fixed with it.
const gridShapes = new WeakMap<Float32Array, GridShape>();

function gridShape(view: AreaView, bbox: Bbox): GridShape {
  const { heights, cols, rows } = view;

  const cached = gridShapes.get(heights);

  if (cached) {
    return cached;
  }

  let min = Number.POSITIVE_INFINITY;

  for (const h of heights) {
    if (h < min) {
      min = h;
    }
  }

  const { coords, triangles } = fullGrid(cols, rows);

  // Texture coordinates scale with the model, so any size gives the same.
  const d = { bbox, widthMm: 1, depthMm: 1 };

  const uvs = new Float32Array(cols * rows * 2);

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      uvs.set(
        uv(d, col / (cols - 1), (rows - 1 - row) / (rows - 1)),
        (row * cols + col) * 2,
      );
    }
  }

  const shape = {
    min,
    index: Uint32Array.from(triangles),
    ring: perimeterRing(coords, cols, rows),
    uvs,
  };

  gridShapes.set(heights, shape);

  return shape;
}

/** The area grid's surface and its walls down to the bed, as the STL builds them. */
function areaGeometry(view: AreaView, d: Dims): BufferGeometry[] {
  const { heights, cols, rows } = view;

  const { min, index, ring, uvs } = gridShape(view, d.bbox);

  if (!Number.isFinite(min)) {
    return [];
  }

  const zScale = view.mmPerM * view.exaggeration;

  const dx = d.widthMm / (cols - 1);

  const dy = d.depthMm / (rows - 1);

  const positions = new Float32Array(cols * rows * 3);

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const i = row * cols + col;

      const h = heights[i]!;

      positions[i * 3] = col * dx - d.widthMm / 2;
      positions[i * 3 + 1] =
        view.baseMm + ((Number.isNaN(h) ? min : h) - min) * zScale;
      positions[i * 3 + 2] = row * dy - d.depthMm / 2;
    }
  }

  const top = new BufferGeometry();

  top.setAttribute('position', new BufferAttribute(positions, 3));

  top.setAttribute('uv', new BufferAttribute(uvs, 2));

  top.setIndex(new BufferAttribute(index, 1));

  top.computeVertexNormals();

  const wall = new Float32Array(ring.length * 18);

  ring.forEach((p, k) => {
    const q = ring[(k + 1) % ring.length]!;

    const [px, py, pz] = [
      positions[p * 3]!,
      positions[p * 3 + 1]!,
      positions[p * 3 + 2]!,
    ];
    const [qx, qy, qz] = [
      positions[q * 3]!,
      positions[q * 3 + 1]!,
      positions[q * 3 + 2]!,
    ];

    wall.set(
      [px, 0, pz, qx, 0, qz, qx, qy, qz, px, 0, pz, qx, qy, qz, px, py, pz],
      k * 18,
    );
  });

  const sides = new BufferGeometry();

  sides.setAttribute('position', new BufferAttribute(wall, 3));

  sides.computeVertexNormals();

  return [top, sides];
}

/**
 * The model to turn and zoom, the map draped on top, in model millimetres, y
 * up, north away from the starting view: either the area at preview
 * resolution, or the built STL as it is.
 */
export default function TerrainPreview({
  view,
  bbox,
  widthMm,
  depthMm,
  texture,
  texturePending,
  unavailable,
}: Props): ReactElement {
  const containerRef = useRef<HTMLDivElement>(null);

  const stageRef = useRef<Stage | null>(null);

  const meshesRef = useRef<Mesh[]>([]);

  const surfaceRef = useRef<MeshLambertMaterial | null>(null);

  const wallRef = useRef<MeshLambertMaterial | null>(null);

  // A coloured model's materials, one per palette colour.
  const paletteRef = useRef<MeshLambertMaterial[]>([]);

  // Lost to a model too large for the GPU, or for a while to a backgrounded
  // tab; three restores it when the browser allows, and then it draws again.
  const [contextLost, setContextLost] = useState(false);

  useEffect(() => {
    const container = containerRef.current!;

    const renderer = new WebGLRenderer({ antialias: true });

    const onContextLost = () => setContextLost(true);

    const onContextRestored = () => {
      setContextLost(false);

      stageRef.current?.render();
    };

    renderer.domElement.addEventListener('webglcontextlost', onContextLost);

    renderer.domElement.addEventListener(
      'webglcontextrestored',
      onContextRestored,
    );

    renderer.setPixelRatio(window.devicePixelRatio);

    renderer.outputColorSpace = SRGBColorSpace;

    container.appendChild(renderer.domElement);

    const scene = new Scene();

    scene.background = new Color('#e9ecef');

    scene.add(new AmbientLight('#ffffff', 1.2));

    // From the north-west, as hillshading is lit.
    const sun = new DirectionalLight('#ffffff', 2);

    sun.position.set(-1, 1.5, -1);

    scene.add(sun);

    const camera = new PerspectiveCamera(35, 1, 0.1, 100_000);

    const controls = new OrbitControls(camera, renderer.domElement);

    // Stops above the horizon: underneath there is only the bottom to see.
    controls.maxPolarAngle = Math.PI * 0.48;

    const render = () => renderer.render(scene, camera);

    controls.addEventListener('change', render);

    const resize = () => {
      const width = container.clientWidth;

      renderer.setSize(width, HEIGHT_PX);

      camera.aspect = width / HEIGHT_PX;

      camera.updateProjectionMatrix();

      render();
    };

    const observer = new ResizeObserver(resize);

    observer.observe(container);

    surfaceRef.current = new MeshLambertMaterial();

    wallRef.current = new MeshLambertMaterial({
      color: '#adb5bd',
      side: DoubleSide,
    });

    stageRef.current = { renderer, scene, camera, controls, render };

    resize();

    return () => {
      observer.disconnect();

      controls.dispose();

      for (const mesh of meshesRef.current) {
        mesh.geometry.dispose();
      }

      surfaceRef.current?.map?.dispose();

      surfaceRef.current?.dispose();

      wallRef.current?.dispose();

      for (const material of paletteRef.current) {
        material.dispose();
      }

      renderer.dispose();

      // Lost on purpose below.
      renderer.domElement.removeEventListener(
        'webglcontextlost',
        onContextLost,
      );

      renderer.domElement.removeEventListener(
        'webglcontextrestored',
        onContextRestored,
      );

      // Released at once rather than at GC; browsers allow ~16 live contexts.
      renderer.forceContextLoss();

      renderer.domElement.remove();

      stageRef.current = null;
    };
  }, []);

  // Framed anew for a new area or size, not for exaggeration nor for the
  // switch between the area and the model, which hold the same area.
  const frameKey = `${bbox.join()}|${widthMm.toFixed(1)}|${depthMm.toFixed(1)}`;

  // biome-ignore lint/correctness/useExhaustiveDependencies: `frameKey` stands for them
  useEffect(() => {
    const stage = stageRef.current;

    if (!stage) {
      return;
    }

    const size = Math.max(widthMm, depthMm);

    stage.camera.position.set(0, size * 0.65, size * 0.95);

    stage.controls.target.set(0, 0, 0);

    stage.controls.update();

    stage.render();
  }, [frameKey]);

  useEffect(() => {
    const stage = stageRef.current;

    const surface = surfaceRef.current;

    const wall = wallRef.current;

    if (!stage || !surface || !wall) {
      return;
    }

    for (const mesh of meshesRef.current) {
      stage.scene.remove(mesh);

      mesh.geometry.dispose();
    }

    for (const material of paletteRef.current) {
      material.dispose();
    }

    const dims = { bbox, widthMm, depthMm };

    const palette =
      view.kind === 'model' && view.mesh.colours && view.palette
        ? view.palette.map(
            // Double-sided, as the walls they colour are without a palette.
            (color) =>
              new MeshLambertMaterial({
                color,
                flatShading: true,
                side: DoubleSide,
              }),
          )
        : [];

    paletteRef.current = palette;

    // The built model shows its facets, as a slicer does, and has no normals
    // but those; the area view is too coarse for facets to say anything.
    for (const material of [surface, wall]) {
      material.flatShading = view.kind === 'model';

      material.needsUpdate = true;
    }

    const meshes =
      view.kind === 'model'
        ? [
            modelMesh(
              modelGeometry(view, dims),
              palette.length ? palette : [surface, wall],
              dims,
            ),
          ]
        : areaGeometry(view, dims).map(
            (geometry, i) => new Mesh(geometry, i === 0 ? surface : wall),
          );

    for (const mesh of meshes) {
      stage.scene.add(mesh);
    }

    meshesRef.current = meshes;

    stage.render();
  }, [view, bbox, widthMm, depthMm]);

  useEffect(() => {
    const stage = stageRef.current;

    const material = surfaceRef.current;

    if (!stage || !material) {
      return;
    }

    material.map?.dispose();

    if (texture) {
      const map = new CanvasTexture(texture);

      map.colorSpace = SRGBColorSpace;

      map.anisotropy = stage.renderer.capabilities.getMaxAnisotropy();

      material.map = map;

      material.color.set('#ffffff');
    } else {
      material.map = null;

      material.color.set('#ced4da');
    }

    material.needsUpdate = true;

    stage.render();
  }, [texture]);

  return (
    <div className="position-relative mb-3">
      <div
        ref={containerRef}
        className="rounded overflow-hidden"
        style={{ height: HEIGHT_PX, touchAction: 'none' }}
      />

      {view.kind === 'area' && view.stale && (
        <div className="position-absolute top-0 start-0 m-2">
          <Spinner size="sm" />
        </div>
      )}

      {texturePending && (
        <div className="position-absolute bottom-0 end-0 m-2">
          <Spinner size="sm" />
        </div>
      )}

      {contextLost && (
        <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center small text-body-secondary">
          {unavailable}
        </div>
      )}
    </div>
  );
}
