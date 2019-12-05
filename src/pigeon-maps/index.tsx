import React, { CSSProperties } from 'react';

import parentPosition from './utils/parent-position';
import parentHasClass from './utils/parent-has-class';
import debounce from './utils/debounce';
import { Optional } from 'utility-types';

const ANIMATION_TIME = 300;
const DIAGONAL_THROW_TIME = 1500;
const SCROLL_PIXELS_FOR_ZOOM_LEVEL = 150;
const MIN_DRAG_FOR_THROW = 40;
const CLICK_TOLERANCE = 2;
const DOUBLE_CLICK_DELAY = 300;
const DEBOUNCE_DELAY = 60;
const PINCH_RELEASE_THROW_DELAY = 300;
const WARNING_DISPLAY_TIMEOUT = 300;

function wikimedia(x: number, y: number, z: number, dpr?: number) {
  const retina =
    typeof dpr !== 'undefined'
      ? dpr >= 2
      : typeof window !== 'undefined' && window.devicePixelRatio >= 2;

  return `https://maps.wikimedia.org/osm-intl/${z}/${x}/${y}${
    retina ? '@2x' : ''
  }.png`;
}

// https://wiki.openstreetmap.org/wiki/Slippy_map_tilenames
const lng2tile = (lon: number, zoom: number) =>
  ((lon + 180) / 360) * Math.pow(2, zoom);

const lat2tile = (lat: number, zoom: number) =>
  ((1 -
    Math.log(
      Math.tan((lat * Math.PI) / 180) + 1 / Math.cos((lat * Math.PI) / 180),
    ) /
      Math.PI) /
    2) *
  Math.pow(2, zoom);

function tile2lng(x: number, z: number) {
  return (x / Math.pow(2, z)) * 360 - 180;
}

function tile2lat(y: number, z: number) {
  const n = Math.PI - (2 * Math.PI * y) / Math.pow(2, z);
  return (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));
}

function getMousePixel(
  dom: HTMLDivElement,
  event: Touch | MouseEvent,
): [number, number] {
  const parent = parentPosition(dom);
  return [event.clientX - parent.x, event.clientY - parent.y];
}

function easeOutQuad(t) {
  return t * (2 - t);
}

// minLat, maxLat, minLng, maxLng
const absoluteMinMax: [number, number, number, number] = [
  tile2lat(Math.pow(2, 10), 10),
  tile2lat(0, 10),
  tile2lng(0, 10),
  tile2lng(Math.pow(2, 10), 10),
];

const hasWindow = typeof window !== 'undefined';

const performanceNow =
  hasWindow && window.performance && window.performance.now
    ? () => window.performance.now()
    : (() => {
        const timeStart = new Date().getTime();
        return () => new Date().getTime() - timeStart;
      })();

const requestAnimationFrame = hasWindow
  ? window.requestAnimationFrame ||
    ((callback: (x: number) => void) =>
      window.setTimeout(() => {
        callback(Date.now());
      }))
  : (callback: (x: number) => void) => {
      callback(Date.now());
      return 0;
    };

const cancelAnimationFrame = hasWindow
  ? window.cancelAnimationFrame || window.clearTimeout
  : () => {
      // nothing
    };

function srcSet(
  dprs: number[],
  url: (x: number, y: number, z: number, dpr: number) => string,
  x: number,
  y: number,
  z: number,
) {
  if (!dprs || dprs.length === 0) {
    return '';
  }
  return dprs
    .map(dpr => url(x, y, z, dpr) + (dpr === 1 ? '' : ` ${dpr}x`))
    .join(', ');
}

type Tile = {
  key: string;
  url: string;
  srcSet: string;
  left: number;
  top: number;
  width: number;
  height: number;
  active: boolean;
  transform?: string;
};

type Props = {
  defaultZoom?: number;
  zoom?: number;
  defaultCenter?: [number, number];
  center?: [number, number];

  width?: number;
  defaultWidth?: number;

  height?: number;
  defaultHeight?: number;

  provider?: (x: number, y: number, z: number) => string;
  dprs: number[];
  children?: React.ReactElement[];

  animate: boolean;
  animateMaxScreens: number;

  minZoom: number;
  maxZoom: number;

  metaWheelZoom: boolean;
  metaWheelZoomWarning: string;
  twoFingerDrag: boolean;
  twoFingerDragWarning: string;
  warningZIndex: number;

  attribution?: any;
  attributionPrefix?: any;

  zoomSnap: boolean;
  mouseEvents: boolean;
  touchEvents: boolean;

  boxClassname?: string;

  onClick?: ({
    event,
    latLng,
    pixel,
  }: {
    event: MouseEvent;
    latLng: [number, number];
    pixel: [number, number];
  }) => void;

  onBoundsChanged?: ({
    center,
    zoom,
    bounds,
    initial,
  }: {
    center: [number, number];
    zoom: number;
    bounds: any;
    initial: boolean;
  }) => void;

  onAnimationStart?: () => void;

  onAnimationStop?: () => void;

  // will be set to "edge" from v0.12 onward, defaulted to "center" before
  limitBounds: 'center' | 'edge';
};

type State = {
  zoom: number;
  center: [number, number];
  width?: number;
  height?: number;
  zoomDelta: number;
  pixelDelta: [number, number] | null;
  oldTiles: {
    roundedZoom: number;
    tileMinX: number;
    tileMinY: number;
    tileMaxX: number;
    tileMaxY: number;
  }[];
  showWarning: boolean;
  warningType: string | null;
};

export default class Map extends React.Component<Props, State> {
  private mousePosition: [number, number] | null = null;
  private dragStart: [number, number] | null = null;
  private mouseDown = false;
  private moveEvents: { timestamp: number; coords: [number, number] }[] = [];
  private lastClick?: number;
  private lastTap?: number;
  private touchStartPixel?: [[number, number], [number, number]?];

  private isAnimating = false;
  private animationStart?: number;
  private animationEnd?: number;
  private _centerTarget: [number, number] | null = null;
  private _zoomTarget: number | null = null;

  // When users are using uncontrolled components we have to keep this
  // so we can know if we should call onBoundsChanged
  private lastZoom: number;
  private lastCenter: [number, number];
  private boundsSynced = false;
  private minMaxCache:
    | [number, number, number, [number, number, number, number]]
    | null = null;

  private warningClearTimeout?: number;
  private lastWheel?: number;
  private containerRef?: HTMLDivElement;
  private loadTracker?: { [key: string]: boolean };
  private touchStartMidPoint?: [number, number];
  private animFrame?: number;
  private zoomStart?: number;
  private centerStart?: [number, number];
  private _zoomAround: [number, number] | null = null;
  private touchStartDistance?: number;
  private secondTouchEnd: number | null = null;

  static defaultProps = {
    animate: true,
    metaWheelZoom: false,
    metaWheelZoomWarning: 'Use META+wheel to zoom!',
    twoFingerDrag: false,
    twoFingerDragWarning: 'Use two fingers to move the map',
    zoomSnap: true,
    mouseEvents: true,
    touchEvents: true,
    warningZIndex: 100,
    animateMaxScreens: 5,
    minZoom: 1,
    maxZoom: 18,
    limitBounds: 'center',
    dprs: [],
  };

  constructor(props: Props) {
    super(props);

    this.lastZoom = props.defaultZoom ?? props.zoom ?? 8;
    this.lastCenter = props.defaultCenter ?? props.center ?? [0, 0];

    this.syncToProps = debounce(this.syncToProps, DEBOUNCE_DELAY);

    this.state = {
      zoom: this.lastZoom,
      center: this.lastCenter,
      width: props.width || props.defaultWidth,
      height: props.height || props.defaultHeight,
      zoomDelta: 0,
      pixelDelta: null,
      oldTiles: [],
      showWarning: false,
      warningType: null,
    };
  }

  componentDidMount() {
    this.props.mouseEvents && this.bindMouseEvents();
    this.props.touchEvents && this.bindTouchEvents();

    if (!this.props.width || !this.props.height) {
      // A height:100% container div often results in height=0 being returned on mount.
      // So ask again once everything is painted.
      if (!this.updateWidthHeight()) {
        requestAnimationFrame(this.updateWidthHeight);
      }
      this.bindResizeEvent();
      this.bindWheelEvent();
    }

    this.syncToProps();
  }

  componentWillUnmount() {
    this.props.mouseEvents && this.unbindMouseEvents();
    this.props.touchEvents && this.unbindTouchEvents();

    if (!this.props.width || !this.props.height) {
      this.unbindResizeEvent();
      this.unbindWheelEvent();
    }
  }

  updateWidthHeight = () => {
    if (this.containerRef) {
      const rect = this.containerRef.getBoundingClientRect();

      if (rect && rect.width > 0 && rect.height > 0) {
        this.setState({
          width: rect.width,
          height: rect.height,
        });
        return true;
      }
    }
    return false;
  };

  bindMouseEvents = () => {
    window.addEventListener('mousedown', this.handleMouseDown);
    window.addEventListener('mouseup', this.handleMouseUp);
    window.addEventListener('mousemove', this.handleMouseMove);
  };

  bindTouchEvents = () => {
    window.addEventListener('touchstart', this.handleTouchStart, {
      passive: false,
    });
    window.addEventListener('touchmove', this.handleTouchMove, {
      passive: false,
    });
    window.addEventListener('touchend', this.handleTouchEnd, {
      passive: false,
    });
  };

  unbindMouseEvents = () => {
    window.removeEventListener('mousedown', this.handleMouseDown);
    window.removeEventListener('mouseup', this.handleMouseUp);
    window.removeEventListener('mousemove', this.handleMouseMove);
  };

  unbindTouchEvents = () => {
    window.removeEventListener('touchstart', this.handleTouchStart);
    window.removeEventListener('touchmove', this.handleTouchMove);
    window.removeEventListener('touchend', this.handleTouchEnd);
  };

  bindResizeEvent = () => {
    window.addEventListener('resize', this.updateWidthHeight);
  };

  unbindResizeEvent = () => {
    window.removeEventListener('resize', this.updateWidthHeight);
  };

  bindWheelEvent = () => {
    if (this.containerRef) {
      this.containerRef.addEventListener('wheel', this.handleWheel, {
        passive: false,
      });
    }
  };

  unbindWheelEvent = () => {
    if (this.containerRef) {
      this.containerRef.removeEventListener('wheel', this.handleWheel);
    }
  };

  componentDidUpdate(prevProps) {
    if (this.props.mouseEvents !== prevProps.mouseEvents) {
      this.props.mouseEvents
        ? this.bindMouseEvents()
        : this.unbindMouseEvents();
    }

    if (this.props.touchEvents !== prevProps.touchEvents) {
      this.props.touchEvents
        ? this.bindTouchEvents()
        : this.unbindTouchEvents();
    }

    if (this.props.width && this.props.width !== prevProps.width) {
      this.setState({ width: this.props.width });
    }

    if (this.props.height && this.props.height !== prevProps.height) {
      this.setState({ height: this.props.height });
    }

    if (!this.props.center && !this.props.zoom) {
      // if the user isn't controlling neither zoom nor center we don't have to update.
      return;
    }
    if (
      (!this.props.center ||
        (this.props.center[0] === prevProps.center[0] &&
          this.props.center[1] === prevProps.center[1])) &&
      this.props.zoom === prevProps.zoom
    ) {
      // if the user is controlling either zoom or center but nothing changed
      // we don't have to update aswell
      return;
    }

    const currentCenter = this.isAnimating
      ? this._centerTarget ?? [0, 0]
      : this.state.center;

    const currentZoom = this.isAnimating
      ? this._zoomTarget ?? 8
      : this.state.zoom;

    const nextCenter = this.props.center ?? currentCenter ?? [0, 0]; // prevent the rare null errors
    const nextZoom = this.props.zoom ?? currentZoom;

    if (
      Math.abs(nextZoom - currentZoom) > 0.001 ||
      Math.abs(nextCenter[0] - currentCenter[0]) > 0.0001 ||
      Math.abs(nextCenter[1] - currentCenter[1]) > 0.0001
    ) {
      this.setCenterZoomTarget(nextCenter, nextZoom, true);
    }
  }

  setCenterZoomTarget = (
    center: [number, number] | null,
    zoom: number,
    fromProps = false,
    zoomAround: [number, number] | null = null,
    animationDuration = ANIMATION_TIME,
  ) => {
    if (
      this.props.animate &&
      (!fromProps ||
        this.distanceInScreens(
          center ?? [0, 0],
          zoom,
          this.state.center,
          this.state.zoom,
        ) <= this.props.animateMaxScreens)
    ) {
      if (this.isAnimating) {
        if (this.animFrame) {
          cancelAnimationFrame(this.animFrame);
        }
        const { centerStep, zoomStep } = this.animationStep(performanceNow());
        this.centerStart = centerStep;
        this.zoomStart = zoomStep;
      } else {
        this.isAnimating = true;
        this.centerStart = this.limitCenterAtZoom(
          [this.lastCenter[0], this.lastCenter[1]],
          this.lastZoom,
        );
        this.zoomStart = this.lastZoom;
        this.onAnimationStart();
      }

      this.animationStart = performanceNow();
      this.animationEnd = this.animationStart + animationDuration;

      if (zoomAround) {
        this._zoomAround = zoomAround;
        this._centerTarget = this.calculateZoomCenter(
          this.lastCenter,
          zoomAround,
          this.lastZoom,
          zoom,
        );
      } else {
        this._zoomAround = null;
        this._centerTarget = center;
      }

      this._zoomTarget = zoom;

      this.animFrame = requestAnimationFrame(this.animate);
    } else {
      this.stopAnimating();

      if (zoomAround) {
        const center = this.calculateZoomCenter(
          this.lastCenter,
          zoomAround,
          this.lastZoom,
          zoom,
        );
        this.setCenterZoom(center, zoom, fromProps);
      } else {
        this.setCenterZoom(center ?? [0, 0], zoom, fromProps);
      }
    }
  };

  distanceInScreens = (
    centerTarget: [number, number],
    zoomTarget: number,
    center: [number, number],
    zoom: number,
  ) => {
    const { width, height } = this.state;

    if (width === undefined || height === undefined) {
      throw new Error('width or height is undefined');
    }

    // distance in pixels at the current zoom level
    const l1 = this.latLngToPixel(center, center, zoom);
    const l2 = this.latLngToPixel(centerTarget, center, zoom);

    // distance in pixels at the target zoom level (could be the same)
    const z1 = this.latLngToPixel(center, center, zoomTarget);
    const z2 = this.latLngToPixel(centerTarget, center, zoomTarget);

    // take the average between the two and divide by width or height to get the distance multiplier in screens
    const w = (Math.abs(l1[0] - l2[0]) + Math.abs(z1[0] - z2[0])) / 2 / width;
    const h = (Math.abs(l1[1] - l2[1]) + Math.abs(z1[1] - z2[1])) / 2 / height;

    // return the distance
    return Math.sqrt(w * w + h * h);
  };

  animationStep = (
    timestamp: number,
  ): { centerStep: [number, number]; zoomStep: number } => {
    if (
      this.animationEnd === undefined ||
      this.animationStart === undefined ||
      this._zoomTarget === null ||
      this.zoomStart === undefined
    ) {
      throw new Error("can't animate");
    }

    const length = this.animationEnd - this.animationStart;
    const progress = Math.max(timestamp - this.animationStart, 0);
    const percentage = easeOutQuad(progress / length);

    const zoomDiff = (this._zoomTarget - this.zoomStart) * percentage;
    const zoomStep = this.zoomStart + zoomDiff;

    if (this._zoomAround) {
      const centerStep = this.calculateZoomCenter(
        this.centerStart ?? [0, 0],
        this._zoomAround,
        this.zoomStart,
        zoomStep,
      );

      return { centerStep, zoomStep };
    } else if (this.centerStart !== undefined && this._centerTarget !== null) {
      const centerStep: [number, number] = [
        this.centerStart[0] +
          (this._centerTarget[0] - this.centerStart[0]) * percentage,
        this.centerStart[1] +
          (this._centerTarget[1] - this.centerStart[1]) * percentage,
      ];

      return { centerStep, zoomStep };
    } else {
      throw Error();
    }
  };

  animate = (timestamp: number) => {
    if (timestamp >= (this.animationEnd ?? Infinity)) {
      this.isAnimating = false;
      this.setCenterZoom(
        this._centerTarget ?? [0, 0],
        this._zoomTarget ?? 8,
        true,
      );
      this.onAnimationStop();
    } else {
      const { centerStep, zoomStep } = this.animationStep(timestamp);
      this.setCenterZoom(centerStep, zoomStep);
      this.animFrame = requestAnimationFrame(this.animate);
    }
  };

  stopAnimating = () => {
    if (this.isAnimating) {
      this.isAnimating = false;
      this.onAnimationStop();
      if (this.animFrame) {
        cancelAnimationFrame(this.animFrame);
      }
    }
  };

  limitCenterAtZoom = (
    center: [number, number],
    zoom: number,
  ): [number, number] => {
    // [minLat, maxLat, minLng, maxLng]
    const minMax = this.getBoundsMinMax(zoom || this.state.zoom);

    return [
      Math.max(
        Math.min(
          isNaN(center[0]) ? this.state.center[0] : center[0],
          minMax[1],
        ),
        minMax[0],
      ),
      Math.max(
        Math.min(
          isNaN(center[1]) ? this.state.center[1] : center[1],
          minMax[3],
        ),
        minMax[2],
      ),
    ];
  };

  onAnimationStart = () => {
    this.props.onAnimationStart && this.props.onAnimationStart();
  };

  onAnimationStop = () => {
    this.props.onAnimationStop && this.props.onAnimationStop();
  };

  // main logic when changing coordinates
  setCenterZoom = (
    center: [number, number],
    zoom: number,
    animationEnded = false,
  ) => {
    const limitedCenter = this.limitCenterAtZoom(center, zoom);

    const state: any = {};

    if (Math.round(this.state.zoom) !== Math.round(zoom)) {
      const tileValues = this.tileValues(this.state);
      const nextValues = this.tileValues({
        center: limitedCenter,
        zoom,
        width: this.state.width,
        height: this.state.height,
      });

      const oldTiles = this.state.oldTiles;

      state.oldTiles = oldTiles
        .filter(o => o.roundedZoom !== tileValues.roundedZoom)
        .concat(tileValues);

      this.loadTracker = {};

      for (let x = nextValues.tileMinX; x <= nextValues.tileMaxX; x++) {
        for (let y = nextValues.tileMinY; y <= nextValues.tileMaxY; y++) {
          const key = `${x}-${y}-${nextValues.roundedZoom}`;
          this.loadTracker[key] = false;
        }
      }
    }

    this.setState({ ...state, center: limitedCenter, zoom });

    const maybeZoom = this.props.zoom ? this.props.zoom : this.lastZoom;

    const maybeCenter = this.props.center ? this.props.center : this.lastCenter;

    if (
      animationEnded ||
      Math.abs(maybeZoom - zoom) > 0.001 ||
      Math.abs(maybeCenter[0] - limitedCenter[0]) > 0.00001 ||
      Math.abs(maybeCenter[1] - limitedCenter[1]) > 0.00001
    ) {
      this.lastZoom = zoom;
      this.lastCenter = [limitedCenter[0], limitedCenter[1]];
      this.syncToProps(limitedCenter, zoom);
    }
  };

  getBoundsMinMax = (zoom: number): [number, number, number, number] => {
    if (this.props.limitBounds === 'center') {
      return absoluteMinMax;
    }

    const { width, height } = this.state;

    if (width === undefined || height === undefined) {
      throw new Error('width or height is undefined');
    }

    if (
      this.minMaxCache &&
      this.minMaxCache[0] === zoom &&
      this.minMaxCache[1] === width &&
      this.minMaxCache[2] === height
    ) {
      return this.minMaxCache[3];
    }

    const pixelsAtZoom = Math.pow(2, zoom) * 256;

    const minLng = width > pixelsAtZoom ? 0 : tile2lng(width / 512, zoom); // x
    const minLat =
      height > pixelsAtZoom
        ? 0
        : tile2lat(Math.pow(2, zoom) - height / 512, zoom); // y

    const maxLng =
      width > pixelsAtZoom
        ? 0
        : tile2lng(Math.pow(2, zoom) - width / 512, zoom); // x
    const maxLat = height > pixelsAtZoom ? 0 : tile2lat(height / 512, zoom); // y

    const minMax: [number, number, number, number] = [
      minLat,
      maxLat,
      minLng,
      maxLng,
    ];

    this.minMaxCache = [zoom, width, height, minMax];

    return minMax;
  };

  imageLoaded = (key: string) => {
    if (this.loadTracker && key in this.loadTracker) {
      const lt = this.loadTracker;
      lt[key] = true;

      const unloadedCount = Object.keys(lt).filter(k => !lt[k]).length;

      if (unloadedCount === 0) {
        this.setState({ oldTiles: [] });
      }
    }
  };

  coordsInside(pixel: [number, number]) {
    const { width, height } = this.state;

    if (width === undefined || height === undefined) {
      throw new Error('width or height is undefined');
    }

    if (
      pixel[0] < 0 ||
      pixel[1] < 0 ||
      pixel[0] >= width ||
      pixel[1] >= height
    ) {
      return false;
    }

    const parent = this.containerRef;

    if (!parent) {
      throw new Error('container is undefined');
    }

    const pos = parentPosition(parent);

    const element = document.elementFromPoint(
      pixel[0] + pos.x,
      pixel[1] + pos.y,
    );

    return parent === element || (parent && parent.contains(element));
  }

  handleTouchStart = (event: TouchEvent) => {
    if (
      !this.containerRef ||
      (event.target instanceof Element &&
        parentHasClass(event.target, 'pigeon-drag-block'))
    ) {
      // nothing
    } else if (event.touches.length === 1) {
      const touch = event.touches[0];

      const pixel = getMousePixel(this.containerRef, touch);

      if (this.coordsInside(pixel)) {
        this.touchStartPixel = [pixel];

        if (!this.props.twoFingerDrag) {
          this.stopAnimating();

          if (
            this.lastTap &&
            performanceNow() - this.lastTap < DOUBLE_CLICK_DELAY
          ) {
            event.preventDefault();

            const latLngNow = this.pixelToLatLng(this.touchStartPixel[0]);

            this.setCenterZoomTarget(
              null,
              Math.max(
                this.props.minZoom,
                Math.min(this.state.zoom + 1, this.props.maxZoom),
              ),
              false,
              latLngNow,
            );
          } else {
            this.lastTap = performanceNow();
            this.trackMoveEvents(pixel);
          }
        }
      }
      // added second finger and first one was in the area
    } else if (event.touches.length === 2 && this.touchStartPixel) {
      event.preventDefault();

      this.stopTrackingMoveEvents();

      if (this.state.pixelDelta || this.state.zoomDelta) {
        this.sendDeltaChange();
      }

      const t1 = getMousePixel(this.containerRef, event.touches[0]);

      const t2 = getMousePixel(this.containerRef, event.touches[1]);

      this.touchStartPixel = [t1, t2];

      this.touchStartMidPoint = [(t1[0] + t2[0]) / 2, (t1[1] + t2[1]) / 2];

      this.touchStartDistance = Math.sqrt(
        Math.pow(t1[0] - t2[0], 2) + Math.pow(t1[1] - t2[1], 2),
      );
    }
  };

  handleTouchMove = (event: TouchEvent) => {
    if (!this.containerRef) {
      this.touchStartPixel = undefined;
      return;
    }
    if (event.touches.length === 1 && this.touchStartPixel) {
      const touch = event.touches[0];

      const pixel = getMousePixel(this.containerRef, touch);

      if (this.props.twoFingerDrag) {
        if (this.coordsInside(pixel)) {
          this.showWarning('fingers');
        }
      } else {
        event.preventDefault();

        this.trackMoveEvents(pixel);

        this.setState({
          pixelDelta: [
            pixel[0] - this.touchStartPixel[0][0],
            pixel[1] - this.touchStartPixel[0][1],
          ],
        });
      }
    } else if (event.touches.length === 2 && this.touchStartPixel) {
      const { width, height, zoom } = this.state;

      if (width === undefined || height === undefined) {
        throw new Error('width or height is undefined');
      }

      event.preventDefault();

      const t1 = getMousePixel(this.containerRef, event.touches[0]);

      const t2 = getMousePixel(this.containerRef, event.touches[1]);

      const midPoint = [(t1[0] + t2[0]) / 2, (t1[1] + t2[1]) / 2];

      if (this.touchStartMidPoint === undefined) {
        throw new Error('_touchStartMidPoint is undefined');
      }

      const midPointDiff = [
        midPoint[0] - this.touchStartMidPoint[0],
        midPoint[1] - this.touchStartMidPoint[1],
      ];

      const distance = Math.sqrt(
        Math.pow(t1[0] - t2[0], 2) + Math.pow(t1[1] - t2[1], 2),
      );

      if (this.touchStartDistance === undefined) {
        throw new Error('_touchStartDistance is undefined');
      }

      const zoomDelta =
        Math.max(
          this.props.minZoom,
          Math.min(
            this.props.maxZoom,
            zoom + Math.log2(distance / this.touchStartDistance),
          ),
        ) - zoom;

      const scale = Math.pow(2, zoomDelta);

      const centerDiffDiff = [
        (width / 2 - midPoint[0]) * (scale - 1),
        (height / 2 - midPoint[1]) * (scale - 1),
      ];

      this.setState({
        zoomDelta: zoomDelta,
        pixelDelta: [
          centerDiffDiff[0] + midPointDiff[0] * scale,
          centerDiffDiff[1] + midPointDiff[1] * scale,
        ],
      });
    }
  };

  handleTouchEnd = (event: TouchEvent) => {
    if (!this.containerRef) {
      this.touchStartPixel = undefined;
      return;
    }

    if (this.touchStartPixel) {
      const { zoomSnap, twoFingerDrag, minZoom, maxZoom } = this.props;

      const { zoomDelta } = this.state;

      const { center, zoom } = this.sendDeltaChange();

      if (event.touches.length === 0) {
        if (twoFingerDrag) {
          this.clearWarning();
        } else {
          // if the click started and ended at about
          // the same place we can view it as a click
          // and not prevent default behavior.
          const oldTouchPixel = this.touchStartPixel[0];

          const newTouchPixel = getMousePixel(
            this.containerRef,
            event.changedTouches[0],
          );

          if (
            Math.abs(oldTouchPixel[0] - newTouchPixel[0]) > CLICK_TOLERANCE ||
            Math.abs(oldTouchPixel[1] - newTouchPixel[1]) > CLICK_TOLERANCE
          ) {
            // don't throw immediately after releasing the second finger
            if (
              !this.secondTouchEnd ||
              performanceNow() - this.secondTouchEnd > PINCH_RELEASE_THROW_DELAY
            ) {
              event.preventDefault();

              this.throwAfterMoving(newTouchPixel, center, zoom);
            }
          }

          this.touchStartPixel = undefined;
          this.secondTouchEnd = null;
        }
      } else if (event.touches.length === 1) {
        event.preventDefault();

        const touch = getMousePixel(this.containerRef, event.touches[0]);

        this.secondTouchEnd = performanceNow();

        this.touchStartPixel = [touch];

        this.trackMoveEvents(touch);

        if (zoomSnap) {
          // if somehow we have no midpoint for the two finger touch, just take the center of the map
          const latLng = this.touchStartMidPoint
            ? this.pixelToLatLng(this.touchStartMidPoint)
            : this.state.center;

          let zoomTarget: number;

          // do not zoom up/down if we must drag with 2 fingers and didn't change the zoom level
          if (
            twoFingerDrag &&
            Math.round(this.state.zoom) ===
              Math.round(this.state.zoom + zoomDelta)
          ) {
            zoomTarget = Math.round(this.state.zoom);
          } else {
            zoomTarget =
              zoomDelta > 0
                ? Math.ceil(this.state.zoom)
                : Math.floor(this.state.zoom);
          }
          const zoom = Math.max(minZoom, Math.min(zoomTarget, maxZoom));

          this.setCenterZoomTarget(latLng, zoom, false, latLng);
        }
      }
    }
  };

  handleMouseDown = (event: MouseEvent) => {
    if (!this.containerRef) {
      return;
    }

    const pixel = getMousePixel(this.containerRef, event);

    if (
      event.button === 0 &&
      (!(event.target instanceof Element) ||
        !parentHasClass(event.target, 'pigeon-drag-block')) &&
      this.coordsInside(pixel)
    ) {
      this.stopAnimating();

      event.preventDefault();

      if (
        this.lastClick &&
        performanceNow() - this.lastClick < DOUBLE_CLICK_DELAY
      ) {
        const latLngNow = this.pixelToLatLng(this.mousePosition || pixel);

        this.setCenterZoomTarget(
          null,
          Math.max(
            this.props.minZoom,
            Math.min(this.state.zoom + 1, this.props.maxZoom),
          ),
          false,
          latLngNow,
        );
      } else {
        this.lastClick = performanceNow();

        this.mouseDown = true;

        this.dragStart = pixel;

        this.trackMoveEvents(pixel);
      }
    }
  };

  handleMouseMove = (event: MouseEvent) => {
    if (!this.containerRef) {
      return;
    }

    this.mousePosition = getMousePixel(this.containerRef, event);

    if (this.mouseDown && this.dragStart) {
      this.trackMoveEvents(this.mousePosition);

      this.setState({
        pixelDelta: [
          this.mousePosition[0] - this.dragStart[0],
          this.mousePosition[1] - this.dragStart[1],
        ],
      });
    }
  };

  handleMouseUp = (event: MouseEvent) => {
    if (!this.containerRef) {
      this.mouseDown = false;
      return;
    }

    const { pixelDelta } = this.state;

    if (this.mouseDown) {
      this.mouseDown = false;

      const pixel = getMousePixel(this.containerRef, event);

      if (
        this.props.onClick &&
        (!(event.target instanceof Element) ||
          !parentHasClass(event.target, 'pigeon-click-block')) &&
        (!pixelDelta ||
          Math.abs(pixelDelta[0]) + Math.abs(pixelDelta[1]) <= CLICK_TOLERANCE)
      ) {
        const latLng = this.pixelToLatLng(pixel);

        this.props.onClick({ event, latLng, pixel });

        this.setState({ pixelDelta: null });
      } else {
        const { center, zoom } = this.sendDeltaChange();

        this.throwAfterMoving(pixel, center, zoom);
      }
    }
  };

  // https://www.bennadel.com/blog/1856-using-jquery-s-animate-step-callback-function-to-create-custom-animations.htm
  stopTrackingMoveEvents = () => {
    this.moveEvents = [];
  };

  trackMoveEvents = (coords: [number, number]) => {
    const timestamp = performanceNow();

    if (
      this.moveEvents.length === 0 ||
      timestamp - this.moveEvents[this.moveEvents.length - 1].timestamp > 40
    ) {
      this.moveEvents.push({ timestamp, coords });

      if (this.moveEvents.length > 2) {
        this.moveEvents.shift();
      }
    }
  };

  throwAfterMoving = (
    coords: [number, number],
    center: [number, number],
    zoom: number,
  ) => {
    const { width, height } = this.state;

    if (width === undefined || height === undefined) {
      throw new Error('width or height is undefined');
    }

    const { animate } = this.props;

    const timestamp = performanceNow();

    const lastEvent = this.moveEvents.shift();

    if (lastEvent && animate) {
      const deltaMs = Math.max(timestamp - lastEvent.timestamp, 1);

      const delta = [
        ((coords[0] - lastEvent.coords[0]) / deltaMs) * 120,
        ((coords[1] - lastEvent.coords[1]) / deltaMs) * 120,
      ];

      const distance = Math.sqrt(delta[0] * delta[0] + delta[1] * delta[1]);

      if (distance > MIN_DRAG_FOR_THROW) {
        const diagonal = Math.sqrt(width * width + height * height);

        const throwTime = (DIAGONAL_THROW_TIME * distance) / diagonal;

        const lng = tile2lng(
          lng2tile(center[1], zoom) - delta[0] / 256.0,
          zoom,
        );

        const lat = tile2lat(
          lat2tile(center[0], zoom) - delta[1] / 256.0,
          zoom,
        );

        this.setCenterZoomTarget([lat, lng], zoom, false, null, throwTime);
      }
    }

    this.stopTrackingMoveEvents();
  };

  sendDeltaChange = () => {
    const { center, zoom, pixelDelta, zoomDelta } = this.state;

    let [lat, lng] = center;

    if (pixelDelta || zoomDelta !== 0) {
      lng = tile2lng(
        lng2tile(center[1], zoom + zoomDelta) -
          (pixelDelta ? pixelDelta[0] / 256.0 : 0),
        zoom + zoomDelta,
      );

      lat = tile2lat(
        lat2tile(center[0], zoom + zoomDelta) -
          (pixelDelta ? pixelDelta[1] / 256.0 : 0),
        zoom + zoomDelta,
      );

      this.setCenterZoom([lat, lng], zoom + zoomDelta);
    }

    this.setState({
      pixelDelta: null,
      zoomDelta: 0,
    });

    return {
      center: this.limitCenterAtZoom([lat, lng], zoom + zoomDelta),
      zoom: zoom + zoomDelta,
    };
  };

  getBounds = (center = this.state.center, zoom = this.zoomPlusDelta()) => {
    const { width, height } = this.state;

    if (width === undefined || height === undefined) {
      throw new Error('width or height is undefined');
    }

    return {
      ne: this.pixelToLatLng([width - 1, 0], center, zoom),
      sw: this.pixelToLatLng([0, height - 1], center, zoom),
    };
  };

  syncToProps = (center = this.state.center, zoom = this.state.zoom) => {
    const { onBoundsChanged } = this.props;

    if (onBoundsChanged) {
      const bounds = this.getBounds(center, zoom);

      onBoundsChanged({ center, zoom, bounds, initial: !this.boundsSynced });

      this.boundsSynced = true;
    }
  };

  handleWheel = (event: WheelEvent) => {
    const { mouseEvents, metaWheelZoom, zoomSnap, animate } = this.props;

    if (!mouseEvents) {
      return;
    }

    if (!metaWheelZoom || event.metaKey) {
      event.preventDefault();

      const addToZoom = -event.deltaY / SCROLL_PIXELS_FOR_ZOOM_LEVEL;

      if (!zoomSnap && this._zoomTarget) {
        const stillToAdd = this._zoomTarget - this.state.zoom;

        this.zoomAroundMouse(addToZoom + stillToAdd, event);
      } else {
        if (animate) {
          this.zoomAroundMouse(addToZoom, event);
        } else {
          if (
            !this.lastWheel ||
            performanceNow() - this.lastWheel > ANIMATION_TIME
          ) {
            this.lastWheel = performanceNow();

            this.zoomAroundMouse(addToZoom, event);
          }
        }
      }
    } else {
      this.showWarning('wheel');
    }
  };

  showWarning = (warningType: string) => {
    if (!this.state.showWarning || this.state.warningType !== warningType) {
      this.setState({ showWarning: true, warningType });
    }

    if (this.warningClearTimeout) {
      window.clearTimeout(this.warningClearTimeout);
    }

    this.warningClearTimeout = window.setTimeout(
      this.clearWarning,
      WARNING_DISPLAY_TIMEOUT,
    );
  };

  clearWarning = () => {
    if (this.state.showWarning) {
      this.setState({ showWarning: false });
    }
  };

  zoomAroundMouse = (zoomDiff: number, event: WheelEvent) => {
    if (!this.containerRef) {
      return;
    }

    const { zoom } = this.state;

    const { minZoom, maxZoom, zoomSnap } = this.props;

    this.mousePosition = getMousePixel(this.containerRef, event);

    if (
      !this.mousePosition ||
      (zoom === minZoom && zoomDiff < 0) ||
      (zoom === maxZoom && zoomDiff > 0)
    ) {
      return;
    }

    const latLngNow = this.pixelToLatLng(this.mousePosition);

    let zoomTarget = zoom + zoomDiff;

    if (zoomSnap) {
      zoomTarget =
        zoomDiff < 0 ? Math.floor(zoomTarget) : Math.ceil(zoomTarget);
    }

    zoomTarget = Math.max(minZoom, Math.min(zoomTarget, maxZoom));

    this.setCenterZoomTarget(null, zoomTarget, false, latLngNow);
  };

  // tools

  zoomPlusDelta = () => {
    return this.state.zoom + this.state.zoomDelta;
  };

  pixelToLatLng = (
    pixel: [number, number],
    center = this.state.center,
    zoom = this.zoomPlusDelta(),
  ): [number, number] => {
    const { width, height, pixelDelta } = this.state;

    if (width === undefined || height === undefined) {
      throw new Error('width or height is undefined');
    }

    const pointDiff = [
      (pixel[0] - width / 2 - (pixelDelta ? pixelDelta[0] : 0)) / 256.0,
      (pixel[1] - height / 2 - (pixelDelta ? pixelDelta[1] : 0)) / 256.0,
    ];

    const tileX = lng2tile(center[1], zoom) + pointDiff[0];

    const tileY = lat2tile(center[0], zoom) + pointDiff[1];

    return [
      Math.max(
        absoluteMinMax[0],
        Math.min(absoluteMinMax[1], tile2lat(tileY, zoom)),
      ),
      Math.max(
        absoluteMinMax[2],
        Math.min(absoluteMinMax[3], tile2lng(tileX, zoom)),
      ),
    ];
  };

  latLngToPixel = (
    latLng: [number, number],
    center = this.state.center,
    zoom = this.zoomPlusDelta(),
  ) => {
    const { width, height, pixelDelta } = this.state;

    if (width === undefined || height === undefined) {
      throw new Error('width or height is undefined');
    }

    const tileCenterX = lng2tile(center[1], zoom);

    const tileCenterY = lat2tile(center[0], zoom);

    const tileX = lng2tile(latLng[1], zoom);

    const tileY = lat2tile(latLng[0], zoom);

    return [
      (tileX - tileCenterX) * 256.0 +
        width / 2 +
        (pixelDelta ? pixelDelta[0] : 0),
      (tileY - tileCenterY) * 256.0 +
        height / 2 +
        (pixelDelta ? pixelDelta[1] : 0),
    ];
  };

  calculateZoomCenter = (
    center: [number, number],
    coords: [number, number],
    oldZoom: number,
    newZoom: number,
  ) => {
    const { width, height } = this.state;

    if (width === undefined || height === undefined) {
      throw new Error('width or height is undefined');
    }

    const pixelBefore = this.latLngToPixel(coords, center, oldZoom);

    const pixelAfter = this.latLngToPixel(coords, center, newZoom);

    const newCenter = this.pixelToLatLng(
      [
        width / 2 + pixelAfter[0] - pixelBefore[0],
        height / 2 + pixelAfter[1] - pixelBefore[1],
      ],
      center,
      newZoom,
    );

    return this.limitCenterAtZoom(newCenter, newZoom);
  };

  // ref

  setRef = (dom: HTMLDivElement) => {
    this.containerRef = dom;
  };

  // data to display the tiles

  tileValues(
    state: Optional<
      Pick<
        State,
        'center' | 'zoom' | 'pixelDelta' | 'zoomDelta' | 'width' | 'height'
      >,
      'pixelDelta' | 'zoomDelta'
    >,
  ) {
    const { center, zoom, pixelDelta, zoomDelta, width, height } = state;

    if (width === undefined || height === undefined) {
      throw new Error('width or height is undefined');
    }

    const roundedZoom = Math.round(zoom + (zoomDelta || 0));

    const zoomDiff = zoom + (zoomDelta || 0) - roundedZoom;

    const scale = Math.pow(2, zoomDiff);

    const scaleWidth = width / scale;

    const scaleHeight = height / scale;

    const tileCenterX =
      lng2tile(center[1], roundedZoom) -
      (pixelDelta ? pixelDelta[0] / 256.0 / scale : 0);

    const tileCenterY =
      lat2tile(center[0], roundedZoom) -
      (pixelDelta ? pixelDelta[1] / 256.0 / scale : 0);

    const halfWidth = scaleWidth / 2 / 256.0;

    const halfHeight = scaleHeight / 2 / 256.0;

    const tileMinX = Math.floor(tileCenterX - halfWidth);

    const tileMaxX = Math.floor(tileCenterX + halfWidth);

    const tileMinY = Math.floor(tileCenterY - halfHeight);

    const tileMaxY = Math.floor(tileCenterY + halfHeight);

    return {
      tileMinX,
      tileMaxX,
      tileMinY,
      tileMaxY,
      tileCenterX,
      tileCenterY,
      roundedZoom,
      zoomDelta: zoomDelta || 0,
      scaleWidth,
      scaleHeight,
      scale,
    };
  }

  // display the tiles

  renderTiles() {
    const { oldTiles } = this.state;
    const { dprs } = this.props;
    const mapUrl = this.props.provider || wikimedia;

    const {
      tileMinX,
      tileMaxX,
      tileMinY,
      tileMaxY,
      tileCenterX,
      tileCenterY,
      roundedZoom,
      scaleWidth,
      scaleHeight,
      scale,
    } = this.tileValues(this.state);

    const tiles: Tile[] = [];

    for (let i = 0; i < oldTiles.length; i++) {
      const old = oldTiles[i];

      const zoomDiff = old.roundedZoom - roundedZoom;

      if (Math.abs(zoomDiff) > 4 || zoomDiff === 0) {
        continue;
      }

      const pow = 1 / Math.pow(2, zoomDiff);

      const xDiff = -(tileMinX - old.tileMinX * pow) * 256;

      const yDiff = -(tileMinY - old.tileMinY * pow) * 256;

      const xMin = Math.max(old.tileMinX, 0);

      const yMin = Math.max(old.tileMinY, 0);

      const xMax = Math.min(old.tileMaxX, Math.pow(2, old.roundedZoom) - 1);

      const yMax = Math.min(old.tileMaxY, Math.pow(2, old.roundedZoom) - 1);

      for (let x = xMin; x <= xMax; x++) {
        for (let y = yMin; y <= yMax; y++) {
          tiles.push({
            key: `${x}-${y}-${old.roundedZoom}`,
            url: mapUrl(x, y, old.roundedZoom),
            srcSet: srcSet(dprs, mapUrl, x, y, old.roundedZoom),
            left: xDiff + (x - old.tileMinX) * 256 * pow,
            top: yDiff + (y - old.tileMinY) * 256 * pow,
            width: 256 * pow,
            height: 256 * pow,
            active: false,
          });

          // tiles.push({
          //   key: `${x}-${y}-${old.roundedZoom}-2`,
          //   url: `https://tiles.freemap.sk/nlc2017/${old.roundedZoom}/${x}/${y}.png`,
          //   srcSet: '',
          //   left: xDiff + (x - old.tileMinX) * 256 * pow,
          //   top: yDiff + (y - old.tileMinY) * 256 * pow,
          //   width: 256 * pow,
          //   height: 256 * pow,
          //   active: false,
          // });
        }
      }
    }

    const xMin = Math.max(tileMinX, 0);

    const yMin = Math.max(tileMinY, 0);

    const xMax = Math.min(tileMaxX, Math.pow(2, roundedZoom) - 1);

    const yMax = Math.min(tileMaxY, Math.pow(2, roundedZoom) - 1);

    for (let x = xMin; x <= xMax; x++) {
      for (let y = yMin; y <= yMax; y++) {
        tiles.push({
          key: `${x}-${y}-${roundedZoom}`,
          url: mapUrl(x, y, roundedZoom),
          srcSet: srcSet(dprs, mapUrl, x, y, roundedZoom),
          left: (x - tileMinX) * 256,
          top: (y - tileMinY) * 256,
          width: 256,
          height: 256,
          active: true,
        });

        // tiles.push({
        //   key: `${x}-${y}-${roundedZoom}-2`,
        //   url: `https://tiles.freemap.sk/nlc2017/${roundedZoom}/${x}/${y}.png`,
        //   srcSet: '',
        //   left: (x - tileMinX) * 256,
        //   top: (y - tileMinY) * 256,
        //   width: 256,
        //   height: 256,
        //   active: true,
        // });
      }
    }

    const boxStyle: CSSProperties = {
      width: scaleWidth,
      height: scaleHeight,
      position: 'absolute',
      top: 0,
      left: 0,
      overflow: 'hidden',
      willChange: 'transform',
      transform: `scale(${scale}, ${scale})`,
      transformOrigin: 'top left',
    };

    const left = -((tileCenterX - tileMinX) * 256 - scaleWidth / 2);

    const top = -((tileCenterY - tileMinY) * 256 - scaleHeight / 2);

    const tilesStyle: CSSProperties = {
      position: 'absolute',
      width: (tileMaxX - tileMinX + 1) * 256,
      height: (tileMaxY - tileMinY + 1) * 256,
      willChange: 'transform',
      transform: `translate(${Math.round(left)}px, ${Math.round(top)}px)`,
    };

    return (
      <div style={boxStyle} className={this.props.boxClassname}>
        <div style={tilesStyle}>
          {tiles.map(tile => (
            <img
              key={tile.key}
              src={tile.url}
              srcSet={tile.srcSet}
              width={tile.width}
              height={tile.height}
              onLoad={() => this.imageLoaded(tile.key)}
              style={{
                position: 'absolute',
                left: tile.left,
                top: tile.top,
                willChange: 'transform',
                transform: tile.transform,
                transformOrigin: 'top left',
                opacity: 1,
              }}
            />
          ))}
        </div>
      </div>
    );
  }

  renderOverlays() {
    const { width, height, center } = this.state;

    const mapState = {
      bounds: this.getBounds(),
      zoom: this.zoomPlusDelta(),
      center: center,
      width,
      height,
    };

    const childrenWithProps = React.Children.map(this.props.children, child => {
      if (!child) {
        return null;
      }

      if (typeof child.type === 'string') {
        return child;
      }

      const { anchor, position, offset } = child.props;

      const c = this.latLngToPixel(anchor || position || center);

      return React.cloneElement(child, {
        left: c[0] - (offset ? offset[0] : 0),
        top: c[1] - (offset ? offset[1] : 0),
        latLngToPixel: this.latLngToPixel,
        pixelToLatLng: this.pixelToLatLng,
        mapState,
      });
    });

    const childrenStyle: CSSProperties = {
      position: 'absolute',
      width: width,
      height: height,
      top: 0,
      left: 0,
    };

    return <div style={childrenStyle}>{childrenWithProps}</div>;
  }

  renderAttribution() {
    const { attribution, attributionPrefix } = this.props;

    if (attribution === false) {
      return null;
    }

    const style: CSSProperties = {
      position: 'absolute',
      bottom: 0,
      right: 0,
      fontSize: '11px',
      padding: '2px 5px',
      background: 'rgba(255, 255, 255, 0.7)',
      fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
      color: '#333',
    };

    const linkStyle: CSSProperties = {
      color: '#0078A8',
      textDecoration: 'none',
    };

    return (
      <div key="attr" className="pigeon-attribution" style={style}>
        {attributionPrefix === false ? null : (
          <span>
            {attributionPrefix || (
              <a href="https://pigeon-maps.js.org/" style={linkStyle}>
                Pigeon
              </a>
            )}
            {' | '}
          </span>
        )}
        {attribution || (
          <span>
            {' © '}
            <a href="https://www.openstreetmap.org/copyright" style={linkStyle}>
              OpenStreetMap
            </a>
            {' contributors'}
          </span>
        )}
      </div>
    );
  }

  renderWarning() {
    const {
      metaWheelZoom,
      metaWheelZoomWarning,
      twoFingerDrag,
      twoFingerDragWarning,
      warningZIndex,
    } = this.props;

    const { showWarning, warningType, width, height } = this.state;

    if (
      (metaWheelZoom && metaWheelZoomWarning) ||
      (twoFingerDrag && twoFingerDragWarning)
    ) {
      const style: CSSProperties = {
        position: 'absolute',
        top: 0,
        left: 0,
        width: width,
        height: height,
        overflow: 'hidden',
        pointerEvents: 'none',
        opacity: showWarning ? 100 : 0,
        transition: 'opacity 300ms',
        background: 'rgba(0,0,0,0.5)',
        color: '#fff',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: 22,
        fontFamily: '"Arial", sans-serif',
        textAlign: 'center',
        zIndex: warningZIndex,
      };

      const meta =
        typeof window !== 'undefined' &&
        window.navigator &&
        window.navigator.platform.toUpperCase().indexOf('MAC') >= 0
          ? '⌘'
          : '⊞';

      const warningText =
        warningType === 'fingers' ? twoFingerDragWarning : metaWheelZoomWarning;

      return <div style={style}>{warningText.replace('META', meta)}</div>;
    } else {
      return null;
    }
  }

  render() {
    const { touchEvents, twoFingerDrag } = this.props;
    const { width, height } = this.state;

    const containerStyle: CSSProperties = {
      width: this.props.width ? width : '100%',
      height: this.props.height ? height : '100%',
      position: 'relative',
      display: 'inline-block',
      overflow: 'hidden',
      background: '#dddddd',
      touchAction: touchEvents
        ? twoFingerDrag
          ? 'pan-x pan-y'
          : 'none'
        : 'auto',
    };

    const hasSize = !!(width && height);

    return (
      <div style={containerStyle} ref={this.setRef}>
        {hasSize && this.renderTiles()}
        {hasSize && this.renderOverlays()}
        {hasSize && this.renderAttribution()}
        {hasSize && this.renderWarning()}
      </div>
    );
  }
}
