import React, { useEffect,useState }  from "react";
import { Icon } from 'semantic-ui-react';
import MapTags from "../components/MapTags";
import MapSort from "../components/MapSort";

const MapSettings = (props) => {

  return (
    <div id="map-settings">
      <MapSort
        features={props.features}
        sortBy={props.sortBy}
        onUpdate={props.onSortBy}
      />
      <MapTags
        features={props.features}
        disabled={props.disabledTags}
        onDisable={props.onDisableTags}
      />
    </div>
  );
}

export default MapSettings
