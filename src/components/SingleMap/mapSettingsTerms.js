import React, { useEffect,useState }  from "react";
import { Icon,Popup } from 'semantic-ui-react';
import { useMap } from './MapContext';
import FilterItem from './FilterItem';

const MapSettingsTerms = props => {

  const {
    mapData,
    disabledTermIds,
    toggleIsolateTermId,
    toggleTermId,
    selectSoloTermId
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

          return(
            <FilterItem
            key={k}
            label={term.name}
            description={term.description}
            disabled={isDisabled(term)}
            onClick={e=>handleClick(e,term)}
            onMouseEnter={e=>toggleIsolateTermId(term.term_id,true)}
            onMouseLeave={e=>toggleIsolateTermId(term.term_id,false)}
            //renderedCount={renderedFeatureCount}
            //totalCount={allFeatureCount}
            />
          )
        })
      }
    </ul>
  )
}

export default MapSettingsTerms
