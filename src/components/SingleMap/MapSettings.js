import React  from "react";
import MapSettingsTags from "./MapSettingsTags";
import MapSettingsFormats from "./MapSettingsFormats";
import MapSettingsSort from "./MapSettingsSort";
import { useApp } from '../../AppContext';

const MapSettings = (props) => {

  const {tags} = useApp();

  return (
    <div id="map-settings" className="map-section">
      {
        /*
        <MapSettingsSort/>
        <MapSettingsFormats/>
        */
      }
      {
        (tags !== undefined) &&
        <MapSettingsTags/>
      }
    </div>
  );
}

export default MapSettings
