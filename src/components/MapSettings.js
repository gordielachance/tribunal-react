import React  from "react";
import MapSettingsTags from "../components/MapSettingsTags";
import MapSettingsFormats from "../components/MapSettingsFormats";
import MapSettingsSort from "../components/MapSettingsSort";
import { useMap } from '../MapContext';

const MapSettings = (props) => {



  return (
    <div id="map-settings" className="map-section">
      <MapSettingsSort/>
      <MapSettingsFormats/>
      <MapSettingsTags/>
    </div>
  );
}

export default MapSettings
