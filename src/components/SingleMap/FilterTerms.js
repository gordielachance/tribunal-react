import React, { useEffect,useState }  from "react";
import { Icon,Popup } from 'semantic-ui-react';
import { useMap } from './MapContext';
import FilterItem from './FilterItem';

const FilterTerms = props => {

  const {
    mapData,
    disabledTermIds,
    toggleIsolateTermId,
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

          const allFeatureCount = getFeaturesByTerm(term.taxonomy,term.slug).length;

          return(
            <FilterItem
            key={k}
            label={term.name}
            description={term.description}
            disabled={isDisabled(term)}
            onClick={e=>handleClick(e,term)}
            onMouseEnter={e=>toggleIsolateTermId(term.term_id,true)}
            onMouseLeave={e=>toggleIsolateTermId(term.term_id,false)}
            count={allFeatureCount}
            />
          )
        })
      }
    </ul>
  )
}

export default FilterTerms
