import React, { useEffect, useState } from "react";
import { Button } from 'semantic-ui-react';

import MapPopup from "./MapPopup";
import { CreationCard } from "./CreationCard";
import { useMap } from '../MapContext';
import { useParams,useNavigate } from 'react-router-dom';

const CreationPopupContent = (props) => {
  const navigate = useNavigate();
  const {mapPostName} = useParams();
  const hasMore = props.feature?.properties.has_more;

  const handleClick = () => {

    const getMarkerUrl = feature => {
      return `/carte/${mapPostName}/marker/${feature.properties.post_id}/${feature.properties.slug}`;
    }

    const url = getMarkerUrl(props.feature);
    navigate(url);
  }

  return (
    <div className="feature-popup">
      <CreationCard feature={props.feature}/>
      <div className="feature-actions">
        {
          hasMore &&
          <Button onClick={handleClick}>Ouvrir</Button>
        }
      </div>
    </div>
  );
}

const AnnotationPopupContent = (props) => {

  const title = props.feature.properties.title;

  return (
    <div className="feature-popup">
      {title}
    </div>
  );
}

const FeaturePopup = props => {


  const {mapData,setShowPopup,getAnnotationPolygonByHandle} = useMap();

  const sourceId = props?.sourceId;
  const featureId = props?.featureId;

  console.log("!!!FEATURE POPUP",sourceId,featureId);

  let location = undefined;
  let content = undefined;
  let popupSettings = {
    closeOnClick:false,
    anchor:'bottom'
  }

  if (featureId && sourceId){

    switch(sourceId){

      case 'creations':

        var sourceCollection = mapData?.sources.creations.data.features;
        var feature = (sourceCollection || []).find(feature => feature.properties.id === featureId);

        if (feature){
          location =  feature.geometry.coordinates;
          content = <CreationPopupContent feature={feature}/>
        }

      break;

      case 'annotationsHandles':

        //get handle
        var sourceCollection = mapData?.sources.annotationsHandles.data.features;
        var handleFeature = (sourceCollection || []).find(feature => feature.properties.id === featureId);

        //get polygon
        var polygonFeature = getAnnotationPolygonByHandle(handleFeature);

        if (handleFeature && polygonFeature){
          //get popup content
          location = handleFeature.geometry.coordinates;
          content = <AnnotationPopupContent feature={polygonFeature}/>
        }

      break;
    }


  }

  const handleClose = () => {
    //setShowPopup(false);
  }

  return (
    <>
    {
      (location && content) &&
      <MapPopup
      lngLat={location}
      onClose={handleClose}
      settings={popupSettings}
      >
        {content}
      </MapPopup>
    }
    </>
  );
};

export default FeaturePopup;
