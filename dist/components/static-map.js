'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _react = require('react');

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _styleUtils = require('../utils/style-utils');

var _isImmutableMap = require('../utils/is-immutable-map');

var _isImmutableMap2 = _interopRequireDefault(_isImmutableMap);

var _viewportMercatorProject = require('viewport-mercator-project');

var _viewportMercatorProject2 = _interopRequireDefault(_viewportMercatorProject);

var _mapbox = require('../mapbox/mapbox');

var _mapbox2 = _interopRequireDefault(_mapbox);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint-disable max-len */
// Copyright (c) 2015 Uber Technologies, Inc.

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
var TOKEN_DOC_URL = 'https://uber.github.io/react-map-gl/#/Documentation/getting-started/about-mapbox-tokens';
var NO_TOKEN_WARNING = 'A valid API access token is required to use Mapbox data';
/* eslint-disable max-len */

function noop() {}

var UNAUTHORIZED_ERROR_CODE = 401;

var propTypes = (0, _assign2.default)({}, _mapbox2.default.propTypes, {
  /** The Mapbox style. A string url or a MapboxGL style Immutable.Map object. */
  mapStyle: _propTypes2.default.oneOfType([_propTypes2.default.string, _propTypes2.default.object]),
  /** There are known issues with style diffing. As stopgap, add option to prevent style diffing. */
  preventStyleDiffing: _propTypes2.default.bool,
  /** Whether the map is visible */
  visible: _propTypes2.default.bool
});

var defaultProps = (0, _assign2.default)({}, _mapbox2.default.defaultProps, {
  mapStyle: 'mapbox://styles/mapbox/light-v8',
  preventStyleDiffing: false,
  visible: true
});

var childContextTypes = {
  viewport: _propTypes2.default.instanceOf(_viewportMercatorProject2.default)
};

var StaticMap = function (_PureComponent) {
  (0, _inherits3.default)(StaticMap, _PureComponent);
  (0, _createClass3.default)(StaticMap, null, [{
    key: 'supported',
    value: function supported() {
      return _mapbox2.default && _mapbox2.default.supported();
    }
  }]);

  function StaticMap(props) {
    (0, _classCallCheck3.default)(this, StaticMap);

    var _this = (0, _possibleConstructorReturn3.default)(this, (StaticMap.__proto__ || (0, _getPrototypeOf2.default)(StaticMap)).call(this, props));

    _this._queryParams = {};
    if (!StaticMap.supported()) {
      _this.componentDidMount = noop;
      _this.componentWillReceiveProps = noop;
      _this.componentDidUpdate = noop;
      _this.componentWillUnmount = noop;
    }
    _this.state = {
      accessTokenInvalid: false
    };

    _this.getMap = _this.getMap.bind(_this);
    _this.queryRenderedFeatures = _this.queryRenderedFeatures.bind(_this);
    _this._updateQueryParams = _this._updateQueryParams.bind(_this);
    _this._updateMapSize = _this._updateMapSize.bind(_this);
    _this._updateMapStyle = _this._updateMapStyle.bind(_this);
    _this._mapboxMapLoaded = _this._mapboxMapLoaded.bind(_this);
    _this._mapboxMapError = _this._mapboxMapError.bind(_this);
    _this._renderNoTokenWarning = _this._renderNoTokenWarning.bind(_this);
    return _this;
  }

  (0, _createClass3.default)(StaticMap, [{
    key: 'getChildContext',
    value: function getChildContext() {
      return {
        viewport: new _viewportMercatorProject2.default(this.props)
      };
    }
  }, {
    key: 'componentDidMount',
    value: function componentDidMount() {
      var mapStyle = this.props.mapStyle;


      this._mapbox = new _mapbox2.default((0, _assign2.default)({}, this.props, {
        container: this._mapboxMap,
        onError: this._mapboxMapError,
        mapStyle: (0, _isImmutableMap2.default)(mapStyle) ? mapStyle.toJS() : mapStyle
      }));
      this._map = this._mapbox.getMap();
      this._updateQueryParams(mapStyle);
    }
  }, {
    key: 'componentWillReceiveProps',
    value: function componentWillReceiveProps(newProps) {
      this._mapbox.setProps(newProps);
      this._updateMapStyle(this.props, newProps);

      // this._updateMapViewport(this.props, newProps);

      // Save width/height so that we can check them in componentDidUpdate
      this.setState({
        width: this.props.width,
        height: this.props.height
      });
    }
  }, {
    key: 'componentDidUpdate',
    value: function componentDidUpdate() {
      // Since Mapbox's map.resize() reads size from DOM
      // we must wait to read size until after render (i.e. here in "didUpdate")
      this._updateMapSize(this.state, this.props);
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      this._mapbox.finalize();
      this._mapbox = null;
      this._map = null;
    }

    // External apps can access map this way

  }, {
    key: 'getMap',
    value: function getMap() {
      return this._map;
    }

    /** Uses Mapbox's
      * queryRenderedFeatures API to find features at point or in a bounding box.
      * https://www.mapbox.com/mapbox-gl-js/api/#Map#queryRenderedFeatures
      * To query only some of the layers, set the `interactive` property in the
      * layer style to `true`.
      * @param {[Number, Number]|[[Number, Number], [Number, Number]]} geometry -
      *   Point or an array of two points defining the bounding box
      * @param {Object} parameters - query options
      */

  }, {
    key: 'queryRenderedFeatures',
    value: function queryRenderedFeatures(geometry, parameters) {
      var queryParams = parameters || this._queryParams;
      if (queryParams.layers && queryParams.layers.length === 0) {
        return [];
      }
      return this._map.queryRenderedFeatures(geometry, queryParams);
    }

    // Hover and click only query layers whose interactive property is true

  }, {
    key: '_updateQueryParams',
    value: function _updateQueryParams(mapStyle) {
      var interactiveLayerIds = (0, _styleUtils.getInteractiveLayerIds)(mapStyle);
      this._queryParams = { layers: interactiveLayerIds };
    }

    // Note: needs to be called after render (e.g. in componentDidUpdate)

  }, {
    key: '_updateMapSize',
    value: function _updateMapSize(oldProps, newProps) {
      var sizeChanged = oldProps.width !== newProps.width || oldProps.height !== newProps.height;

      if (sizeChanged) {
        this._map.resize();
        // this._callOnChangeViewport(this._map.transform);
      }
    }
  }, {
    key: '_updateMapStyle',
    value: function _updateMapStyle(oldProps, newProps) {
      var mapStyle = newProps.mapStyle;
      var oldMapStyle = oldProps.mapStyle;
      if (mapStyle !== oldMapStyle) {
        if ((0, _isImmutableMap2.default)(mapStyle)) {
          if (this.props.preventStyleDiffing) {
            this._map.setStyle(mapStyle.toJS());
          } else {
            (0, _styleUtils.setDiffStyle)(oldMapStyle, mapStyle, this._map);
          }
        } else {
          this._map.setStyle(mapStyle);
        }
        this._updateQueryParams(mapStyle);
      }
    }
  }, {
    key: '_mapboxMapLoaded',
    value: function _mapboxMapLoaded(ref) {
      this._mapboxMap = ref;
    }

    // Handle map error

  }, {
    key: '_mapboxMapError',
    value: function _mapboxMapError(evt) {
      var statusCode = evt.error && evt.error.status || evt.status;
      if (statusCode === UNAUTHORIZED_ERROR_CODE && !this.state.accessTokenInvalid) {
        // Mapbox throws unauthorized error - invalid token
        console.error(NO_TOKEN_WARNING); // eslint-disable-line
        this.setState({ accessTokenInvalid: true });
      }
    }
  }, {
    key: '_renderNoTokenWarning',
    value: function _renderNoTokenWarning() {
      if (this.state.accessTokenInvalid) {
        var style = {
          position: 'absolute',
          left: 0,
          top: 0
        };
        return (0, _react.createElement)('div', { key: 'warning', id: 'no-token-warning', style: style }, [(0, _react.createElement)('h3', { key: 'header' }, NO_TOKEN_WARNING), (0, _react.createElement)('div', { key: 'text' }, 'For information on setting up your basemap, read'), (0, _react.createElement)('a', { key: 'link', href: TOKEN_DOC_URL }, 'Note on Map Tokens')]);
      }

      return null;
    }
  }, {
    key: 'render',
    value: function render() {
      var _props = this.props,
          className = _props.className,
          width = _props.width,
          height = _props.height,
          style = _props.style,
          visible = _props.visible;

      var mapContainerStyle = (0, _assign2.default)({}, style, { width: width, height: height, position: 'relative' });
      var mapStyle = (0, _assign2.default)({}, style, {
        width: width,
        height: height,
        visibility: visible ? 'visible' : 'hidden'
      });
      var overlayContainerStyle = {
        position: 'absolute',
        left: 0,
        top: 0,
        width: width,
        height: height,
        overflow: 'hidden'
      };

      // Note: a static map still handles clicks and hover events
      return (0, _react.createElement)('div', {
        key: 'map-container',
        style: mapContainerStyle,
        children: [(0, _react.createElement)('div', {
          key: 'map-mapbox',
          ref: this._mapboxMapLoaded,
          style: mapStyle,
          className: className
        }), (0, _react.createElement)('div', {
          key: 'map-overlays',
          // Same as interactive map's overlay container
          className: 'overlays',
          style: overlayContainerStyle,
          children: this.props.children
        }), this._renderNoTokenWarning()]
      });
    }
  }]);
  return StaticMap;
}(_react.PureComponent);

exports.default = StaticMap;


StaticMap.displayName = 'StaticMap';
StaticMap.propTypes = propTypes;
StaticMap.defaultProps = defaultProps;
StaticMap.childContextTypes = childContextTypes;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb21wb25lbnRzL3N0YXRpYy1tYXAuanMiXSwibmFtZXMiOlsiVE9LRU5fRE9DX1VSTCIsIk5PX1RPS0VOX1dBUk5JTkciLCJub29wIiwiVU5BVVRIT1JJWkVEX0VSUk9SX0NPREUiLCJwcm9wVHlwZXMiLCJtYXBTdHlsZSIsIm9uZU9mVHlwZSIsInN0cmluZyIsIm9iamVjdCIsInByZXZlbnRTdHlsZURpZmZpbmciLCJib29sIiwidmlzaWJsZSIsImRlZmF1bHRQcm9wcyIsImNoaWxkQ29udGV4dFR5cGVzIiwidmlld3BvcnQiLCJpbnN0YW5jZU9mIiwiU3RhdGljTWFwIiwic3VwcG9ydGVkIiwicHJvcHMiLCJfcXVlcnlQYXJhbXMiLCJjb21wb25lbnREaWRNb3VudCIsImNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHMiLCJjb21wb25lbnREaWRVcGRhdGUiLCJjb21wb25lbnRXaWxsVW5tb3VudCIsInN0YXRlIiwiYWNjZXNzVG9rZW5JbnZhbGlkIiwiZ2V0TWFwIiwiYmluZCIsInF1ZXJ5UmVuZGVyZWRGZWF0dXJlcyIsIl91cGRhdGVRdWVyeVBhcmFtcyIsIl91cGRhdGVNYXBTaXplIiwiX3VwZGF0ZU1hcFN0eWxlIiwiX21hcGJveE1hcExvYWRlZCIsIl9tYXBib3hNYXBFcnJvciIsIl9yZW5kZXJOb1Rva2VuV2FybmluZyIsIl9tYXBib3giLCJjb250YWluZXIiLCJfbWFwYm94TWFwIiwib25FcnJvciIsInRvSlMiLCJfbWFwIiwibmV3UHJvcHMiLCJzZXRQcm9wcyIsInNldFN0YXRlIiwid2lkdGgiLCJoZWlnaHQiLCJmaW5hbGl6ZSIsImdlb21ldHJ5IiwicGFyYW1ldGVycyIsInF1ZXJ5UGFyYW1zIiwibGF5ZXJzIiwibGVuZ3RoIiwiaW50ZXJhY3RpdmVMYXllcklkcyIsIm9sZFByb3BzIiwic2l6ZUNoYW5nZWQiLCJyZXNpemUiLCJvbGRNYXBTdHlsZSIsInNldFN0eWxlIiwicmVmIiwiZXZ0Iiwic3RhdHVzQ29kZSIsImVycm9yIiwic3RhdHVzIiwiY29uc29sZSIsInN0eWxlIiwicG9zaXRpb24iLCJsZWZ0IiwidG9wIiwia2V5IiwiaWQiLCJocmVmIiwiY2xhc3NOYW1lIiwibWFwQ29udGFpbmVyU3R5bGUiLCJ2aXNpYmlsaXR5Iiwib3ZlcmxheUNvbnRhaW5lclN0eWxlIiwib3ZlcmZsb3ciLCJjaGlsZHJlbiIsImRpc3BsYXlOYW1lIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFtQkE7O0FBQ0E7Ozs7QUFFQTs7QUFDQTs7OztBQUVBOzs7O0FBRUE7Ozs7OztBQUVBO0FBN0JBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBWUEsSUFBTUEsZ0JBQWdCLHlGQUF0QjtBQUNBLElBQU1DLG1CQUFtQix5REFBekI7QUFDQTs7QUFFQSxTQUFTQyxJQUFULEdBQWdCLENBQUU7O0FBRWxCLElBQU1DLDBCQUEwQixHQUFoQzs7QUFFQSxJQUFNQyxZQUFZLHNCQUFjLEVBQWQsRUFBa0IsaUJBQU9BLFNBQXpCLEVBQW9DO0FBQ3BEO0FBQ0FDLFlBQVUsb0JBQVVDLFNBQVYsQ0FBb0IsQ0FDNUIsb0JBQVVDLE1BRGtCLEVBRTVCLG9CQUFVQyxNQUZrQixDQUFwQixDQUYwQztBQU1wRDtBQUNBQyx1QkFBcUIsb0JBQVVDLElBUHFCO0FBUXBEO0FBQ0FDLFdBQVMsb0JBQVVEO0FBVGlDLENBQXBDLENBQWxCOztBQVlBLElBQU1FLGVBQWUsc0JBQWMsRUFBZCxFQUFrQixpQkFBT0EsWUFBekIsRUFBdUM7QUFDMURQLFlBQVUsaUNBRGdEO0FBRTFESSx1QkFBcUIsS0FGcUM7QUFHMURFLFdBQVM7QUFIaUQsQ0FBdkMsQ0FBckI7O0FBTUEsSUFBTUUsb0JBQW9CO0FBQ3hCQyxZQUFVLG9CQUFVQyxVQUFWO0FBRGMsQ0FBMUI7O0lBSXFCQyxTOzs7O2dDQUNBO0FBQ2pCLGFBQU8sb0JBQVUsaUJBQU9DLFNB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VSxVQUExQixFQUF6QixDQUExQjtBQUNBLFVBQU01RCxXQUFXLHNCQUFjLEVBQWQsRUFBa0IyRCxLQUFsQixFQUF5QjtBQUN4Q3BCLG9CQUR3QztBQUV4Q0Msc0JBRndDO0FBR3hDNEIsb0JBQVk5RCxVQUFVLFNBQVYsR0FBc0I7QUFITSxPQUF6QixDQUFqQjtBQUtBLFVBQU0rRCx3QkFBd0I7QUFDNUJULGtCQUFVLFVBRGtCO0FBRTVCQyxjQUFNLENBRnNCO0FBRzVCQyxhQUFLLENBSHVCO0FBSTVCdkIsb0JBSjRCO0FBSzVCQyxzQkFMNEI7QUFNNUI4QixrQkFBVTtBQU5rQixPQUE5Qjs7QUFTQTtBQUNBLGFBQ0UsMEJBQWMsS0FBZCxFQUFxQjtBQUNuQlAsYUFBSyxlQURjO0FBRW5CSixlQUFPUSxpQkFGWTtBQUduQkksa0JBQVUsQ0FDUiwwQkFBYyxLQUFkLEVBQXFCO0FBQ25CUixlQUFLLFlBRGM7QUFFbkJWLGVBQUssS0FBSzFCLGdCQUZTO0FBR25CZ0MsaUJBQU8zRCxRQUhZO0FBSW5Ca0U7QUFKbUIsU0FBckIsQ0FEUSxFQU9SLDBCQUFjLEtBQWQsRUFBcUI7QUFDbkJILGVBQUssY0FEYztBQUVuQjtBQUNBRyxxQkFBVyxVQUhRO0FBSW5CUCxpQkFBT1UscUJBSlk7QUFLbkJFLG9CQUFVLEtBQUsxRCxLQUFMLENBQVcwRDtBQUxGLFNBQXJCLENBUFEsRUFjUixLQUFLMUMscUJBQUwsRUFkUTtBQUhTLE9BQXJCLENBREY7QUFzQkQ7Ozs7O2tCQXhNa0JsQixTOzs7QUEyTXJCQSxVQUFVNkQsV0FBVixHQUF3QixXQUF4QjtBQUNBN0QsVUFBVVosU0FBVixHQUFzQkEsU0FBdEI7QUFDQVksVUFBVUosWUFBVixHQUF5QkEsWUFBekI7QUFDQUksVUFBVUgsaUJBQVYsR0FBOEJBLGlCQUE5QiIsImZpbGUiOiJzdGF0aWMtbWFwLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IChjKSAyMDE1IFViZXIgVGVjaG5vbG9naWVzLCBJbmMuXG5cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcbi8vIG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWxcbi8vIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcbi8vIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGxcbi8vIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xuLy8gZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcblxuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW5cbi8vIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG4vLyBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbi8vIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuLy8gQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxuLy8gTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcbi8vIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU5cbi8vIFRIRSBTT0ZUV0FSRS5cbmltcG9ydCB7UHVyZUNvbXBvbmVudCwgY3JlYXRlRWxlbWVudH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IFByb3BUeXBlcyBmcm9tICdwcm9wLXR5cGVzJztcblxuaW1wb3J0IHtnZXRJbnRlcmFjdGl2ZUxheWVySWRzLCBzZXREaWZmU3R5bGV9IGZyb20gJy4uL3V0aWxzL3N0eWxlLXV0aWxzJztcbmltcG9ydCBpc0ltbXV0YWJsZU1hcCBmcm9tICcuLi91dGlscy9pcy1pbW11dGFibGUtbWFwJztcblxuaW1wb3J0IFdlYk1lcmNhdG9yVmlld3BvcnQgZnJvbSAndmlld3BvcnQtbWVyY2F0b3ItcHJvamVjdCc7XG5cbmltcG9ydCBNYXBib3ggZnJvbSAnLi4vbWFwYm94L21hcGJveCc7XG5cbi8qIGVzbGludC1kaXNhYmxlIG1heC1sZW4gKi9cbmNvbnN0IFRPS0VOX0RPQ19VUkwgPSAnaHR0cHM6Ly91YmVyLmdpdGh1Yi5pby9yZWFjdC1tYXAtZ2wvIy9Eb2N1bWVudGF0aW9uL2dldHRpbmctc3RhcnRlZC9hYm91dC1tYXBib3gtdG9rZW5zJztcbmNvbnN0IE5PX1RPS0VOX1dBUk5JTkcgPSAnQSB2YWxpZCBBUEkgYWNjZXNzIHRva2VuIGlzIHJlcXVpcmVkIHRvIHVzZSBNYXBib3ggZGF0YSc7XG4vKiBlc2xpbnQtZGlzYWJsZSBtYXgtbGVuICovXG5cbmZ1bmN0aW9uIG5vb3AoKSB7fVxuXG5jb25zdCBVTkFVVEhPUklaRURfRVJST1JfQ09ERSA9IDQwMTtcblxuY29uc3QgcHJvcFR5cGVzID0gT2JqZWN0LmFzc2lnbih7fSwgTWFwYm94LnByb3BUeXBlcywge1xuICAvKiogVGhlIE1hcGJveCBzdHlsZS4gQSBzdHJpbmcgdXJsIG9yIGEgTWFwYm94R0wgc3R5bGUgSW1tdXRhYmxlLk1hcCBvYmplY3QuICovXG4gIG1hcFN0eWxlOiBQcm9wVHlwZXMub25lT2ZUeXBlKFtcbiAgICBQcm9wVHlwZXMuc3RyaW5nLFxuICAgIFByb3BUeXBlcy5vYmplY3RcbiAgXSksXG4gIC8qKiBUaGVyZSBhcmUga25vd24gaXNzdWVzIHdpdGggc3R5bGUgZGlmZmluZy4gQXMgc3RvcGdhcCwgYWRkIG9wdGlvbiB0byBwcmV2ZW50IHN0eWxlIGRpZmZpbmcuICovXG4gIHByZXZlbnRTdHlsZURpZmZpbmc6IFByb3BUeXBlcy5ib29sLFxuICAvKiogV2hldGhlciB0aGUgbWFwIGlzIHZpc2libGUgKi9cbiAgdmlzaWJsZTogUHJvcFR5cGVzLmJvb2xcbn0pO1xuXG5jb25zdCBkZWZhdWx0UHJvcHMgPSBPYmplY3QuYXNzaWduKHt9LCBNYXBib3guZGVmYXVsdFByb3BzLCB7XG4gIG1hcFN0eWxlOiAnbWFwYm94Oi8vc3R5bGVzL21hcGJveC9saWdodC12OCcsXG4gIHByZXZlbnRTdHlsZURpZmZpbmc6IGZhbHNlLFxuICB2aXNpYmxlOiB0cnVlXG59KTtcblxuY29uc3QgY2hpbGRDb250ZXh0VHlwZXMgPSB7XG4gIHZpZXdwb3J0OiBQcm9wVHlwZXMuaW5zdGFuY2VPZihXZWJNZXJjYXRvclZpZXdwb3J0KVxufTtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU3RhdGljTWFwIGV4dGVuZHMgUHVyZUNvbXBvbmVudCB7XG4gIHN0YXRpYyBzdXBwb3J0ZWQoKSB7XG4gICAgcmV0dXJuIE1hcGJveCAmJiBNYXBib3guc3VwcG9ydGVkKCk7XG4gIH1cblxuICBjb25zdHJ1Y3Rvcihwcm9wcykge1xuICAgIHN1cGVyKHByb3BzKTtcbiAgICB0aGlzLl9xdWVyeVBhcmFtcyA9IHt9O1xuICAgIGlmICghU3RhdGljTWFwLnN1cHBvcnRlZCgpKSB7XG4gICAgICB0aGlzLmNvbXBvbmVudERpZE1vdW50ID0gbm9vcDtcbiAgICAgIHRoaXMuY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wcyA9IG5vb3A7XG4gICAgICB0aGlzLmNvbXBvbmVudERpZFVwZGF0ZSA9IG5vb3A7XG4gICAgICB0aGlzLmNvbXBvbmVudFdpbGxVbm1vdW50ID0gbm9vcDtcbiAgICB9XG4gICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgIGFjY2Vzc1Rva2VuSW52YWxpZDogZmFsc2VcbiAgICB9O1xuXG4gICAgdGhpcy5nZXRNYXAgPSB0aGlzLmdldE1hcC5iaW5kKHRoaXMpO1xuICAgIHRoaXMucXVlcnlSZW5kZXJlZEZlYXR1cmVzID0gdGhpcy5xdWVyeVJlbmRlcmVkRmVhdHVyZXMuYmluZCh0aGlzKTtcbiAgICB0aGlzLl91cGRhdGVRdWVyeVBhcmFtcyA9IHRoaXMuX3VwZGF0ZVF1ZXJ5UGFyYW1zLmJpbmQodGhpcyk7XG4gICAgdGhpcy5fdXBkYXRlTWFwU2l6ZSA9IHRoaXMuX3VwZGF0ZU1hcFNpemUuYmluZCh0aGlzKTtcbiAgICB0aGlzLl91cGRhdGVNYXBTdHlsZSA9IHRoaXMuX3VwZGF0ZU1hcFN0eWxlLmJpbmQodGhpcyk7XG4gICAgdGhpcy5fbWFwYm94TWFwTG9hZGVkID0gdGhpcy5fbWFwYm94TWFwTG9hZGVkLmJpbmQodGhpcyk7XG4gICAgdGhpcy5fbWFwYm94TWFwRXJyb3IgPSB0aGlzLl9tYXBib3hNYXBFcnJvci5iaW5kKHRoaXMpO1xuICAgIHRoaXMuX3JlbmRlck5vVG9rZW5XYXJuaW5nID0gdGhpcy5fcmVuZGVyTm9Ub2tlbldhcm5pbmcuYmluZCh0aGlzKTtcbiAgfVxuXG4gIGdldENoaWxkQ29udGV4dCgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgdmlld3BvcnQ6IG5ldyBXZWJNZXJjYXRvclZpZXdwb3J0KHRoaXMucHJvcHMpXG4gICAgfTtcbiAgfVxuXG4gIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgIGNvbnN0IHttYXBTdHlsZX0gPSB0aGlzLnByb3BzO1xuXG4gICAgdGhpcy5fbWFwYm94ID0gbmV3IE1hcGJveChPYmplY3QuYXNzaWduKHt9LCB0aGlzLnByb3BzLCB7XG4gICAgICBjb250YWluZXI6IHRoaXMuX21hcGJveE1hcCxcbiAgICAgIG9uRXJyb3I6IHRoaXMuX21hcGJveE1hcEVycm9yLFxuICAgICAgbWFwU3R5bGU6IGlzSW1tdXRhYmxlTWFwKG1hcFN0eWxlKSA/IG1hcFN0eWxlLnRvSlMoKSA6IG1hcFN0eWxlXG4gICAgfSkpO1xuICAgIHRoaXMuX21hcCA9IHRoaXMuX21hcGJveC5nZXRNYXAoKTtcbiAgICB0aGlzLl91cGRhdGVRdWVyeVBhcmFtcyhtYXBTdHlsZSk7XG4gIH1cblxuICBjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzKG5ld1Byb3BzKSB7XG4gICAgdGhpcy5fbWFwYm94LnNldFByb3BzKG5ld1Byb3BzKTtcbiAgICB0aGlzLl91cGRhdGVNYXBTdHlsZSh0aGlzLnByb3BzLCBuZXdQcm9wcyk7XG5cbiAgICAvLyB0aGlzLl91cGRhdGVNYXBWaWV3cG9ydCh0aGlzLnByb3BzLCBuZXdQcm9wcyk7XG5cbiAgICAvLyBTYXZlIHdpZHRoL2hlaWdodCBzbyB0aGF0IHdlIGNhbiBjaGVjayB0aGVtIGluIGNvbXBvbmVudERpZFVwZGF0ZVxuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgd2lkdGg6IHRoaXMucHJvcHMud2lkdGgsXG4gICAgICBoZWlnaHQ6IHRoaXMucHJvcHMuaGVpZ2h0XG4gICAgfSk7XG4gIH1cblxuICBjb21wb25lbnREaWRVcGRhdGUoKSB7XG4gICAgLy8gU2luY2UgTWFwYm94J3MgbWFwLnJlc2l6ZSgpIHJlYWRzIHNpemUgZnJvbSBET01cbiAgICAvLyB3ZSBtdXN0IHdhaXQgdG8gcmVhZCBzaXplIHVudGlsIGFmdGVyIHJlbmRlciAoaS5lLiBoZXJlIGluIFwiZGlkVXBkYXRlXCIpXG4gICAgdGhpcy5fdXBkYXRlTWFwU2l6ZSh0aGlzLnN0YXRlLCB0aGlzLnByb3BzKTtcbiAgfVxuXG4gIGNvbXBvbmVudFdpbGxVbm1vdW50KCkge1xuICAgIHRoaXMuX21hcGJveC5maW5hbGl6ZSgpO1xuICAgIHRoaXMuX21hcGJveCA9IG51bGw7XG4gICAgdGhpcy5fbWFwID0gbnVsbDtcbiAgfVxuXG4gIC8vIEV4dGVybmFsIGFwcHMgY2FuIGFjY2VzcyBtYXAgdGhpcyB3YXlcbiAgZ2V0TWFwKCkge1xuICAgIHJldHVybiB0aGlzLl9tYXA7XG4gIH1cblxuICAvKiogVXNlcyBNYXBib3gnc1xuICAgICogcXVlcnlSZW5kZXJlZEZlYXR1cmVzIEFQSSB0byBmaW5kIGZlYXR1cmVzIGF0IHBvaW50IG9yIGluIGEgYm91bmRpbmcgYm94LlxuICAgICogaHR0cHM6Ly93d3cubWFwYm94LmNvbS9tYXBib3gtZ2wtanMvYXBpLyNNYXAjcXVlcnlSZW5kZXJlZEZlYXR1cmVzXG4gICAgKiBUbyBxdWVyeSBvbmx5IHNvbWUgb2YgdGhlIGxheWVycywgc2V0IHRoZSBgaW50ZXJhY3RpdmVgIHByb3BlcnR5IGluIHRoZVxuICAgICogbGF5ZXIgc3R5bGUgdG8gYHRydWVgLlxuICAgICogQHBhcmFtIHtbTnVtYmVyLCBOdW1iZXJdfFtbTnVtYmVyLCBOdW1iZXJdLCBbTnVtYmVyLCBOdW1iZXJdXX0gZ2VvbWV0cnkgLVxuICAgICogICBQb2ludCBvciBhbiBhcnJheSBvZiB0d28gcG9pbnRzIGRlZmluaW5nIHRoZSBib3VuZGluZyBib3hcbiAgICAqIEBwYXJhbSB7T2JqZWN0fSBwYXJhbWV0ZXJzIC0gcXVlcnkgb3B0aW9uc1xuICAgICovXG4gIHF1ZXJ5UmVuZGVyZWRGZWF0dXJlcyhnZW9tZXRyeSwgcGFyYW1ldGVycykge1xuICAgIGNvbnN0IHF1ZXJ5UGFyYW1zID0gcGFyYW1ldGVycyB8fCB0aGlzLl9xdWVyeVBhcmFtcztcbiAgICBpZiAocXVlcnlQYXJhbXMubGF5ZXJzICYmIHF1ZXJ5UGFyYW1zLmxheWVycy5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybiBbXTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuX21hcC5xdWVyeVJlbmRlcmVkRmVhdHVyZXMoZ2VvbWV0cnksIHF1ZXJ5UGFyYW1zKTtcbiAgfVxuXG4gIC8vIEhvdmVyIGFuZCBjbGljayBvbmx5IHF1ZXJ5IGxheWVycyB3aG9zZSBpbnRlcmFjdGl2ZSBwcm9wZXJ0eSBpcyB0cnVlXG4gIF91cGRhdGVRdWVyeVBhcmFtcyhtYXBTdHlsZSkge1xuICAgIGNvbnN0IGludGVyYWN0aXZlTGF5ZXJJZHMgPSBnZXRJbnRlcmFjdGl2ZUxheWVySWRzKG1hcFN0eWxlKTtcbiAgICB0aGlzLl9xdWVyeVBhcmFtcyA9IHtsYXllcnM6IGludGVyYWN0aXZlTGF5ZXJJZHN9O1xuICB9XG5cbiAgLy8gTm90ZTogbmVlZHMgdG8gYmUgY2FsbGVkIGFmdGVyIHJlbmRlciAoZS5nLiBpbiBjb21wb25lbnREaWRVcGRhdGUpXG4gIF91cGRhdGVNYXBTaXplKG9sZFByb3BzLCBuZXdQcm9wcykge1xuICAgIGNvbnN0IHNpemVDaGFuZ2VkID1cbiAgICAgIG9sZFByb3BzLndpZHRoICE9PSBuZXdQcm9wcy53aWR0aCB8fCBvbGRQcm9wcy5oZWlnaHQgIT09IG5ld1Byb3BzLmhlaWdodDtcblxuICAgIGlmIChzaXplQ2hhbmdlZCkge1xuICAgICAgdGhpcy5fbWFwLnJlc2l6ZSgpO1xuICAgICAgLy8gdGhpcy5fY2FsbE9uQ2hhbmdlVmlld3BvcnQodGhpcy5fbWFwLnRyYW5zZm9ybSk7XG4gICAgfVxuICB9XG5cbiAgX3VwZGF0ZU1hcFN0eWxlKG9sZFByb3BzLCBuZXdQcm9wcykge1xuICAgIGNvbnN0IG1hcFN0eWxlID0gbmV3UHJvcHMubWFwU3R5bGU7XG4gICAgY29uc3Qgb2xkTWFwU3R5bGUgPSBvbGRQcm9wcy5tYXBTdHlsZTtcbiAgICBpZiAobWFwU3R5bGUgIT09IG9sZE1hcFN0eWxlKSB7XG4gICAgICBpZiAoaXNJbW11dGFibGVNYXAobWFwU3R5bGUpKSB7XG4gICAgICAgIGlmICh0aGlzLnByb3BzLnByZXZlbnRTdHlsZURpZmZpbmcpIHtcbiAgICAgICAgICB0aGlzLl9tYXAuc2V0U3R5bGUobWFwU3R5bGUudG9KUygpKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBzZXREaWZmU3R5bGUob2xkTWFwU3R5bGUsIG1hcFN0eWxlLCB0aGlzLl9tYXApO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLl9tYXAuc2V0U3R5bGUobWFwU3R5bGUpO1xuICAgICAgfVxuICAgICAgdGhpcy5fdXBkYXRlUXVlcnlQYXJhbXMobWFwU3R5bGUpO1xuICAgIH1cbiAgfVxuXG4gIF9tYXBib3hNYXBMb2FkZWQocmVmKSB7XG4gICAgdGhpcy5fbWFwYm94TWFwID0gcmVmO1xuICB9XG5cbiAgLy8gSGFuZGxlIG1hcCBlcnJvclxuICBfbWFwYm94TWFwRXJyb3IoZXZ0KSB7XG4gICAgY29uc3Qgc3RhdHVzQ29kZSA9IGV2dC5lcnJvciAmJiBldnQuZXJyb3Iuc3RhdHVzIHx8IGV2dC5zdGF0dXM7XG4gICAgaWYgKHN0YXR1c0NvZGUgPT09IFVOQVVUSE9SSVpFRF9FUlJPUl9DT0RFICYmICF0aGlzLnN0YXRlLmFjY2Vzc1Rva2VuSW52YWxpZCkge1xuICAgICAgLy8gTWFwYm94IHRocm93cyB1bmF1dGhvcml6ZWQgZXJyb3IgLSBpbnZhbGlkIHRva2VuXG4gICAgICBjb25zb2xlLmVycm9yKE5PX1RPS0VOX1dBUk5JTkcpOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lXG4gICAgICB0aGlzLnNldFN0YXRlKHthY2Nlc3NUb2tlbkludmFsaWQ6IHRydWV9KTtcbiAgICB9XG4gIH1cblxuICBfcmVuZGVyTm9Ub2tlbldhcm5pbmcoKSB7XG4gICAgaWYgKHRoaXMuc3RhdGUuYWNjZXNzVG9rZW5JbnZhbGlkKSB7XG4gICAgICBjb25zdCBzdHlsZSA9IHtcbiAgICAgICAgcG9zaXRpb246ICdhYnNvbHV0ZScsXG4gICAgICAgIGxlZnQ6IDAsXG4gICAgICAgIHRvcDogMFxuICAgICAgfTtcbiAgICAgIHJldHVybiAoXG4gICAgICAgIGNyZWF0ZUVsZW1lbnQoJ2RpdicsIHtrZXk6ICd3YXJuaW5nJywgaWQ6ICduby10b2tlbi13YXJuaW5nJywgc3R5bGV9LCBbXG4gICAgICAgICAgY3JlYXRlRWxlbWVudCgnaDMnLCB7a2V5OiAnaGVhZGVyJ30sIE5PX1RPS0VOX1dBUk5JTkcpLFxuICAgICAgICAgIGNyZWF0ZUVsZW1lbnQoJ2RpdicsIHtrZXk6ICd0ZXh0J30sICdGb3IgaW5mb3JtYXRpb24gb24gc2V0dGluZyB1cCB5b3VyIGJhc2VtYXAsIHJlYWQnKSxcbiAgICAgICAgICBjcmVhdGVFbGVtZW50KCdhJywge2tleTogJ2xpbmsnLCBocmVmOiBUT0tFTl9ET0NfVVJMfSwgJ05vdGUgb24gTWFwIFRva2VucycpXG4gICAgICAgIF0pXG4gICAgICApO1xuICAgIH1cblxuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgcmVuZGVyKCkge1xuICAgIGNvbnN0IHtjbGFzc05hbWUsIHdpZHRoLCBoZWlnaHQsIHN0eWxlLCB2aXNpYmxlfSA9IHRoaXMucHJvcHM7XG4gICAgY29uc3QgbWFwQ29udGFpbmVyU3R5bGUgPSBPYmplY3QuYXNzaWduKHt9LCBzdHlsZSwge3dpZHRoLCBoZWlnaHQsIHBvc2l0aW9uOiAncmVsYXRpdmUnfSk7XG4gICAgY29uc3QgbWFwU3R5bGUgPSBPYmplY3QuYXNzaWduKHt9LCBzdHlsZSwge1xuICAgICAgd2lkdGgsXG4gICAgICBoZWlnaHQsXG4gICAgICB2aXNpYmlsaXR5OiB2aXNpYmxlID8gJ3Zpc2libGUnIDogJ2hpZGRlbidcbiAgICB9KTtcbiAgICBjb25zdCBvdmVybGF5Q29udGFpbmVyU3R5bGUgPSB7XG4gICAgICBwb3NpdGlvbjogJ2Fic29sdXRlJyxcbiAgICAgIGxlZnQ6IDAsXG4gICAgICB0b3A6IDAsXG4gICAgICB3aWR0aCxcbiAgICAgIGhlaWdodCxcbiAgICAgIG92ZXJmbG93OiAnaGlkZGVuJ1xuICAgIH07XG5cbiAgICAvLyBOb3RlOiBhIHN0YXRpYyBtYXAgc3RpbGwgaGFuZGxlcyBjbGlja3MgYW5kIGhvdmVyIGV2ZW50c1xuICAgIHJldHVybiAoXG4gICAgICBjcmVhdGVFbGVtZW50KCdkaXYnLCB7XG4gICAgICAgIGtleTogJ21hcC1jb250YWluZXInLFxuICAgICAgICBzdHlsZTogbWFwQ29udGFpbmVyU3R5bGUsXG4gICAgICAgIGNoaWxkcmVuOiBbXG4gICAgICAgICAgY3JlYXRlRWxlbWVudCgnZGl2Jywge1xuICAgICAgICAgICAga2V5OiAnbWFwLW1hcGJveCcsXG4gICAgICAgICAgICByZWY6IHRoaXMuX21hcGJveE1hcExvYWRlZCxcbiAgICAgICAgICAgIHN0eWxlOiBtYXBTdHlsZSxcbiAgICAgICAgICAgIGNsYXNzTmFtZVxuICAgICAgICAgIH0pLFxuICAgICAgICAgIGNyZWF0ZUVsZW1lbnQoJ2RpdicsIHtcbiAgICAgICAgICAgIGtleTogJ21hcC1vdmVybGF5cycsXG4gICAgICAgICAgICAvLyBTYW1lIGFzIGludGVyYWN0aXZlIG1hcCdzIG92ZXJsYXkgY29udGFpbmVyXG4gICAgICAgICAgICBjbGFzc05hbWU6ICdvdmVybGF5cycsXG4gICAgICAgICAgICBzdHlsZTogb3ZlcmxheUNvbnRhaW5lclN0eWxlLFxuICAgICAgICAgICAgY2hpbGRyZW46IHRoaXMucHJvcHMuY2hpbGRyZW5cbiAgICAgICAgICB9KSxcbiAgICAgICAgICB0aGlzLl9yZW5kZXJOb1Rva2VuV2FybmluZygpXG4gICAgICAgIF1cbiAgICAgIH0pXG4gICAgKTtcbiAgfVxufVxuXG5TdGF0aWNNYXAuZGlzcGxheU5hbWUgPSAnU3RhdGljTWFwJztcblN0YXRpY01hcC5wcm9wVHlwZXMgPSBwcm9wVHlwZXM7XG5TdGF0aWNNYXAuZGVmYXVsdFByb3BzID0gZGVmYXVsdFByb3BzO1xuU3RhdGljTWFwLmNoaWxkQ29udGV4dFR5cGVzID0gY2hpbGRDb250ZXh0VHlwZXM7XG4iXX0=