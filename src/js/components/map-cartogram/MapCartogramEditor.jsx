/*
 * ### Editor interface for 50-state map
 */
import React, {PropTypes} from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import update from 'react-addons-update';

const NumericScaleSettings = require("../shared/NumericScaleSettings.jsx");
const Map_ScaleSettings = require("../shared/Cartogram_ScaleSettings.jsx");

const cx = require("classnames");
import {bind, clone, each, keys, map} from 'lodash';

/* Shared Chartbuilder components */
const DataInput = require("../shared/DataInput.jsx");

/* Chartbuilder UI components */
import {ColorPicker, Dropdown, LabelledTangle, TextInput, Toggle} from 'chartbuilder-ui';

const colorScales = require('./../../util/colorscales');
const MapEditorMixin = require("../mixins/MapEditorMixin.js");

/**
 * ### Editor interface for a XY chart
 * @property {object} chartProps - Properties used to draw this chart
 * @property {number} numSteps - Allow the rendered component to interacted with and edited
 * @instance
 * @memberof editors
 */
let MapEditor = React.createClass({

  propTypes: {
    errors: PropTypes.object,
    chartProps: PropTypes.shape({
      input: PropTypes.object.isRequired,
      chartSettings: PropTypes.array,
      entries: PropTypes.array,
      data: PropTypes.array,
      scale: PropTypes.object,
      _annotations: PropTypes.object
    }),
    numSteps: PropTypes.number
  },

  mixins: [MapEditorMixin],

  getDefaultProps: function() {
    return {
      numSteps: 4
    };
  },
  render: function() {
    let mapProps = this.props.chartProps;
    /* Create a settings component for each data series (column) */
    const mapSettings = [];

    mapSettings.push(map(mapProps.chartSettings, bind(function(chartSetting, i) {

      return (
        <div>
          <MapCartogram_mapSettings
            chartSettings={mapProps.chartSettings}
            onUpdate={this._handlePropUpdate.bind(null, "chartSettings")}
            onUpdateReparse={this._handlePropAndReparse.bind(null, "chartSettings")}
            numColors={this.props.numColors}
            stylings={this.props.chartProps.stylings}
            index={i}
            key={i}
          />

          <Map_ScaleSettings
            stylings={this.props.chartProps.stylings}
            scale={mapProps.scale}
            className="scale-options"
            onUpdate={this._handlePropAndReparse.bind(null, "scale")}
            onReset={this._handlePropAndReparse.bind(null, "scale")}
            id={chartSetting.label}
            name={chartSetting.label}
            stepNumber="0"
            index={i}
            key={i + '-scale'}
          />
        </div>
      );
    }, this)) );

    let axisErrors = this.props.errors.messages.filter(function(e) {
      return e.location === "axis";
    });

    let inputErrors = this.props.errors.messages.filter(function(e) {
      return e.location === "input";
    });

    return (
      <div className="xy-editor">
        <div className="editor-options">
          <h2>
            <span className="step-number">2</span>
            <span>Input your data</span>
          </h2>
          <DataInput
            errors={inputErrors}
            chartProps={mapProps}
            className="data-input"
          />
        </div>
        <div className="editor-options">
          <h2>
            <span className="step-number">3</span>
            <span>Set series options</span>
          </h2>
          {mapSettings}
        </div>
        <div className="editor-options">
        </div>
      </div>
    );
  }
});


/**
 * Series-specific settings for each column in data
 * @property {boolean} allowSecondaryAxis - Should a secondary axis be allowed
 * @property {object[]} chartSettings - Current settings for data series
 * @property {function} onUpdate - Callback that handles new series settings
 * @property {function} onUpdateReparse - Callback that handles new series settings,
 * but which need to be sent back to `parse-xy`
 * @property {number} numColors - Total number of possible colors
 * @instance
 * @memberof XYEditor
 */
const MapCartogram_mapSettings = React.createClass({

  propTypes: {
    chartSettings: PropTypes.array,
    numColors: PropTypes.number
  },

  _handleSettingsUpdate: function(ix, k, v) {

    /* Clone the array of objects so that we dont mutate existing state */
    let chartSettings = map(this.props.chartSettings, clone);
    /* We need the index (ix) of the settings object to know which to update */
    chartSettings[ix][k] = v;
    /* `axis` and `colorIndex` require reparsing the input and splitting it up */
    this.props.onUpdateReparse(chartSettings);
  },

  render: function() {

    const chartSetting = this.props.chartSettings[this.props.index];
    const numColors = colorScales.scalesNum();

    return (
      <div className="series-control">
        <TextInput
          type="text"
          label={chartSetting.label}
          value={chartSetting.label}
          onChange={this._handleSettingsUpdate.bind(null, this.props.index, "label")}
          className={"series-label-input series-label-input-" + chartSetting.colorIndex}
        />
        <h3 className={"series-label series-label-" + chartSetting.colorIndex}>
        </h3>

        <div className="section axis-color">
          <div className="section colorsection">
            <ColorPicker
              onChange={this._handleSettingsUpdate.bind(null, this.props.index, "colorIndex")}
              numColors={numColors}
              index={this.props.index}
              colorIndex={chartSetting.colorIndex}
              labelText="Color"
            />
          </div>
        </div>

        <div className="clearfix"></div>
      </div>
    );
  }
});

module.exports = MapEditor;
