import { Link } from 'react-router-dom';
import MapSettingsLayers from "./MapSettingsLayers";
import { useMap } from './MapContext';

const MapLegend = (props) => {

  const {
    mapHasInit
  } = useMap();

  return(
    <div id="mapBottom">
      {
        mapHasInit &&
        <MapSettingsLayers features={props.features}/>
      }
      <p id="mapBottomText">
      Le <Link to="/">Tribunal des Préjugés</Link> est un terrain d’expérimentations et d’échanges pour interroger et chercher de nouveaux outils de déconstruction des préjugés liés au territoire.
      </p>
    </div>
  )
}

export default MapLegend
