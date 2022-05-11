import React, { useEffect,useState }  from "react";
import { Icon } from 'semantic-ui-react';
import {getFormatIcon,getFormatText,getFeaturesFormats,getIdsForFormat} from "../Constants";
import { useMap } from '../MapContext';

const MapSettingsFormats = props => {

  const {mapData,markerFormatsDisabled,setMarkerFormatsDisabled} = useMap();

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
      <ul>
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
