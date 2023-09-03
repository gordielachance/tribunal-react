import React,{useState}  from "react";
import { Accordion,Icon } from 'semantic-ui-react';
import FilterTerms from "./FilterTerms";
import FilterFormats from "./FilterFormats";
import FilterAreas from "./FilterAreas";
import MapSettingsSort from "./MapSettingsSort";
import { useApp } from '../../AppContext';
import { useMap } from './MapContext';

const FilterSection = props => {
  return (
    <div className="filters-section">
      <Accordion.Title
        active={props.active}
        index={0}

      >
        <Icon name='dropdown' onClick={props.onClick}/>
        <span onClick={props.onClick}>
          {props.label}
        </span>
        <ul className="filters-section-shortcuts">
          {props.onClickAll &&
            <li onClick={props.onClickAll}>All</li>
          }
          {props.onClickNone &&
            <li onClick={props.onClickNone}>None</li>
          }
        </ul>
      </Accordion.Title>
      <Accordion.Content active={props.active}>
        {props.children}
      </Accordion.Content>
    </div>
  )
}

const Filters = (props) => {

  const {
    mapFeatureCollection,
    mapRenderedFeatures,
    getFeaturesTags,
    getFeaturesCategories,
    getFeaturesFormats,
    selectAllTerms,
    selectNoTerms,
    selectAllFormats,
    selectNoFormats,
    selectAllAreas,
    selectNoAreas
  } = useMap();

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
        onClickAll={e=>selectAllTerms('category')}
        onClickNone={e=>selectNoTerms('category')}
        active={activeSlugs.includes('categories')}
      >
        <FilterTerms
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
        onClickAll={e=>selectAllFormats()}
        onClickNone={e=>selectNoFormats()}
        active={activeSlugs.includes('disciplines')}
      >
        <FilterFormats
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
        onClickAll={e=>selectAllTerms('post_tag')}
        onClickNone={e=>selectNoTerms('post_tag')}
        active={activeSlugs.includes('tags')}
      >
        <FilterTerms
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
        onClickAll={e=>selectAllAreas()}
        onClickNone={e=>selectNoAreas()}
        active={activeSlugs.includes('areas')}
      >
        <FilterAreas/>
      </FilterSection>
    }
    </Accordion>
  );
}

export default Filters
