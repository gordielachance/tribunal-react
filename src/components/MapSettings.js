import React  from "react";
import MapSettingsTags from "../components/MapSettingsTags";
import MapSettingsFormats from "../components/MapSettingsFormats";
import MapSettingsSort from "../components/MapSettingsSort";

const MapSettings = (props) => {

  return (
    <div id="map-settings" className="map-section">
      <MapSettingsSort
        features={props.features}
        sortBy={props.sortBy}
        onUpdate={props.onSortBy}
      />
      <MapSettingsFormats
        features={props.features}
        disabled={props.disabledFormats}
        onDisable={props.onDisableFormats}
      />
      <MapSettingsTags
        features={props.features}
        disabled={props.disabledTags}
        onDisable={props.onDisableTags}
      />
    </div>
  );
}

export default MapSettings
