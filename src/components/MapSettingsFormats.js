import React, { useEffect,useState }  from "react";
import { Icon } from 'semantic-ui-react';

const MapSettingsFormats = props => {

  const [disabled,setDisabled] = useState(props.disabled || []);

  const handleClick = slug => {

    const newDisabled = [...disabled];
    const index = newDisabled.indexOf(slug);

    if (index > -1) {//exists in array
      newDisabled.splice(index, 1);
    }else{
      newDisabled.push(slug);
    }

    setDisabled(newDisabled);

  }

  const isDisabled = slug => {
    return disabled.includes(slug);
  }

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
    return Object.keys(output).map(function(slug) {
      const item = output[slug];
      return {
        slug:slug,
        ids:item
      }
    })
  }

  const collection = getCollection(props.features);

  //pass update to parent
  useEffect(() => {
    if (typeof props.onDisable !== 'function') return;
    props.onDisable(disabled);
  },[disabled]);

  return(
    <div id="map-settings-formats">
      <h5>Type</h5>
      <ul>
        {
          collection.map(function(item) {
            const slug = item.slug;
            const count = item.ids.length;

            return(
              <li
              key={item.slug}
              className={!isDisabled(item.slug) ? 'active' : ''}
              onClick={e=>{handleClick(item.slug)}}
              >
                <span><Icon name="check"/></span>
                <span>{item.slug}</span>
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
