import { Link } from 'react-router-dom';
import { useMap } from './MapContext';

const MapLegend = (props) => {

  const {
    mapHasInit,
    featuresList
  } = useMap();

  return(
    <div id="mapBottom">
      <p id="mapBottomText">
      Le <Link to="/">Tribunal des Préjugés</Link> est un terrain d’expérimentations et d’échanges pour interroger et chercher de nouveaux outils de déconstruction des préjugés liés au territoire.
      </p>
    </div>
  )
}

export default MapLegend
