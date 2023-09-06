import { Icon } from 'semantic-ui-react';
import { useMap } from './MapContext';

const MapSettingsSort = props => {
  const {
    sortMarkerBy,
    setSortMarkerBy
  } = useMap();

  const sortByList = {
    date:{
      name:'Date'
    },
    distance:{
      name:'Distance'
    }
  }

  return(
    <div id="map-filters-orderby">
      <h5>Tri</h5>
      <ul>
        {
          Object.keys(sortByList).map(function(slug) {
            const item = sortByList[slug];
            const active = (sortMarkerBy === slug);
            return(
              <li
              key={slug}
              className={active ? 'active' : ''}
              onClick={e=>{setSortMarkerBy(slug)}}
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
