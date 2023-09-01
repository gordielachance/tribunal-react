import { Icon,Label } from 'semantic-ui-react';
import {getFormatIcon,getFormatText,getFeaturesFormats,getIdsForFormat} from "./MapFunctions";
import { useMap } from './MapContext';

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
        (props.items||[]).map(function(slug) {
          const allFeatureCount = getIdsForFormat(slug,mapFeatureCollection()).length;
          const renderedFeatureCount = getIdsForFormat(slug,mapRenderedFeatures).length;

          const formatIcon = getFormatIcon(slug);
          const formatText = getFormatText(slug);

          return(
            <li
            key={slug}
            className={!isDisabled(slug) ? 'active' : ''}
            onClick={e=>{handleClick(e,slug)}}
            onMouseEnter={e=>toggleIsolateFormat(slug,true)}
            onMouseLeave={e=>toggleIsolateFormat(slug,false)}
            >
              <span><Icon name="check"/></span>
              <span>
              {formatIcon &&
                <Icon name={formatIcon}/>
              }
              {formatText}
              </span>
              <Label className="count">{renderedFeatureCount}/{allFeatureCount}</Label>
            </li>
          )
        })
      }
    </ul>
  )
}

export default MapSettingsFormats
