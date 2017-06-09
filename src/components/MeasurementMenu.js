import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { setTool } from 'fm3/actions/mainActions';
import { distanceMeasurementExportGpx } from 'fm3/actions/distanceMeasurementActions';
import { elevationChartSetTrackGeojson, elevationChartClose } from 'fm3/actions/elevationChartActions';

import Nav from 'react-bootstrap/lib/Nav';
import NavItem from 'react-bootstrap/lib/NavItem';
import FontAwesomeIcon from 'fm3/components/FontAwesomeIcon';
import ButtonGroup from 'react-bootstrap/lib/ButtonGroup';
import Navbar from 'react-bootstrap/lib/Navbar';
import Glyphicon from 'react-bootstrap/lib/Glyphicon';
import Button from 'react-bootstrap/lib/Button';
import * as FmPropTypes from 'fm3/propTypes';

class MeasurementMenu extends React.Component {
  toggleElevationChart = () => {
    const isActive = this.props.elevationChartTrackGeojson;
    if (isActive) {
      this.props.onElevationChartClose();
    } else {
      const geojson = {
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: this.props.points.map(p => [p.lon, p.lat]),
        },
      };
      this.props.onElevationChartTrackGeojsonSet(geojson);
    }
  }

  render() {
    const { onCancel, onToolSet, tool, onGpxExport, routeDefined, elevationChartTrackGeojson } = this.props;
    // FIXME wrapper element Nav is not OK here. Actually no wrapper element must be used.
    return (
      <div>
        <Navbar.Form pullLeft>
          <ButtonGroup>
            <Button onClick={() => onToolSet('measure')} active={tool === 'measure'} title="Vzdialenosť">
              <FontAwesomeIcon icon="arrows-h" /><span className="hidden-sm"> Vzdialenosť</span>
            </Button>
            <Button onClick={() => onToolSet('measure-ele')} active={tool === 'measure-ele'} title="Výška a poloha">
              <FontAwesomeIcon icon="long-arrow-up" /><span className="hidden-sm"> Výška a poloha</span>
            </Button>
            <Button onClick={() => onToolSet('measure-area')} active={tool === 'measure-area'} title="Plocha">
              <FontAwesomeIcon icon="square" /><span className="hidden-sm"> Plocha</span>
            </Button>
          </ButtonGroup>
          {' '}
          {tool === 'measure' && routeDefined &&
            <Button active={elevationChartTrackGeojson !== null} onClick={this.toggleElevationChart}>
              <FontAwesomeIcon icon="bar-chart" /><span className="hidden-sm"> Výškový profil</span>
            </Button>
          }
          {' '}
          {tool === 'measure' &&
            <Button onClick={onGpxExport} disabled={!routeDefined} title="Exportuj do GPX">
              <FontAwesomeIcon icon="share" /><span className="hidden-sm"> Exportuj do GPX</span>
            </Button>
          }
        </Navbar.Form>
        <Nav pullRight>
          <NavItem onClick={onCancel}><Glyphicon glyph="remove" /> Zavrieť</NavItem>
        </Nav>
      </div>
    );
  }
}

MeasurementMenu.propTypes = {
  tool: FmPropTypes.tool,
  onToolSet: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  onGpxExport: PropTypes.func.isRequired,
  points: FmPropTypes.points.isRequired,
  routeDefined: PropTypes.bool.isRequired,
  onElevationChartTrackGeojsonSet: PropTypes.func.isRequired,
  onElevationChartClose: PropTypes.func.isRequired,
  elevationChartTrackGeojson: PropTypes.object, // eslint-disable-line
};

export default connect(
  state => ({
    tool: state.main.tool,
    points: state.distanceMeasurement.points,
    routeDefined: state.distanceMeasurement.points.length > 1,
    elevationChartTrackGeojson: state.elevationChart.trackGeojson,
  }),
  dispatch => ({
    onToolSet(tool) {
      dispatch(setTool(tool));
    },
    onCancel() {
      dispatch(setTool(null));
    },
    onGpxExport() {
      dispatch(distanceMeasurementExportGpx());
    },
    onElevationChartTrackGeojsonSet(trackGeojson) {
      dispatch(elevationChartSetTrackGeojson(trackGeojson));
    },
    onElevationChartClose() {
      dispatch(elevationChartClose());
    },
  }),
)(MeasurementMenu);
