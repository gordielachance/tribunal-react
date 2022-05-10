import React, { useEffect,useState }  from "react";
import { Icon } from 'semantic-ui-react';
import { useApp } from '../AppContext';
import { useMap } from '../MapContext';

const MapSettingsTags = props => {

  const {tags} = useApp();
  const {markerTagsDisabled,setMarkerTagsDisabled} = useMap();

  const handleClick = slug => {

    const newDisabled = [...markerTagsDisabled];
    const index = newDisabled.indexOf(slug);

    if (index > -1) {//exists in array
      newDisabled.splice(index, 1);
    }else{
      newDisabled.push(slug);
    }

    setMarkerTagsDisabled(newDisabled);

  }

  const isDisabled = slug => {
    return markerTagsDisabled.includes(slug);
  }

  //get pairs of layer name => array of post IDs
  const getCollection = features => {
    const output = {};

    (features || []).forEach(feature => {
      const slugs = feature.properties.tag_slugs;

      (slugs || []).forEach(slug => {
        if ( !output.hasOwnProperty(slug) ){
          output[slug] = []
        }
        output[slug].push(feature.properties.post_id);
      })
    });
    return Object.keys(output).map(function(slug) {
      const item = output[slug];
      return {
        slug:slug,
        ids:item
      }
    })
  }

  const collection = getCollection(props.features);

  return(
    <div id="map-settings-tags">
      <h5>Tags</h5>
      <ul>
        {
          collection.map(function(item) {

            const wpTag = tags.find(term=>term.slug===item.slug);
            const count = item.ids.length;

            return(
              <li
              key={item.slug}
              className={!isDisabled(item.slug) ? 'active' : ''}
              onClick={e=>{handleClick(item.slug)}}
              >
                <span><Icon name="check"/></span>
                <span title={wpTag.description}>{wpTag.name}</span>
                <span className="count">{count}</span>
              </li>
            )
          })
        }
      </ul>
    </div>
  )
}

export default MapSettingsTags
