import { Icon } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import { useMap } from './MapContext';

const SourceLegendItem = props => {
  const source = props.source;

  const getSourceText = source => {
    switch(source){
      case 'creations':
        return 'Créations'
      break;
      case 'annotations':
        return 'Géographie subjective'
      break;
      case 'events':
        return 'Évènements'
      break;
    }
  }

  const sourceText = getSourceText(source);

  return(
    <span className='legend-source' data-source={source}><span className="source-icon"><Icon name="circle" /></span>{sourceText}</span>
  )
}

const MapLegend = (props) => {

  const {
    mapboxMap
  } = useMap();

  const features = (props.features || []);

  const sources = [...new Set(features.map(feature => feature.source))];

  const toggleLayer = layerId => {

    alert(layerId);

    const value = ( mapboxMap.getLayoutProperty(layerId, 'visibility') === 'visible' ) ? 'none' : 'visible';//toggle

    mapboxMap.setLayoutProperty(layerId, 'visibility',value);
    console.log("TOGGLED VISIBILITY FOR LAYER #",layerId,value);
  }

  return(
    <div id="mapBottom">
      {
        (sources.length > 0) &&
        <ul id="mapLegend">
        {
          sources.map((source,k) => {
            return(
              <li key={k}><SourceLegendItem source={source} onClick={(e)=>toggleLayer(source)}/></li>
            )
          })
        }
        </ul>
      }
      <p id="mapBottomText">
      Le <Link to="/">Tribunal des Préjugés</Link> est un terrain d’expérimentations et d’échanges pour interroger et chercher de nouveaux outils de déconstruction des préjugés liés au territoire.
      </p>
    </div>
  )
}

export default MapLegend
