import React, { useEffect, useState } from "react";
import { Button } from 'semantic-ui-react';

import MapPopup from "./MapPopup";
import { CreationCard } from "./CreationCard";
import { useMap } from '../MapContext';
import { useParams,useNavigate } from 'react-router-dom';

import {getMarkerUrl} from "./../Constants";

const FeaturePopupContent = (props) => {
  const navigate = useNavigate();
  const {mapPostSlug,mapPostId} = useParams();
  const hasMore = props.feature?.properties.has_more;

  const handleClick = () => {
    const url = getMarkerUrl(mapPostId,mapPostSlug,props.feature.properties.post_id,props.feature.properties.slug);
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

const FeaturePopup = props => {


  const {
    mapData,
    setShowPopup,
    getAnnotationPolygonByHandle,
    setActiveFeatureId
  } = useMap();

  const sourceId = props?.sourceId;
  const featureId = props?.featureId;

  let location = undefined;
  let content = undefined;
  let popupSettings = {
    closeOnClick:false,
    anchor:'bottom'
  }

  if (featureId && sourceId){

    switch(sourceId){

      case 'creations':

        var sourceCollection = mapData?.sources.creations?.data.features;
        var feature = (sourceCollection || []).find(feature => feature.properties.id === featureId);

        if (feature){
          location =  feature.geometry.coordinates;
          content = <FeaturePopupContent feature={feature}/>
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
          content = <FeaturePopupContent feature={polygonFeature}/>
        }

      break;
    }


  }

  const handleClose = () => {
    //setActiveFeatureId();
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
