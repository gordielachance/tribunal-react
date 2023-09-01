import React,{useState}  from "react";
import { Accordion,Icon } from 'semantic-ui-react';
import MapSettingsTerms from "./mapSettingsTerms";
import MapSettingsFormats from "./MapSettingsFormats";
import MapSettingsAreas from "./MapSettingsAreas";
import MapSettingsSort from "./MapSettingsSort";
import { useApp } from '../../AppContext';
import { useMap } from './MapContext';

const FilterSection = props => {
  return (
    <div className="filters-section">
      <Accordion.Title
        active={props.active}
        index={0}
        onClick={props.onClick}
      >
        <Icon name='dropdown' />
        {props.label}
      </Accordion.Title>
      <Accordion.Content active={props.active}>
        {props.children}
      </Accordion.Content>
    </div>
  )
}

const MapSettings = (props) => {

  const {mapFeatureCollection,mapRenderedFeatures,getFeaturesTags,getFeaturesCategories,getFeaturesFormats} = useMap();

  const mapCategories = getFeaturesCategories(mapFeatureCollection());
  const renderedCategories = getFeaturesCategories(mapRenderedFeatures);

  const mapTags = getFeaturesTags(mapFeatureCollection());
  const renderedTags = getFeaturesTags(mapRenderedFeatures);

  const mapFormats = getFeaturesFormats(mapFeatureCollection());
  const renderedFormats = getFeaturesFormats(mapRenderedFeatures);

  const [activeIndex,setActiveIndex] = useState();

  const handleClick = (index) => {
     const newIndex = activeIndex === index ? -1 : index
     setActiveIndex(newIndex);
   }

  return (
    <Accordion id="map-settings" className="map-section">
    {
      (mapCategories !== undefined) &&
      <FilterSection
        label="Catégories"
        index={0}
        onClick={e=>handleClick(0)}
        active={activeIndex===0}
      >
        <MapSettingsTerms
        items={mapCategories}
        renderedItems={renderedCategories}
        />
      </FilterSection>
    }

    {
      /*
      <MapSettingsSort/>
              */
    }
    {
      <FilterSection
        label="Disciplines"
        index={1}
        onClick={e=>handleClick(1)}
        active={activeIndex===1}
      >
        <MapSettingsFormats
        items={mapFormats}
        renderedItems={renderedFormats}
        />
      </FilterSection>
    }
    {
      (mapTags !== undefined) &&
      <FilterSection
        label="Tags"
        index={2}
        onClick={e=>handleClick(2)}
        active={activeIndex===2}
      >
        <MapSettingsTerms
        items={mapTags}
        renderedItems={renderedTags}
        />
      </FilterSection>
    }
    {
      <FilterSection
        label="Zones"
        index={3}
        onClick={e=>handleClick(3)}
        active={activeIndex===3}
      >
        <MapSettingsAreas/>
      </FilterSection>
    }
    </Accordion>
  );
}

export default MapSettings
