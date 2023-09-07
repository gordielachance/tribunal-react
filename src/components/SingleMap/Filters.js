import React,{useState}  from "react";
import { Accordion,Icon } from 'semantic-ui-react';
import FilterTerms from "./FilterTerms";
import MapSettingsSort from "./MapSettingsSort";
import { useApp } from '../../AppContext';
import { useMap } from './MapContext';

const FilterSection = props => {

  const { label,open,children,onClick,onClickAll,onClickNone,...otherProps } = props;

  return (
    <Accordion as="li" className="filters-section parent-accordion" {...otherProps}>
      <Accordion.Title
        active={open}
        index={0}

      >
        <div className="accordion-title-block">
          <span onClick={onClick}>
            {label}
          </span>
          <ul className="filters-section-shortcuts">
            {onClickAll &&
              <li onClick={onClickAll}>All</li>
            }
            {onClickNone &&
              <li onClick={onClickNone}>None</li>
            }
          </ul>
        </div>
        <Icon name={`angle ${open ? 'up' : 'down'}`} onClick={onClick} className="accordion-handle"/>
      </Accordion.Title>
      <Accordion.Content active={open}>
        {children}
      </Accordion.Content>
    </Accordion>
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
    <ul id="map-filters" className="map-section">
    {
      ((categories || []).length > 1) &&
      <FilterSection
        label="Catégories"
        id="categories"
        onClick={e=>handleSectionClick('categories')}
        open={openFilterSlugs.includes('categories')}
        onClickAll={e=>selectAllTerms('category')}
        onClickNone={e=>selectNoTerms('category')}
      >
        <FilterTerms
        taxonomy='category'
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
        id="filter-section-disciplines"
        onClick={e=>handleSectionClick('disciplines')}
        open={openFilterSlugs.includes('disciplines')}
        onClickAll={e=>selectAllTerms('tdp_format')}
        onClickNone={e=>selectNoTerms('tdp_format')}
      >
        <FilterTerms
        taxonomy='tdp_format'
        items={formats}
        />
      </FilterSection>
    }
    {
      ((tags || []).length > 1) &&
      <FilterSection
        label="Tags"
        id="filter-section-tags"
        onClick={e=>handleSectionClick('tags')}
        open={openFilterSlugs.includes('tags')}
        onClickAll={e=>selectAllTerms('post_tag')}
        onClickNone={e=>selectNoTerms('post_tag')}
      >
        <FilterTerms
        taxonomy='post_tag'
        items={tags}
        />
      </FilterSection>
    }
    {
      ((areas || []).length > 1) &&
      <FilterSection
        label="Zones"
        id="filter-section-areas"
        onClick={e=>handleSectionClick('areas')}
        open={openFilterSlugs.includes('areas')}
        onClickAll={e=>selectAllTerms('tdp_area')}
        onClickNone={e=>selectNoTerms('tdp_area')}
      >
        <FilterTerms
        taxonomy='tdp_area'
        items={areas}
        />
      </FilterSection>
    }
    </ul>
  );
}

export default Filters
