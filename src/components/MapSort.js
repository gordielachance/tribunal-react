import React, { useEffect,useState }  from "react";
import { Icon } from 'semantic-ui-react';

const MapSort = props => {

  const [sortBy,setSortBy] = useState(props.sortBy);

  const sortByList = {
    date:{
      name:'Date'
    },
    distance:{
      name:'Distance'
    }
  }

  const handleClick = key => {
    setSortBy(key);
  }

  //pass update to parent
  useEffect(() => {
    if (typeof props.onUpdate !== 'function') return;
    props.onUpdate(sortBy);
  },[sortBy]);

  return(
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
  )
}

export default MapSort
