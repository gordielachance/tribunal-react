import { Icon } from 'semantic-ui-react';
import {getFormatIcon,getFormatText,getFeaturesFormats,getIdsForFormat} from "./MapFunctions";
import { useMap } from './MapContext';


const MapSettingsAreas = props => {

  const {
    mapAreaCollection,
    toggleIsolateArea,
    disabledAreaIds,
    setDisabledAreaIds
  } = useMap();

  const handleClick = feature => {
    const featureId = feature.properties.id;
    const newDisabled = [...disabledAreaIds];
    const index = newDisabled.indexOf(featureId);

    if (index > -1) {//exists in array
      newDisabled.splice(index, 1);
    }else{
      newDisabled.push(featureId);
    }

    setDisabledAreaIds(newDisabled);

  }


  const isDisabled = feature => {
    return disabledAreaIds.includes(feature.properties.id);
  }

  return(
    <ul className="map-filter-areas">
      {
        mapAreaCollection().map(function(feature,k) {

          return(
            <li
            key={k}
            onClick={e=>{handleClick(feature)}}
            className={!isDisabled(feature) ? 'active' : ''}
            onMouseEnter={e=>toggleIsolateArea(feature,true)}
            onMouseLeave={e=>toggleIsolateArea(feature,false)}
            >
              <span><Icon name="check"/></span>
              {feature.properties.mun_name_fr}
            </li>
          )
        })
      }
    </ul>
  )
}

export default MapSettingsAreas
