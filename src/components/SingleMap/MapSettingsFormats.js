import { Icon,Label } from 'semantic-ui-react';
import {getFormatIcon,getFormatText,getFeaturesFormats,getIdsForFormat} from "./MapFunctions";
import { useMap } from './MapContext';

const MapSettingsFormats = props => {

  const {
    mapData,
    disabledFormats,
    setDisabledFormats,
    toggleHoverFormat,
    mapRenderedFeatures,
    mapFeatureCollection
  } = useMap();

  const handleClick = slug => {

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
    <div id="map-settings-formats">
      <h5>Discipline</h5>
      <ul id="formats-list" className="features-selection">
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
              onClick={e=>{handleClick(slug)}}
              onMouseEnter={e=>toggleHoverFormat(slug,true)}
              onMouseLeave={e=>toggleHoverFormat(slug,false)}
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
    </div>
  )
}

export default MapSettingsFormats
