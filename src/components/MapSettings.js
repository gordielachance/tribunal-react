import React, { useEffect,useState }  from "react";
import { Icon } from 'semantic-ui-react';
import MapTags from "../components/MapTags";

const MapSettings = (props) => {

  const [sortBy,setSortBy] = useState('date');

  const sortByList = {
    date:{
      name:'Date'
    },
    distance:{
      name:'Distance'
    }
  }

  const handleTagsUpdate = slugs => {
    console.log("TAGS UPDATED",slugs);
  }

  return (
    <div id="map-settings">
      <h4>Paramètres</h4>
      <div id="map-settings-orderby">
        <h5>Tri des marqueurs</h5>
        <ul>
          {
            Object.keys(sortByList).map(function(key) {
              const item = sortByList[key];
              const active = (sortBy === key);
              return(
                <li
                key={key}
                className={active ? 'active' : ''}
                onClick={e=>{setSortBy(key)}}
                >
                  <span><Icon name="check"/></span>
                  <span>{item.name}</span>
                </li>
              );
            })
          }
        </ul>
      </div>
      <MapTags
        features={props.features}
        onUpdate={handleTagsUpdate}
      />
    </div>
  );
}

export default MapSettings
