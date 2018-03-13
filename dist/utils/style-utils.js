'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

exports.getInteractiveLayerIds = getInteractiveLayerIds;
exports.setDiffStyle = setDiffStyle;

var _isImmutableMap = require('./is-immutable-map');

var _isImmutableMap2 = _interopRequireDefault(_isImmutableMap);

var _diffStyles2 = require('./diff-styles');

var _diffStyles3 = _interopRequireDefault(_diffStyles2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function getInteractiveLayerIds(mapStyle) {
  var interactiveLayerIds = null;

  if ((0, _isImmutableMap2.default)(mapStyle) && mapStyle.has('layers')) {
    interactiveLayerIds = mapStyle.get('layers').filter(function (l) {
      return l.get('interactive');
    }).map(function (l) {
      return l.get('id');
    }).toJS();
  } else if (Array.isArray(mapStyle.layers)) {
    interactiveLayerIds = mapStyle.layers.filter(function (l) {
      return l.interactive;
    }).map(function (l) {
      return l.id;
    });
  }

  return interactiveLayerIds;
}

// Individually update the maps source and layers that have changed if all
// other style props haven't changed. This prevents flicking of the map when
// styles only change sources or layers.
/* eslint-disable max-statements, complexity */
function setDiffStyle(prevStyle, nextStyle, map) {
  var prevKeysMap = prevStyle && styleKeysMap(prevStyle) || {};
  var nextKeysMap = styleKeysMap(nextStyle);
  function styleKeysMap(style) {
    return style.map(function () {
      return true;
    }).delete('layers').delete('sources').toJS();
  }
  function propsOtherThanLayersOrSourcesDiffer() {
    var prevKeysList = (0, _keys2.default)(prevKeysMap);
    var nextKeysList = (0, _keys2.default)(nextKeysMap);
    if (prevKeysList.length !== nextKeysList.length) {
      return true;
    }
    // `nextStyle` and `prevStyle` should not have the same set of props.
    if (nextKeysList.some(function (key) {
      return prevStyle.get(key) !== nextStyle.get(key);
    }
    // But the value of one of those props is different.
    )) {
      return true;
    }
    return false;
  }

  if (!prevStyle || propsOtherThanLayersOrSourcesDiffer()) {
    map.setStyle(nextStyle.toJS());
    return;
  }

  var _diffStyles = (0, _diffStyles3.default)(prevStyle, nextStyle),
      sourcesDiff = _diffStyles.sourcesDiff,
      layersDiff = _diffStyles.layersDiff;

  checkForEqualLayerSourceChanges(sourcesDiff.exit, nextStyle.get('layers'), function () {
    return applySourceLayerChanges(map, nextStyle, sourcesDiff, layersDiff);
  });
}

/* eslint-enable max-statements, complexity */

// Update a source in the map style
function updateStyleSource(map, update) {
  var newSource = update.source.toJS();
  if (newSource.type === 'geojson') {
    var oldSource = map.getSource(update.id);
    if (oldSource.type === 'geojson') {
      // update data if no other GeoJSONSource options were changed
      var oldOpts = oldSource.workerOptions;
      if ((newSource.maxzoom === undefined || newSource.maxzoom === oldOpts.geojsonVtOptions.maxZoom) && (newSource.buffer === undefined || newSource.buffer === oldOpts.geojsonVtOptions.buffer) && (newSource.tolerance === undefined || newSource.tolerance === oldOpts.geojsonVtOptions.tolerance) && (newSource.cluster === undefined || newSource.cluster === oldOpts.cluster) && (newSource.clusterRadius === undefined || newSource.clusterRadius === oldOpts.superclusterOptions.radius) && (newSource.clusterMaxZoom === undefined || newSource.clusterMaxZoom === oldOpts.superclusterOptions.maxZoom)) {
        oldSource.setData(newSource.data);
        return;
      }
    }
  }

  map.removeSource(update.id);
  map.addSource(update.id, newSource);
}

function applySourceLayerChanges(map, nextStyle, sourcesDiff, layersDiff) {
  // TODO: It's rather difficult to determine style diffing in the presence
  // of refs. For now, if any style update has a ref, fallback to no diffing.
  // We can come back to this case if there's a solid usecase.
  if (layersDiff.updates.some(function (node) {
    return node.layer.get('ref');
  })) {
    map.setStyle(nextStyle.toJS());
    return;
  }

  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = (0, _getIterator3.default)(sourcesDiff.enter), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var enter = _step.value;

      map.addSource(enter.id, enter.source.toJS());
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator.return) {
        _iterator.return();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }

  var _iteratorNormalCompletion2 = true;
  var _didIteratorError2 = false;
  var _iteratorError2 = undefined;

  try {
    for (var _iterator2 = (0, _getIterator3.default)(sourcesDiff.update), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
      var update = _step2.value;

      updateStyleSource(map, update);
    }
  } catch (err) {
    _didIteratorError2 = true;
    _iteratorError2 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion2 && _iterator2.return) {
        _iterator2.return();
      }
    } finally {
      if (_didIteratorError2) {
        throw _iteratorError2;
      }
    }
  }

  var _iteratorNormalCompletion3 = true;
  var _didIteratorError3 = false;
  var _iteratorError3 = undefined;

  try {
    for (var _iterator3 = (0, _getIterator3.default)(layersDiff.exiting), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
      var exit = _step3.value;

      if (map.style.getLayer(exit.id)) {
        map.removeLayer(exit.id);
      }
    }
  } catch (err) {
    _didIteratorError3 = true;
    _iteratorError3 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion3 && _iterator3.return) {
        _iterator3.return();
      }
    } finally {
      if (_didIteratorError3) {
        throw _iteratorError3;
      }
    }
  }

  var _iteratorNormalCompletion4 = true;
  var _didIteratorError4 = false;
  var _iteratorError4 = undefined;

  try {
    for (var _iterator4 = (0, _getIterator3.default)(layersDiff.updates), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
      var _update = _step4.value;

      if (!_update.enter) {
        // This is an old layer that needs to be updated. Remove the old layer
        // with the same id and add it back again.
        map.removeLayer(_update.id);
      }
      map.addLayer(_update.layer.toJS(), _update.before);
    }
  } catch (err) {
    _didIteratorError4 = true;
    _iteratorError4 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion4 && _iterator4.return) {
        _iterator4.return();
      }
    } finally {
      if (_didIteratorError4) {
        throw _iteratorError4;
      }
    }
  }

  var _iteratorNormalCompletion5 = true;
  var _didIteratorError5 = false;
  var _iteratorError5 = undefined;

  try {
    for (var _iterator5 = (0, _getIterator3.default)(sourcesDiff.exit), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
      var _exit = _step5.value;

      map.removeSource(_exit.id);
    }
  } catch (err) {
    _didIteratorError5 = true;
    _iteratorError5 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion5 && _iterator5.return) {
        _iterator5.return();
      }
    } finally {
      if (_didIteratorError5) {
        throw _iteratorError5;
      }
    }
  }
}

/* eslint-disable max-len */
function checkForEqualLayerSourceChanges(sourceExit, nextLayers, callback) {
  var sourceIds = sourceExit.map(function (s) {
    return s.id;
  });
  var layersNotRemoved = nextLayers.filter(function (lyr) {
    return sourceIds.includes(lyr.get('source'));
  });
  if (layersNotRemoved.size) {
    // because of this, no source/layer changes will take effect if there is an error
    throw new Error('You must remove any layers associated with sources you are removing: ' + layersNotRemoved.map(function (l) {
      return l.get('id');
    }).toJS().join(''));
  }
  callback();
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy91dGlscy9zdHlsZS11dGlscy5qcyJdLCJuYW1lcyI6WyJnZXRJbnRlcmFjdGl2ZUxheWVySWRzIiwic2V0RGlmZlN0eWxlIiwibWFwU3R5bGUiLCJpbnRlcmFjdGl2ZUxheWVySWRzIiwiaGFzIiwiZ2V0IiwiZmlsdGVyIiwibCIsIm1hcCIsInRvSlMiLCJBcnJheSIsImlzQXJyYXkiLCJsYXllcnMiLCJpbnRlcmFjdGl2ZSIsImlkIiwicHJldlN0eWxlIiwibmV4dFN0eWxlIiwicHJldktleXNNYXAiLCJzdHlsZUtleXNNYXAiLCJuZXh0S2V5c01hcCIsInN0eWxlIiwiZGVsZXRlIiwicHJvcHNPdGhlclRoYW5MYXllcnNPclNvdXJjZXNEaWZmZXIiLCJwcmV2S2V5c0xpc3QiLCJuZXh0S2V5c0xpc3QiLCJsZW5ndGgiLCJzb21lIiwia2V5Iiwic2V0U3R5bGUiLCJzb3VyY2VzRGlmZiIsImxheWVyc0RpZmYiLCJjaGVja0ZvckVxdWFsTGF5ZXJTb3VyY2VDaGFuZ2VzIiwiZXhpdCIsImFwcGx5U291cmNlTGF5ZXJDaGFuZ2VzIiwidXBkYXRlU3R5bGVTb3VyY2UiLCJ1cGRhdGUiLCJuZXdTb3VyY2UiLCJzb3VyY2UiLCJ0eXBlIiwib2xkU291cmNlIiwiZ2V0U291cmNlIiwib2xkT3B0cyIsIndvcmtlck9wdGlvbnMiLCJtYXh6b29tIiwidW5kZWZpbmVkIiwiZ2VvanNvblZ0T3B0aW9ucyIsIm1heFpvb20iLCJidWZmZXIiLCJ0b2xlcmFuY2UiLCJjbHVzdGVyIiwiY2x1c3RlclJhZGl1cyIsInN1cGVyY2x1c3Rlck9wdGlvbnMiLCJyYWRpdXMiLCJjbHVzdGVyTWF4Wm9vbSIsInNldERhdGEiLCJkYXRhIiwicmVtb3ZlU291cmNlIiwiYWRkU291cmNlIiwidXBkYXRlcyIsIm5vZGUiLCJsYXllciIsImVudGVyIiwiZXhpdGluZyIsImdldExheWVyIiwicmVtb3ZlTGF5ZXIiLCJhZGRMYXllciIsImJlZm9yZSIsInNvdXJjZUV4aXQiLCJuZXh0TGF5ZXJzIiwiY2FsbGJhY2siLCJzb3VyY2VJZHMiLCJzIiwibGF5ZXJzTm90UmVtb3ZlZCIsImluY2x1ZGVzIiwibHlyIiwic2l6ZSIsIkVycm9yIiwiam9pbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7UUFHZ0JBLHNCLEdBQUFBLHNCO1FBb0JBQyxZLEdBQUFBLFk7O0FBdkJoQjs7OztBQUNBOzs7Ozs7QUFFTyxTQUFTRCxzQkFBVCxDQUFnQ0UsUUFBaEMsRUFBMEM7QUFDL0MsTUFBSUMsc0JBQXNCLElBQTFCOztBQUVBLE1BQUksOEJBQWVELFFBQWYsS0FBNEJBLFNBQVNFLEdBQVQsQ0FBYSxRQUFiLENBQWhDLEVBQXdEO0FBQ3RERCwwQkFBc0JELFNBQVNHLEdBQVQsQ0FBYSxRQUFiLEVBQ25CQyxNQURtQixDQUNaO0FBQUEsYUFBS0MsRUFBRUYsR0FBRixDQUFNLGFBQU4sQ0FBTDtBQUFBLEtBRFksRUFFbkJHLEdBRm1CLENBRWY7QUFBQSxhQUFLRCxFQUFFRixHQUFGLENBQU0sSUFBTixDQUFMO0FBQUEsS0FGZSxFQUduQkksSUFIbUIsRUFBdEI7QUFJRCxHQUxELE1BS08sSUFBSUMsTUFBTUMsT0FBTixDQUFjVCxTQUFTVSxNQUF2QixDQUFKLEVBQW9DO0FBQ3pDVCwwQkFBc0JELFNBQVNVLE1BQVQsQ0FBZ0JOLE1BQWhCLENBQXVCO0FBQUEsYUFBS0MsRUFBRU0sV0FBUDtBQUFBLEtBQXZCLEVBQ25CTCxHQURtQixDQUNmO0FBQUEsYUFBS0QsRUFBRU8sRUFBUDtBQUFBLEtBRGUsQ0FBdEI7QUFFRDs7QUFFRCxTQUFPWCxtQkFBUDtBQUNEOztBQUVEO0FBQ0E7QUFDQTtBQUNBO0FBQ08sU0FBU0YsWUFBVCxDQUFzQmMsU0FBdEIsRUFBaUNDLFNBQWpDLEVBQTRDUixHQUE1QyxFQUFpRDtBQUN0RCxNQUFNUyxjQUFjRixhQUFhRyxhQUFhSCxTQUFiLENBQWIsSUFBd0MsRUFBNUQ7QUFDQSxNQUFNSSxjQUFjRCxhQUFhRixTQUFiLENBQXBCO0FBQ0EsV0FBU0UsWUFBVCxD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QU0sSUFBTixDQUFMO0FBQUEsS0FBckIsRUFBdUNJLElBQXZDLEdBQThDb0UsSUFBOUMsQ0FBbUQsRUFBbkQsQ0FBbEYsQ0FBTjtBQUNEO0FBQ0RSO0FBQ0QiLCJmaWxlIjoic3R5bGUtdXRpbHMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgaXNJbW11dGFibGVNYXAgZnJvbSAnLi9pcy1pbW11dGFibGUtbWFwJztcbmltcG9ydCBkaWZmU3R5bGVzIGZyb20gJy4vZGlmZi1zdHlsZXMnO1xuXG5leHBvcnQgZnVuY3Rpb24gZ2V0SW50ZXJhY3RpdmVMYXllcklkcyhtYXBTdHlsZSkge1xuICBsZXQgaW50ZXJhY3RpdmVMYXllcklkcyA9IG51bGw7XG5cbiAgaWYgKGlzSW1tdXRhYmxlTWFwKG1hcFN0eWxlKSAmJiBtYXBTdHlsZS5oYXMoJ2xheWVycycpKSB7XG4gICAgaW50ZXJhY3RpdmVMYXllcklkcyA9IG1hcFN0eWxlLmdldCgnbGF5ZXJzJylcbiAgICAgIC5maWx0ZXIobCA9PiBsLmdldCgnaW50ZXJhY3RpdmUnKSlcbiAgICAgIC5tYXAobCA9PiBsLmdldCgnaWQnKSlcbiAgICAgIC50b0pTKCk7XG4gIH0gZWxzZSBpZiAoQXJyYXkuaXNBcnJheShtYXBTdHlsZS5sYXllcnMpKSB7XG4gICAgaW50ZXJhY3RpdmVMYXllcklkcyA9IG1hcFN0eWxlLmxheWVycy5maWx0ZXIobCA9PiBsLmludGVyYWN0aXZlKVxuICAgICAgLm1hcChsID0+IGwuaWQpO1xuICB9XG5cbiAgcmV0dXJuIGludGVyYWN0aXZlTGF5ZXJJZHM7XG59XG5cbi8vIEluZGl2aWR1YWxseSB1cGRhdGUgdGhlIG1hcHMgc291cmNlIGFuZCBsYXllcnMgdGhhdCBoYXZlIGNoYW5nZWQgaWYgYWxsXG4vLyBvdGhlciBzdHlsZSBwcm9wcyBoYXZlbid0IGNoYW5nZWQuIFRoaXMgcHJldmVudHMgZmxpY2tpbmcgb2YgdGhlIG1hcCB3aGVuXG4vLyBzdHlsZXMgb25seSBjaGFuZ2Ugc291cmNlcyBvciBsYXllcnMuXG4vKiBlc2xpbnQtZGlzYWJsZSBtYXgtc3RhdGVtZW50cywgY29tcGxleGl0eSAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNldERpZmZTdHlsZShwcmV2U3R5bGUsIG5leHRTdHlsZSwgbWFwKSB7XG4gIGNvbnN0IHByZXZLZXlzTWFwID0gcHJldlN0eWxlICYmIHN0eWxlS2V5c01hcChwcmV2U3R5bGUpIHx8IHt9O1xuICBjb25zdCBuZXh0S2V5c01hcCA9IHN0eWxlS2V5c01hcChuZXh0U3R5bGUpO1xuICBmdW5jdGlvbiBzdHlsZUtleXNNYXAoc3R5bGUpIHtcbiAgICByZXR1cm4gc3R5bGUubWFwKCgpID0+IHRydWUpLmRlbGV0ZSgnbGF5ZXJzJykuZGVsZXRlKCdzb3VyY2VzJykudG9KUygpO1xuICB9XG4gIGZ1bmN0aW9uIHByb3BzT3RoZXJUaGFuTGF5ZXJzT3JTb3VyY2VzRGlmZmVyKCkge1xuICAgIGNvbnN0IHByZXZLZXlzTGlzdCA9IE9iamVjdC5rZXlzKHByZXZLZXlzTWFwKTtcbiAgICBjb25zdCBuZXh0S2V5c0xpc3QgPSBPYmplY3Qua2V5cyhuZXh0S2V5c01hcCk7XG4gICAgaWYgKHByZXZLZXlzTGlzdC5sZW5ndGggIT09IG5leHRLZXlzTGlzdC5sZW5ndGgpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICAvLyBgbmV4dFN0eWxlYCBhbmQgYHByZXZTdHlsZWAgc2hvdWxkIG5vdCBoYXZlIHRoZSBzYW1lIHNldCBvZiBwcm9wcy5cbiAgICBpZiAobmV4dEtleXNMaXN0LnNvbWUoXG4gICAgICBrZXkgPT4gcHJldlN0eWxlLmdldChrZXkpICE9PSBuZXh0U3R5bGUuZ2V0KGtleSlcbiAgICAgIC8vIEJ1dCB0aGUgdmFsdWUgb2Ygb25lIG9mIHRob3NlIHByb3BzIGlzIGRpZmZlcmVudC5cbiAgICApKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgaWYgKCFwcmV2U3R5bGUgfHwgcHJvcHNPdGhlclRoYW5MYXllcnNPclNvdXJjZXNEaWZmZXIoKSkge1xuICAgIG1hcC5zZXRTdHlsZShuZXh0U3R5bGUudG9KUygpKTtcbiAgICByZXR1cm47XG4gIH1cblxuICBjb25zdCB7c291cmNlc0RpZmYsIGxheWVyc0RpZmZ9ID0gZGlmZlN0eWxlcyhwcmV2U3R5bGUsIG5leHRTdHlsZSk7XG4gIGNoZWNrRm9yRXF1YWxMYXllclNvdXJjZUNoYW5nZXMoc291cmNlc0RpZmYuZXhpdCwgbmV4dFN0eWxlLmdldCgnbGF5ZXJzJyksXG4gICAgKCkgPT4gYXBwbHlTb3VyY2VMYXllckNoYW5nZXMobWFwLCBuZXh0U3R5bGUsIHNvdXJjZXNEaWZmLCBsYXllcnNEaWZmKVxuICApO1xufVxuXG4vKiBlc2xpbnQtZW5hYmxlIG1heC1zdGF0ZW1lbnRzLCBjb21wbGV4aXR5ICovXG5cbi8vIFVwZGF0ZSBhIHNvdXJjZSBpbiB0aGUgbWFwIHN0eWxlXG5mdW5jdGlvbiB1cGRhdGVTdHlsZVNvdXJjZShtYXAsIHVwZGF0ZSkge1xuICBjb25zdCBuZXdTb3VyY2UgPSB1cGRhdGUuc291cmNlLnRvSlMoKTtcbiAgaWYgKG5ld1NvdXJjZS50eXBlID09PSAnZ2VvanNvbicpIHtcbiAgICBjb25zdCBvbGRTb3VyY2UgPSBtYXAuZ2V0U291cmNlKHVwZGF0ZS5pZCk7XG4gICAgaWYgKG9sZFNvdXJjZS50eXBlID09PSAnZ2VvanNvbicpIHtcbiAgICAgIC8vIHVwZGF0ZSBkYXRhIGlmIG5vIG90aGVyIEdlb0pTT05Tb3VyY2Ugb3B0aW9ucyB3ZXJlIGNoYW5nZWRcbiAgICAgIGNvbnN0IG9sZE9wdHMgPSBvbGRTb3VyY2Uud29ya2VyT3B0aW9ucztcbiAgICAgIGlmIChcbiAgICAgICAgKG5ld1NvdXJjZS5tYXh6b29tID09PSB1bmRlZmluZWQgfHxcbiAgICAgICAgICBuZXdTb3VyY2UubWF4em9vbSA9PT0gb2xkT3B0cy5nZW9qc29uVnRPcHRpb25zLm1heFpvb20pICYmXG4gICAgICAgIChuZXdTb3VyY2UuYnVmZmVyID09PSB1bmRlZmluZWQgfHxcbiAgICAgICAgICBuZXdTb3VyY2UuYnVmZmVyID09PSBvbGRPcHRzLmdlb2pzb25WdE9wdGlvbnMuYnVmZmVyKSAmJlxuICAgICAgICAobmV3U291cmNlLnRvbGVyYW5jZSA9PT0gdW5kZWZpbmVkIHx8XG4gICAgICAgICAgbmV3U291cmNlLnRvbGVyYW5jZSA9PT0gb2xkT3B0cy5nZW9qc29uVnRPcHRpb25zLnRvbGVyYW5jZSkgJiZcbiAgICAgICAgKG5ld1NvdXJjZS5jbHVzdGVyID09PSB1bmRlZmluZWQgfHxcbiAgICAgICAgICBuZXdTb3VyY2UuY2x1c3RlciA9PT0gb2xkT3B0cy5jbHVzdGVyKSAmJlxuICAgICAgICAobmV3U291cmNlLmNsdXN0ZXJSYWRpdXMgPT09IHVuZGVmaW5lZCB8fFxuICAgICAgICAgIG5ld1NvdXJjZS5jbHVzdGVyUmFkaXVzID09PSBvbGRPcHRzLnN1cGVyY2x1c3Rlck9wdGlvbnMucmFkaXVzKSAmJlxuICAgICAgICAobmV3U291cmNlLmNsdXN0ZXJNYXhab29tID09PSB1bmRlZmluZWQgfHxcbiAgICAgICAgICBuZXdTb3VyY2UuY2x1c3Rlck1heFpvb20gPT09IG9sZE9wdHMuc3VwZXJjbHVzdGVyT3B0aW9ucy5tYXhab29tKVxuICAgICAgKSB7XG4gICAgICAgIG9sZFNvdXJjZS5zZXREYXRhKG5ld1NvdXJjZS5kYXRhKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIG1hcC5yZW1vdmVTb3VyY2UodXBkYXRlLmlkKTtcbiAgbWFwLmFkZFNvdXJjZSh1cGRhdGUuaWQsIG5ld1NvdXJjZSk7XG59XG5cbmZ1bmN0aW9uIGFwcGx5U291cmNlTGF5ZXJDaGFuZ2VzKG1hcCwgbmV4dFN0eWxlLCBzb3VyY2VzRGlmZiwgbGF5ZXJzRGlmZikge1xuLy8gVE9ETzogSXQncyByYXRoZXIgZGlmZmljdWx0IHRvIGRldGVybWluZSBzdHlsZSBkaWZmaW5nIGluIHRoZSBwcmVzZW5jZVxuICAvLyBvZiByZWZzLiBGb3Igbm93LCBpZiBhbnkgc3R5bGUgdXBkYXRlIGhhcyBhIHJlZiwgZmFsbGJhY2sgdG8gbm8gZGlmZmluZy5cbiAgLy8gV2UgY2FuIGNvbWUgYmFjayB0byB0aGlzIGNhc2UgaWYgdGhlcmUncyBhIHNvbGlkIHVzZWNhc2UuXG4gIGlmIChsYXllcnNEaWZmLnVwZGF0ZXMuc29tZShub2RlID0+IG5vZGUubGF5ZXIuZ2V0KCdyZWYnKSkpIHtcbiAgICBtYXAuc2V0U3R5bGUobmV4dFN0eWxlLnRvSlMoKSk7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgZm9yIChjb25zdCBlbnRlciBvZiBzb3VyY2VzRGlmZi5lbnRlcikge1xuICAgIG1hcC5hZGRTb3VyY2UoZW50ZXIuaWQsIGVudGVyLnNvdXJjZS50b0pTKCkpO1xuICB9XG4gIGZvciAoY29uc3QgdXBkYXRlIG9mIHNvdXJjZXNEaWZmLnVwZGF0ZSkge1xuICAgIHVwZGF0ZVN0eWxlU291cmNlKG1hcCwgdXBkYXRlKTtcbiAgfVxuXG4gIGZvciAoY29uc3QgZXhpdCBvZiBsYXllcnNEaWZmLmV4aXRpbmcpIHtcbiAgICBpZiAobWFwLnN0eWxlLmdldExheWVyKGV4aXQuaWQpKSB7XG4gICAgICBtYXAucmVtb3ZlTGF5ZXIoZXhpdC5pZCk7XG4gICAgfVxuICB9XG4gIGZvciAoY29uc3QgdXBkYXRlIG9mIGxheWVyc0RpZmYudXBkYXRlcykge1xuICAgIGlmICghdXBkYXRlLmVudGVyKSB7XG4gICAgICAvLyBUaGlzIGlzIGFuIG9sZCBsYXllciB0aGF0IG5lZWRzIHRvIGJlIHVwZGF0ZWQuIFJlbW92ZSB0aGUgb2xkIGxheWVyXG4gICAgICAvLyB3aXRoIHRoZSBzYW1lIGlkIGFuZCBhZGQgaXQgYmFjayBhZ2Fpbi5cbiAgICAgIG1hcC5yZW1vdmVMYXllcih1cGRhdGUuaWQpO1xuICAgIH1cbiAgICBtYXAuYWRkTGF5ZXIodXBkYXRlLmxheWVyLnRvSlMoKSwgdXBkYXRlLmJlZm9yZSk7XG4gIH1cblxuICBmb3IgKGNvbnN0IGV4aXQgb2Ygc291cmNlc0RpZmYuZXhpdCkge1xuICAgIG1hcC5yZW1vdmVTb3VyY2UoZXhpdC5pZCk7XG4gIH1cbn1cblxuLyogZXNsaW50LWRpc2FibGUgbWF4LWxlbiAqL1xuZnVuY3Rpb24gY2hlY2tGb3JFcXVhbExheWVyU291cmNlQ2hhbmdlcyhzb3VyY2VFeGl0LCBuZXh0TGF5ZXJzLCBjYWxsYmFjaykge1xuICBjb25zdCBzb3VyY2VJZHMgPSBzb3VyY2VFeGl0Lm1hcChzID0+IHMuaWQpO1xuICBjb25zdCBsYXllcnNOb3RSZW1vdmVkID0gbmV4dExheWVycy5maWx0ZXIobHlyID0+IHNvdXJjZUlkcy5pbmNsdWRlcyhseXIuZ2V0KCdzb3VyY2UnKSkpO1xuICBpZiAobGF5ZXJzTm90UmVtb3ZlZC5zaXplKSB7XG4gICAgLy8gYmVjYXVzZSBvZiB0aGlzLCBubyBzb3VyY2UvbGF5ZXIgY2hhbmdlcyB3aWxsIHRha2UgZWZmZWN0IGlmIHRoZXJlIGlzIGFuIGVycm9yXG4gICAgdGhyb3cgbmV3IEVycm9yKGBZb3UgbXVzdCByZW1vdmUgYW55IGxheWVycyBhc3NvY2lhdGVkIHdpdGggc291cmNlcyB5b3UgYXJlIHJlbW92aW5nOiAke2xheWVyc05vdFJlbW92ZWQubWFwKGwgPT4gbC5nZXQoJ2lkJykpLnRvSlMoKS5qb2luKCcnKX1gKTtcbiAgfVxuICBjYWxsYmFjaygpO1xufVxuIl19