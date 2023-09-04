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
    featuresList,
    getFeaturesTags,
    getFeaturesCategories,
    getFeaturesFormats,
    selectAllTerms,
    selectNoTerms,
    selectAllFormats,
    selectNoFormats,
    selectAllAreas,
    selectNoAreas,
    openFilterSlugs,
    setOpenFilterSlugs
  } = useMap();

  const categoryFeatures = getFeaturesCategories(mapFeatureCollection());
  const renderedCategoryFeatures = getFeaturesCategories(featuresList);

  const tagFeatures = getFeaturesTags(mapFeatureCollection());
  const renderedTagFeatures = getFeaturesTags(featuresList);

  const formatFeatures = getFeaturesFormats(mapFeatureCollection());
  const renderedFormatFeatures = getFeaturesFormats(featuresList);

  //const mapAreas = getFeaturesAreas(mapFeatureCollection());
  //const renderedAreas = getFeaturesAreas(featuresList);

  const handleSectionClick = slug => {
    const index = openFilterSlugs.indexOf(slug);

    const newSlugs = [...openFilterSlugs];

    if (index > -1) {//exists in array
      newSlugs.splice(index, 1);
    }else{
      newSlugs.push(slug);
    }

    setOpenFilterSlugs(newSlugs);
 }

  return (
    <Accordion id="map-settings" className="map-section">
    {
      ((categoryFeatures || []).length > 1) &&
      <FilterSection
        label="Catégories"
        index="categories"
        onClick={e=>handleSectionClick('categories')}
        onClickAll={e=>selectAllTerms('category')}
        onClickNone={e=>selectNoTerms('category')}
        active={openFilterSlugs.includes('categories')}
      >
        <FilterTerms
        items={categoryFeatures}
        renderedItems={renderedCategoryFeatures}
        />
      </FilterSection>
    }

    {
      /*
      <MapSettingsSort/>
              */
    }
    {
      ((formatFeatures || []).length > 1) &&
      <FilterSection
        label="Disciplines"
        index="disciplines"
        onClick={e=>handleSectionClick('disciplines')}
        onClickAll={e=>selectAllFormats()}
        onClickNone={e=>selectNoFormats()}
        active={openFilterSlugs.includes('disciplines')}
      >
        <FilterFormats
        items={formatFeatures}
        renderedItems={renderedFormatFeatures}
        />
      </FilterSection>
    }
    {
      ((tagFeatures || []).length > 1) &&
      <FilterSection
        label="Tags"
        index="tags"
        onClick={e=>handleSectionClick('tags')}
        onClickAll={e=>selectAllTerms('post_tag')}
        onClickNone={e=>selectNoTerms('post_tag')}
        active={openFilterSlugs.includes('tags')}
      >
        <FilterTerms
        items={tagFeatures}
        renderedItems={renderedTagFeatures}
        />
      </FilterSection>
    }
    {
      //TOUFIX STATEMENT((areaFeatures || []).length > 1) &&
      <FilterSection
        label="Zones"
        index="areas"
        onClick={e=>handleSectionClick('areas')}
        onClickAll={e=>selectAllAreas()}
        onClickNone={e=>selectNoAreas()}
        active={openFilterSlugs.includes('areas')}
      >
        <FilterAreas/>
      </FilterSection>
    }
    </Accordion>
  );
}

export default Filters
