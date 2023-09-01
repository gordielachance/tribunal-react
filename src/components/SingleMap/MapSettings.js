import React  from "react";
import MapSettingsTerms from "./mapSettingsTerms";
import MapSettingsFormats from "./MapSettingsFormats";
import MapSettingsAreas from "./MapSettingsAreas";
import MapSettingsSort from "./MapSettingsSort";
import { useApp } from '../../AppContext';
import { useMap } from './MapContext';

const MapSettings = (props) => {

  const {mapFeatureCollection,mapRenderedFeatures,getFeaturesTags,getFeaturesCategories,getFeaturesFormats} = useMap();

  const mapCategories = getFeaturesCategories(mapFeatureCollection());
  const renderedCategories = getFeaturesCategories(mapRenderedFeatures);

  const mapTags = getFeaturesTags(mapFeatureCollection());
  const renderedTags = getFeaturesTags(mapRenderedFeatures);

  const mapFormats = getFeaturesFormats(mapFeatureCollection());
  const renderedFormats = getFeaturesFormats(mapRenderedFeatures);

  console.log("MAP FORMATS",mapFormats);


  return (
    <div id="map-settings" className="map-section">
      {
        /*
        <MapSettingsSort/>
                */
      }
      {
        (mapCategories !== undefined) &&
        <MapSettingsTerms
        label="Categories"
        items={mapCategories}
        renderedItems={renderedCategories}
        />
      }
      {
        (mapTags !== undefined) &&
        <MapSettingsTerms
        label="Tags"
        items={mapTags}
        renderedItems={renderedTags}
        />
      }
      {
        <MapSettingsFormats
        items={mapFormats}
        renderedItems={renderedFormats}
        />
      }
      {
        <MapSettingsAreas
        />
      }
    </div>
  );
}

export default MapSettings
