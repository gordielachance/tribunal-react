import React, { useEffect,useState }  from "react";
import { Icon,Popup } from 'semantic-ui-react';
import { useApp } from '../../AppContext';
import { useMap } from './MapContext';
import {getFeaturesTags,getIdsForTag} from "./MapFunctions";

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

  const creationFeatures = mapData?.sources.creations?.data.features || [];
  const annotationFeatures = mapData?.sources.annotationPolygons?.data.features || [];
  const allFeatures = creationFeatures.concat(annotationFeatures);

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
          getFeaturesTags(allFeatures).map(function(slug,k) {
            const wpTag = tags.find(term=>term.slug===slug);

            return(
              <li
              key={slug}
              className={!isDisabled(slug) ? 'active' : ''}
              >
                <SingleListTag
                wpTag={wpTag}
                onClick={e=>handleClick(slug)}
                onEnter={e=>toggleHoverTag(slug,true)}
                onLeave={e=>toggleHoverTag(slug,false)}
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
