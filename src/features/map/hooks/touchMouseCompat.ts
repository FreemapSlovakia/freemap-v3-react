import { DomEvent, Handler, Map } from 'leaflet';

type TouchAwareMapType = typeof Map & {
  TouchExtend?: typeof Handler;
  _touchMouseCompatInstalled?: boolean;
};

const TouchAwareMap = Map as TouchAwareMapType;

if (!TouchAwareMap._touchMouseCompatInstalled) {
  TouchAwareMap._touchMouseCompatInstalled = true;

  Map.mergeOptions({
    touchExtend: true,
  });

  TouchAwareMap.TouchExtend = Handler.extend({
    initialize: function (map: any) {
      this._map = map;
      this._container = map._container;
      this._pane = map._panes.overlayPane;
    },

    addHooks: function () {
      DomEvent.on(this._container, 'touchstart', this._onTouchStart, this);
      DomEvent.on(this._container, 'touchmove', this._onTouchMove, this);
      DomEvent.on(this._container, 'touchend', this._onTouchEnd, this);
      DomEvent.on(this._container, 'touchcancel', this._onTouchCancel, this);
    },

    removeHooks: function () {
      DomEvent.off(this._container, 'touchstart', this._onTouchStart);
      DomEvent.off(this._container, 'touchmove', this._onTouchMove);
      DomEvent.off(this._container, 'touchend', this._onTouchEnd);
      DomEvent.off(this._container, 'touchcancel', this._onTouchCancel);
    },

    _toMouseLikeEvent: function (e: any, touch: any) {
      const target =
        touch?.target ?? e.target ?? e.srcElement ?? this._container;

      return {
        ...e,
        target,
        srcElement: target,
        clientX: touch.clientX,
        clientY: touch.clientY,
      };
    },

    _onTouchStart: function (e: any) {
      if (!this._map._loaded) {
        return;
      }

      const touch = e.touches?.[0] ?? e.changedTouches?.[0] ?? e;
      if (
        !touch ||
        !Number.isFinite(touch.clientX) ||
        !Number.isFinite(touch.clientY)
      ) {
        return;
      }

      const touchAsMouseEvent = this._toMouseLikeEvent(e, touch);
      this._map._fireDOMEvent(touchAsMouseEvent, 'mousedown');
    },

    _onTouchEnd: function (e: any) {
      if (!this._map._loaded) {
        return;
      }

      const touch = e.changedTouches?.[0] ?? e.touches?.[0] ?? e;
      const touchAsMouseEvent =
        touch &&
        Number.isFinite(touch.clientX) &&
        Number.isFinite(touch.clientY)
          ? this._toMouseLikeEvent(e, touch)
          : e;

      this._map._fireDOMEvent(touchAsMouseEvent, 'mouseup');
    },

    _onTouchMove: function (e: any) {
      if (!this._map._loaded) {
        return;
      }

      const touch = e.touches?.[0] ?? e.changedTouches?.[0] ?? e;
      if (
        !touch ||
        !Number.isFinite(touch.clientX) ||
        !Number.isFinite(touch.clientY)
      ) {
        return;
      }

      const touchAsMouseEvent = this._toMouseLikeEvent(e, touch);
      this._map._fireDOMEvent(touchAsMouseEvent, 'mousemove');
    },

    _onTouchCancel: function (e: any) {
      if (!this._map._loaded) {
        return;
      }

      const touch = e.changedTouches?.[0] ?? e.touches?.[0] ?? e;
      const touchAsMouseEvent =
        touch &&
        Number.isFinite(touch.clientX) &&
        Number.isFinite(touch.clientY)
          ? this._toMouseLikeEvent(e, touch)
          : e;

      this._map._fireDOMEvent(touchAsMouseEvent, 'mouseup');
    },
  });

  TouchAwareMap.addInitHook(
    'addHandler',
    'touchExtend',
    TouchAwareMap.TouchExtend,
  );
}
