import { Icon } from 'semantic-ui-react';
import { useMap } from './MapContext';
import classNames from "classnames";

const LayerLegendItem = props => {

  const getLayerText = layerId => {

    switch(layerId){
      case 'creations':
        return 'Créations'
      break;
      case 'annotations':
        return 'Géographie subjective'
      break;
      case 'events':
        return 'Évènements'
      break;
      case 'partners':
        return 'Partenaires'
      break;
      default:
        return layerId
    }
  }

  const layerText = getLayerText(props.layerId);

  return(
    <span
    onClick={props.onClick}
    className={classNames({
      'legend-source':true,
      active:props.active
    })}
    data-layerid={props.layerId}>
        <nobr>
          <span className="layer-icon"><Icon name="circle" /></span>{layerText}
        </nobr>
      </span>
  )
}

const MapSettingsLayers = (props) => {

  const {
    mapData,
    mapboxMap,
    toggleMapLayer,
  } = useMap();

  const allowedLayers = ['creations','annotations','events','partners'];
  const initialLayers = mapData?.layers ?
    Object.keys(mapData.layers).map(function(key, index) {
      return key;
    })
    : [];

  const layerIds = allowedLayers.filter( layerId => initialLayers.includes(layerId) );
  const activeLayerIds = layerIds.filter(layerId => {
    const layerExists = mapboxMap.getLayer(layerId) !== undefined;
    if (!layerExists) return false;
    return (mapboxMap.getLayoutProperty(layerId, 'visibility') !== 'none')
  })

  return(
    <div id="map-settings-layers">
      <h5>Calques</h5>
      <ul>
      {
        layerIds.map((layerId,k) => {
          const isActive = activeLayerIds.includes(layerId);
          return(
            <li key={k}>
            <LayerLegendItem
            layerId={layerId}
            active={isActive}
            onClick={(e)=>toggleMapLayer(layerId)}
            /></li>
          )
        })
      }
      </ul>
    </div>
  )
}

export default MapSettingsLayers
