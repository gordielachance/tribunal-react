import { Icon,Label } from 'semantic-ui-react';
import {getFormatText,getFeaturesFormats} from "./MapFunctions";
import { useMap } from './MapContext';
import FilterItem from './FilterItem';

const FilterFormats = props => {

  const {
    mapData,
    disabledFormatIds,
    setDisabledFormatIds,
    toggleIsolateFormat,
    featuresList,
    getFeaturesByFormat
  } = useMap();

  const handleClick = (e,slug) => {

    const newDisabled = [...disabledFormatIds || []];
    const index = newDisabled.indexOf(slug);

    if (index > -1) {//exists in array
      newDisabled.splice(index, 1);
    }else{
      newDisabled.push(slug);
    }

    setDisabledFormatIds(newDisabled);

  }

  const isDisabled = slug => {
    return (disabledFormatIds || []).includes(slug);
  }

  return(
    <ul className="map-filter-formats">
      {
        (props.items||[]).map(function(slug,k) {
          const allFeatureCount = getFeaturesByFormat(slug).length;
          const formatText = getFormatText(slug);

          return(
            <FilterItem
            key={k}
            label={formatText}
            disabled={isDisabled(slug)}
            onClick={e=>{handleClick(e,slug)}}
            onMouseEnter={e=>toggleIsolateFormat(slug,true)}
            onMouseLeave={e=>toggleIsolateFormat(slug,false)}
            count={allFeatureCount}
            />
          )
        })
      }
    </ul>
  )
}

export default FilterFormats
