import { Icon,Label } from 'semantic-ui-react';
import {getFormatText,getFeaturesFormats,getIdsForFormat} from "./MapFunctions";
import { useMap } from './MapContext';
import FilterItem from './FilterItem';

const MapSettingsFormats = props => {

  const {
    mapData,
    disabledFormats,
    setDisabledFormats,
    toggleIsolateFormat,
    mapRenderedFeatures,
    mapFeatureCollection
  } = useMap();

  const handleClick = (e,slug) => {

    const newDisabled = [...disabledFormats];
    const index = newDisabled.indexOf(slug);

    if (index > -1) {//exists in array
      newDisabled.splice(index, 1);
    }else{
      newDisabled.push(slug);
    }

    setDisabledFormats(newDisabled);

  }

  const isDisabled = slug => {
    return disabledFormats.includes(slug);
  }

  return(
    <ul className="map-filter-formats">
      {
        (props.items||[]).map(function(slug,k) {
          const allFeatureCount = getIdsForFormat(slug,mapFeatureCollection()).length;
          const renderedFeatureCount = getIdsForFormat(slug,mapRenderedFeatures).length;
          const formatText = getFormatText(slug);

          return(
            <FilterItem
            key={k}
            label={formatText}
            disabled={isDisabled(slug)}
            onClick={e=>{handleClick(e,slug)}}
            onMouseEnter={e=>toggleIsolateFormat(slug,true)}
            onMouseLeave={e=>toggleIsolateFormat(slug,false)}
            renderedCount={renderedFeatureCount}
            totalCount={allFeatureCount}
            />
          )
        })
      }
    </ul>
  )
}

export default MapSettingsFormats
