import React, { useEffect,useState }  from "react";
import { Icon,Popup } from 'semantic-ui-react';
import { useMap } from './MapContext';
import FilterItem from './FilterItem';

const FilterTerms = props => {

  const {
    mapData,
    disabledTermIds,
    toggleIsolateTerm,
    toggleTermId,
    selectSoloTermId,
    getFeaturesByTerm
  } = useMap();

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
    <ul className="map-filter-terms">
      {
        (props.items||[]).map(function(term,k) {

          const featureCount = (getFeaturesByTerm(term.taxonomy,term.slug) || []).length;

          return(
            <FilterItem
            key={k}
            label={term.name}
            description={term.description}
            disabled={isDisabled(term)}
            onClick={e=>handleClick(e,term)}
            onMouseEnter={e=>toggleIsolateTerm(term,true)}
            onMouseLeave={e=>toggleIsolateTerm(term,false)}
            count={featureCount}
            />
          )
        })
      }
    </ul>
  )
}

export default FilterTerms
