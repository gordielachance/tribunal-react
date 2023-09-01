import React, { useEffect,useState }  from "react";
import { Icon,Popup } from 'semantic-ui-react';
import { useApp } from '../../AppContext';
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

  const {tags,getFeaturesTags} = useApp();

  const {
    mapData,
    markerTagsDisabled,
    setMarkerTagsDisabled,
    toggleHoverTag
  } = useMap();

  const handleClick = slug => {

    const newDisabled = [...markerTagsDisabled];
    const index = newDisabled.indexOf(slug);

    if (index > -1) {//exists in array
      newDisabled.splice(index, 1);
    }else{
      newDisabled.push(slug);
    }

    setMarkerTagsDisabled(newDisabled);

  }


  const isDisabled = slug => {
    return markerTagsDisabled.includes(slug);
  }

  return(
    <div id="map-settings-terms">
      <h5>{props.label}</h5>
      <ul id="terms-list" className="features-selection">
        {
          (props.items||[]).map(function(term,k) {

            return(
              <li
              key={term.slug}
              className={!isDisabled(term.slug) ? 'active' : ''}
              >
                <SingleTerm
                term={term}
                onClick={e=>handleClick(term.slug)}
                onEnter={e=>toggleHoverTag(term.slug,true)}
                onLeave={e=>toggleHoverTag(term.slug,false)}
                />
              </li>
            )
          })
        }
      </ul>
    </div>
  )
}

export default MapSettingsTerms
