import { Icon } from 'semantic-ui-react';
import {getFormatIcon,getFormatText,getFeaturesFormats,getIdsForFormat} from "./MapFunctions";
import { useMap } from './MapContext';


const MapSettingsAreas = props => {

  const {
    mapAreaCollection
  } = useMap();

  const isDisabled = area => {
    return false;//TOUFIX
  }

  return(
    <ul className="map-filter-areas">
      {
        mapAreaCollection().map(function(feature,k) {

          return(
            <li
            key={k}
            className={!isDisabled(feature) ? 'active' : ''}
            >
              <span><Icon name="check"/></span>
              {feature.properties.mun_name_fr}
            </li>
          )
        })
      }
    </ul>
  )
}

export default MapSettingsAreas
