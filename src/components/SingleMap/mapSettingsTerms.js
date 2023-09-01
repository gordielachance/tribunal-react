import React, { useEffect,useState }  from "react";
import { Icon,Popup } from 'semantic-ui-react';
import { useMap } from './MapContext';

const SingleTerm = props => {
  const tagNameEl = <span>{props.term.name}</span>;
  const [showDescription,setShowDescription] = useState(true);
  return(
    <>
      <div className="singleTagHeader">
        <Icon name="check" onClick={props.onClick}/>
      {
        <span
        onClick={props.onClick}
        onMouseEnter={props.onEnter}
        onMouseLeave={props.onLeave}
        >{tagNameEl}
        </span>
      }
      {
        (props.term.description && !showDescription) &&
        <span className="tagDescriptionHandle" onClick={(e)=>setShowDescription(!showDescription)}><Icon name="info circle"/></span>
      }
      </div>
      {
        showDescription &&
        <div className="singleTagDescription">{props.term.description}</div>
      }
    </>
  )
}

const MapSettingsTerms = props => {

  const {
    mapData,
    disabledTermIds,
    toggleIsolateTermId,
    toggleTermId,
    soloTermId
  } = useMap();

  const handleClick = (e,term) => {
    if (e.shiftKey) {
      //solo
      soloTermId(term.term_id)
    }else{
      toggleTermId(term.term_id)
    }
  }


  const isDisabled = term => {
    return disabledTermIds.includes(term.term_id);
  }

  return(
    <ul className="map-filter-terms">
      {
        (props.items||[]).map(function(term,k) {

          return(
            <li
            key={term.slug}
            className={!isDisabled(term) ? 'active' : ''}
            >
              <SingleTerm
              term={term}
              onClick={e=>handleClick(e,term)}
              onEnter={e=>toggleIsolateTermId(term.term_id,true)}
              onLeave={e=>toggleIsolateTermId(term.term_id,false)}
              />
            </li>
          )
        })
      }
    </ul>
  )
}

export default MapSettingsTerms
