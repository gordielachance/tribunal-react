import { Icon } from 'semantic-ui-react';
import {getFormatText,getFeaturesFormats} from "./MapFunctions";
import { useMap } from './MapContext';
import FilterItem from './FilterItem';

const FilterAreas = props => {

  const {
    mapAreaCollection,
    toggleIsolateArea,
    disabledAreaIds,
    setDisabledAreaIds,
    getFeaturesByAreaId
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

          const allFeatureCount = (getFeaturesByAreaId(feature.properties.id) || []).length;

          return(
            <FilterItem
            key={k}
            label={feature.properties.mun_name_fr}
            disabled={isDisabled(feature)}
            onClick={e=>{handleClick(e,feature)}}
            onMouseEnter={e=>toggleIsolateArea(feature,true)}
            onMouseLeave={e=>toggleIsolateArea(feature,false)}
            count={allFeatureCount}
            />
          )
        })
      }
    </ul>
  )
}

export default FilterAreas
