import { Icon } from 'semantic-ui-react';
import {getFormatIcon,getFormatText,getFeaturesFormats,getIdsForFormat} from "./MapFunctions";
import { useMap } from './MapContext';


const MapSettingsAreas = props => {

  const {
    mapAreaCollection
  } = useMap();

  return(
    <div id="map-settings-formats">
      <h5>Areas</h5>
      <ul id="terms-list" className="features-selection">
        {
          mapAreaCollection().map(function(feature,k) {

            return(
              <li
              key={k}
              >
                {feature.properties.mun_name_fr}
              </li>
            )
          })
        }
      </ul>
    </div>
  )
}

export default MapSettingsAreas
