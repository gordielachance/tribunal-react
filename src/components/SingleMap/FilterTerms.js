import React, { useEffect,useState }  from "react";
import { Icon,Popup } from 'semantic-ui-react';
import { useMap } from './MapContext';
import FilterItem from './FilterItem';

const TermListItem = props => {

  const { term } = props;

  const {
    mapData,
    disabledTermIds,
    toggleIsolateTerm,
    toggleTermId,
    selectSoloTermId,
    getFeaturesByTerm
  } = useMap();


  const featureCount = (getFeaturesByTerm(term.taxonomy,term.slug) || []).length;


  const handleClick = (e,term) => {
    if (e.shiftKey) {
      //solo
      selectSoloTermId(term.term_id)
    }else{
      toggleTermId(term.term_id)
    }
  }

  const isDisabled = term => {
    return (disabledTermIds || []).includes(term.term_id);
  }

  return(
    <FilterItem
    label={term.name}
    description={term.description}
    disabled={isDisabled(term)}
    onClick={e=>handleClick(e,term)}
    onMouseEnter={e=>toggleIsolateTerm(term,true)}
    onMouseLeave={e=>toggleIsolateTerm(term,false)}
    count={featureCount}
    />
  )

}

const TermsList = props => {
  const { terms = [], level = 0, parent = 0, ...otherProps } = props;

  const getChildren = parentId => {
    return terms.filter(term => term.parent === parentId);
  }

  const rootItems = getChildren(parent);

  return(
    <ul
    data-level={level}
    data-parent={parent}
    {...otherProps}
    >
      {
        rootItems.map(term => {

          return(
            <li data-id={term.term_id}>
              <TermListItem term={term}/>
              <TermsList terms={terms} parent={term.term_id} level={level+1}/>
            </li>
          )

        })
      }
    </ul>
  )
}


const FilterTerms = props => {
  return (
    <TermsList terms={props.items} className="map-filter-terms"/>
  );
}

export default FilterTerms
