import * as at from "fm3/actionTypes";

export interface IMapState {
  mapType: string;
  lat: number;
  lon: number;
  zoom: number;
  overlays: string[];
  overlayOpacity: { [type: string]: string };
  overlayPaneOpacity: number;
  tileFormat: "jpeg" | "png";
  stravaAuth: boolean;
  tool: string | null; // TODO enum
  removeGalleryOverlayOnGalleryToolQuit: boolean;
}

const initialState: IMapState = {
  mapType: "X",
  lat: 48.70714,
  lon: 19.4995,
  zoom: 8,
  overlays: [],
  overlayOpacity: {},
  overlayPaneOpacity: 0.65,
  tileFormat: "png",
  stravaAuth: false,
  tool: null,
  removeGalleryOverlayOnGalleryToolQuit: false
};

// export default createReducer<ITrackingState, RootAction>(initialState)
//   .;

export default function map(state = initialState, action) {
  switch (action.type) {
    // TODO improve validation
    case at.MAP_LOAD_STATE: {
      const s = { ...state };
      const {
        mapType,
        lat,
        lon,
        zoom,
        overlays,
        overlayOpacity,
        tileFormat,
        overlayPaneOpacity
      } = action.payload;
      if (mapType) {
        s.mapType = mapType;
      }
      if (typeof lat === "number") {
        s.lat = lat;
      }
      if (typeof lon === "number") {
        s.lon = lon;
      }
      if (typeof zoom === "number") {
        s.zoom = zoom;
      }
      if (Array.isArray(overlays)) {
        s.overlays = [...overlays];
      }
      if (overlayOpacity) {
        s.overlayOpacity = {
          ...initialState.overlayOpacity,
          ...overlayOpacity
        };
      }
      if (overlayPaneOpacity) {
        s.overlayPaneOpacity = overlayPaneOpacity;
      }
      if (tileFormat) {
        s.tileFormat = tileFormat;
      }
      return s;
    }
    case at.MAP_RESET:
      return {
        ...state,
        zoom: initialState.zoom,
        lat: initialState.lat,
        lon: initialState.lon
      };
    case at.MAP_SET_TILE_FORMAT:
      return { ...state, tileFormat: action.payload };
    case at.MAP_SET_OVERLAY_OPACITY:
      return { ...state, overlayOpacity: action.payload };
    case at.MAP_SET_OVERLAY_PANE_OPACITY:
      return { ...state, overlayPaneOpacity: action.payload };
    case at.MAP_REFOCUS: {
      const newState = { ...state };
      ["zoom", "lat", "lon", "mapType", "overlays"].forEach(prop => {
        if (prop in action.payload) {
          newState[prop] = action.payload[prop];
        }
      });

      return newState;
    }
    case at.AUTH_SET_USER: {
      const settings = action.payload && action.payload.settings;
      return settings
        ? {
            ...state,
            tileFormat: settings.tileFormat || state.tileFormat,
            overlayOpacity:
              settings.overlayOpacity === undefined
                ? state.overlayOpacity
                : settings.overlayOpacity,
            overlayPaneOpacity:
              typeof settings.overlayPaneOpacity === "number"
                ? settings.overlayPaneOpacity
                : state.overlayPaneOpacity
          }
        : state;
    }
    case at.MAP_SET_STRAVA_AUTH:
      return { ...state, stravaAuth: action.payload };
    case at.SET_TOOL: {
      const currentTool = state.tool;
      const nextTool = action.payload;
      let overlays = [...state.overlays];
      let removeGalleryOverlayOnGalleryToolQuit = false;
      if (nextTool === "gallery" && !overlays.includes("I")) {
        overlays.push("I");
        removeGalleryOverlayOnGalleryToolQuit = true;
      } else if (
        currentTool === "gallery" &&
        nextTool !== "gallery" &&
        state.removeGalleryOverlayOnGalleryToolQuit
      ) {
        overlays = overlays.filter(o => o !== "I");
      }
      return {
        ...state,
        overlays,
        tool: nextTool,
        removeGalleryOverlayOnGalleryToolQuit
      };
    }
    default:
      return state;
  }
}
