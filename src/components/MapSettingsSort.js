import React, { useEffect,useState }  from "react";
import { Icon } from 'semantic-ui-react';
import { useMap } from '../MapContext';

const MapSettingsSort = props => {
  const {mapData,sortMarkerBy,setSortMarkerBy} = useMap();
  const [sortBy,setSortBy] = useState(props.sortBy);

  const sortByList = {
    date:{
      name:'Date'
    },
    distance:{
      name:'Distance'
    }
  }

  return(
    <div id="map-settings-orderby">
      <h5>Tri</h5>
      <ul>
        {
          Object.keys(sortByList).map(function(key) {
            const item = sortByList[key];
            const active = (sortMarkerBy === key);
            return(
              <li
              key={key}
              className={active ? 'active' : ''}
              onClick={e=>{setSortMarkerBy(key)}}
              >
                <span><Icon name="check"/></span>
                <span>{item.name}</span>
              </li>
            );
          })
        }
      </ul>
    </div>
  )
}

export default MapSettingsSort
