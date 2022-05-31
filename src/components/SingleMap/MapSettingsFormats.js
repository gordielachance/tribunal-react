import { Icon } from 'semantic-ui-react';
import {getFormatIcon,getFormatText,getFeaturesFormats,getIdsForFormat} from "./MapFunctions";
import { useMap } from './MapContext';

const MapSettingsFormats = props => {

  const {
    mapData,
    markerFormatsDisabled,
    setMarkerFormatsDisabled,
    toggleHoverFormat
  } = useMap();

  const creationFeatures = mapData?.sources.creations?.data.features || [];
  const allFeatures = creationFeatures;

  const handleClick = slug => {

    const newDisabled = [...markerFormatsDisabled];
    const index = newDisabled.indexOf(slug);

    if (index > -1) {//exists in array
      newDisabled.splice(index, 1);
    }else{
      newDisabled.push(slug);
    }

    setMarkerFormatsDisabled(newDisabled);

  }

  const isDisabled = slug => {
    return markerFormatsDisabled.includes(slug);
  }

  return(
    <div id="map-settings-formats">
      <h5>Créations</h5>
      <ul id="formats-list" className="features-selection">
        {
          getFeaturesFormats(allFeatures).map(function(slug) {
            const count = getIdsForFormat(slug,allFeatures).length;

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
                <span className="count">{count}</span>
              </li>
            )
          })
        }
      </ul>
    </div>
  )
}

export default MapSettingsFormats