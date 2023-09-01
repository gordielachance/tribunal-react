import { Icon } from 'semantic-ui-react';
import {getFormatText,getFeaturesFormats,getIdsForFormat} from "./MapFunctions";
import { useMap } from './MapContext';
import FilterItem from './FilterItem';

const MapSettingsAreas = props => {

  const {
    mapAreaCollection,
    toggleIsolateArea,
    disabledAreaIds,
    setDisabledAreaIds
  } = useMap();

  const handleClick = (e,feature) => {
    const featureId = feature.properties.id;
    const newDisabled = [...disabledAreaIds || []];
    const index = newDisabled.indexOf(featureId);

    if (index > -1) {//exists in array
      newDisabled.splice(index, 1);
    }else{
      newDisabled.push(featureId);
    }

    setDisabledAreaIds(newDisabled);

  }


  const isDisabled = feature => {
    return (disabledAreaIds || []).includes(feature.properties.id);
  }

  return(
    <ul className="map-filter-areas">
      {
        mapAreaCollection().map(function(feature,k) {
          return(
            <FilterItem
            key={k}
            label={feature.properties.mun_name_fr}
            disabled={isDisabled(feature)}
            onClick={e=>{handleClick(e,feature)}}
            onMouseEnter={e=>toggleIsolateArea(feature,true)}
            onMouseLeave={e=>toggleIsolateArea(feature,false)}
            //renderedCount={renderedFeatureCount}
            //totalCount={allFeatureCount}
            />
          )
        })
      }
    </ul>
  )
}

export default MapSettingsAreas
