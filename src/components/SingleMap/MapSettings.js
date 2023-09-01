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
  const [activeSlugs,setActiveSlugs] = useState([]);

  const handleSectionClick = slug => {
    const index = activeSlugs.indexOf(slug);

    const newSlugs = [...activeSlugs];

    if (index > -1) {//exists in array
      newSlugs.splice(index, 1);
    }else{
      newSlugs.push(slug);
    }

    setActiveSlugs(newSlugs);
 }

  return (
    <Accordion id="map-settings" className="map-section">
    {
      (mapCategories !== undefined) &&
      <FilterSection
        label="Catégories"
        index="categories"
        onClick={e=>handleSectionClick('categories')}
        active={activeSlugs.includes('categories')}
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
        index="disciplines"
        onClick={e=>handleSectionClick('disciplines')}
        active={activeSlugs.includes('disciplines')}
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
        index="tags"
        onClick={e=>handleSectionClick('tags')}
        active={activeSlugs.includes('tags')}
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
        index="areas"
        onClick={e=>handleSectionClick('areas')}
        active={activeSlugs.includes('areas')}
      >
        <MapSettingsAreas/>
      </FilterSection>
    }
    </Accordion>
  );
}

export default MapSettings
