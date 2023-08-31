import React, { useEffect,useState }  from "react";
import { Icon,Popup } from 'semantic-ui-react';
import { useApp } from '../../AppContext';
import { useMap } from './MapContext';
import {getFeatureCollectionTags} from "./MapFunctions";

const SingleListTag = props => {
  const tagNameEl = <span>{props.wpTag.name}</span>;
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
        (props.wpTag.description && !showDescription) &&
        <span className="tagDescriptionHandle" onClick={(e)=>setShowDescription(!showDescription)}><Icon name="info circle"/></span>
      }
      </div>
      {
        showDescription &&
        <div className="singleTagDescription">{props.wpTag.description}</div>
      }
    </>
  )
}

const MapSettingsTags = props => {

  const {tags} = useApp();

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
    <div id="map-settings-tags">
      <h5>Tags</h5>
      <ul id="tags-list" className="features-selection">
        {
          getFeatureCollectionTags(mapData?.sources.features).map(function(term,k) {

            return(
              <li
              key={term.slug}
              className={!isDisabled(term.slug) ? 'active' : ''}
              >
                <SingleListTag
                wpTag={term}
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

export default MapSettingsTags
