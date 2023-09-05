import React,{useState}  from "react";
import { Accordion,Icon } from 'semantic-ui-react';
import FilterTerms from "./FilterTerms";
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
    filterTermsByFeatures,
    selectAllTerms,
    selectNoTerms,
    openFilterSlugs,
    setOpenFilterSlugs
  } = useMap();

  const categories = filterTermsByFeatures('category',mapFeatureCollection());
  //const renderedCategories = filterTermsByFeatures('category',featuresList);

  const tags = filterTermsByFeatures('post_tag',mapFeatureCollection());
  //const renderedTags = filterTermsByFeatures('post_tag',featuresList);

  const formats = filterTermsByFeatures('tdp_format',mapFeatureCollection());
  //const renderedFormats = filterTermsByFeatures('tdp_format',featuresList);

  const areas = filterTermsByFeatures('tdp_area',mapFeatureCollection());
  //const renderedAreas = filterTermsByFeatures('tdp_area',featuresList);

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
      ((categories || []).length > 1) &&
      <FilterSection
        label="Catégories"
        index="categories"
        onClick={e=>handleSectionClick('categories')}
        active={openFilterSlugs.includes('categories')}
        onClickAll={e=>selectAllTerms('category')}
        onClickNone={e=>selectNoTerms('category')}
      >
        <FilterTerms
        items={categories}
        />
      </FilterSection>
    }

    {
      /*
      <MapSettingsSort/>
              */
    }
    {
      ((formats || []).length > 1) &&
      <FilterSection
        label="Disciplines"
        index="disciplines"
        onClick={e=>handleSectionClick('disciplines')}
        active={openFilterSlugs.includes('disciplines')}
        onClickAll={e=>selectAllTerms('tdp_format')}
        onClickNone={e=>selectNoTerms('tdp_format')}
      >
        <FilterTerms
        items={formats}
        />
      </FilterSection>
    }
    {
      ((tags || []).length > 1) &&
      <FilterSection
        label="Tags"
        index="tags"
        onClick={e=>handleSectionClick('tags')}
        active={openFilterSlugs.includes('tags')}
        onClickAll={e=>selectAllTerms('post_tag')}
        onClickNone={e=>selectNoTerms('post_tag')}
      >
        <FilterTerms
        items={tags}
        />
      </FilterSection>
    }
    {
      ((areas || []).length > 1) &&
      <FilterSection
        label="Zones"
        index="areas"
        onClick={e=>handleSectionClick('areas')}
        active={openFilterSlugs.includes('areas')}
        onClickAll={e=>selectAllTerms('tdp_area')}
        onClickNone={e=>selectNoTerms('tdp_area')}
      >
        <FilterTerms
        items={areas}
        />
      </FilterSection>
    }
    </Accordion>
  );
}

export default Filters
