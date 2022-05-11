import React  from "react";
import MapSettingsTags from "../components/MapSettingsTags";
import MapSettingsFormats from "../components/MapSettingsFormats";
import MapSettingsSort from "../components/MapSettingsSort";
import { useMap } from '../MapContext';

const MapSettings = (props) => {

  const {mapData} = useMap();


  const creationFeatures = mapData?.sources.creations?.data.features || [];
  const annotationFeatures = mapData?.sources.annotations?.data.features || [];

  const allFeatures = creationFeatures.concat(annotationFeatures);

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
