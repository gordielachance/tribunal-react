import React  from "react";
import MapSettingsTags from "../components/MapSettingsTags";
import MapSettingsFormats from "../components/MapSettingsFormats";
import MapSettingsSort from "../components/MapSettingsSort";
import { useMap } from '../MapContext';

const MapSettings = (props) => {

  const {mapData} = useMap();


  const allFeatures = mapData?.sources.creations.data.features;

  return (
    <div id="map-settings" className="map-section">
      <MapSettingsSort
        features={allFeatures}
      />
      <MapSettingsFormats
        features={allFeatures}
      />
      <MapSettingsTags
        features={allFeatures}
      />
    </div>
  );
}

export default MapSettings
