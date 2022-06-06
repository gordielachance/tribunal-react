import React  from "react";
import MapSettingsTags from "./MapSettingsTags";
import MapSettingsFormats from "./MapSettingsFormats";
import MapSettingsSort from "./MapSettingsSort";

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
