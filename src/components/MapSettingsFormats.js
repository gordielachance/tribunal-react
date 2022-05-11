import React, { useEffect,useState }  from "react";
import { Icon } from 'semantic-ui-react';
import {getFormatIcon,getFormatText} from "../Constants";
import { useMap } from '../MapContext';

const MapSettingsFormats = props => {

  const {mapData,markerFormatsDisabled,setMarkerFormatsDisabled} = useMap();

  const creationFeatures = mapData?.sources.creations?.data.features || [];
  const allFeatures = creationFeatures;

  //get pairs of layer name => array of post IDs
  const getCollection = features => {
    const output = {};

    (features || []).forEach(feature => {
      const slug = feature.properties.format;
      if ( !output.hasOwnProperty(slug) ){
        output[slug] = []
      }
      output[slug].push(feature.properties.post_id);
    });
    const formats = Object.keys(output).map(function(slug) {
      const item = output[slug];
      return {
        slug:slug,
        ids:item
      }
    })

    //move standard at the end
    const standardFormatIndex = formats.findIndex(format => format.slug === 'standard');

    if (standardFormatIndex !== -1) {
      formats.push(formats.splice(standardFormatIndex, 1)[0]);
    }

    return formats;


  }

  const collection = getCollection(allFeatures);

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
          collection.map(function(item) {
            const count = item.ids.length;

            const formatIcon = getFormatIcon(item.slug);
            const formatText = getFormatText(item.slug);

            return(
              <li
              key={item.slug}
              className={!isDisabled(item.slug) ? 'active' : ''}
              onClick={e=>{handleClick(item.slug)}}
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
