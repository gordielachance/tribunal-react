import React, { useEffect, useState } from "react";
import { Button } from 'semantic-ui-react';

import MapPopup from "./MapPopup";
import { CreationCard } from "./CreationCard";
import { useMap } from '../MapContext';
import { useParams,useNavigate } from 'react-router-dom';

import {getMarkerUrl} from "./../Constants";

const FeaturePopupContent = (props) => {

  const {
    getFeatureById
  } = useMap();

  const navigate = useNavigate();
  const feature = getFeatureById(props.featureId);

  const {mapPostSlug,mapPostId} = useParams();

  const hasMore = feature?.properties.has_more;

  const handleClick = () => {
    const url = getMarkerUrl(mapPostId,mapPostSlug,feature.properties.post_id,feature.properties.slug);
    navigate(url);
  }

  return (
    <div className="feature-popup">
      <CreationCard
      feature={feature}
      highlightTags={true}
      />
      {
        hasMore &&
        <div className="popup-actions">
          <Button onClick={handleClick}>Ouvrir</Button>
        </div>
      }

    </div>
  );
}

const FeaturePopup = props => {

  const {
    getAnnotationPolygonByHandle,
    getFeatureSourceKey,
    getFeatureById,
    getHandlesByAnnotationPolygonId,
    activeFeatureId,
    setShowPopup
  } = useMap();

  const [latLng,setLatLng] = useState();
  const [featureId,setFeatureId] = useState();

  let popupSettings = {
    closeOnClick:false,
    anchor:'bottom'
  }

  //populate some data required for the popup.
	useEffect(()=>{
		if (!activeFeatureId) return;

		//get the data needed to display the popup
		const getPopupData = feature => {

	    const sourceKey = getFeatureSourceKey(feature);
	    let location;
	    let feature_id;

	    switch(sourceKey){
	      case 'creations':
	        location = feature.geometry.coordinates;
	        feature_id = feature.properties.id;
	      break;
	      case 'annotationsPolygons':

	        //get first handle
	        const handles = getHandlesByAnnotationPolygonId(feature.properties.id);
	        const handleFeature = handles[0];

	        if (handleFeature){
	          //get popup content
	          location = handleFeature.geometry.coordinates;
	          feature_id = feature.properties.id;
	        }

	      break;
	      case 'annotationsHandles':

	        location = feature.geometry.coordinates;

	        //get polygon
	        const polygonFeature = getAnnotationPolygonByHandle(feature);

	        if (polygonFeature){
	          feature_id = polygonFeature.properties.id;
	        }

	      break;
	    }

	    return {
	      latlng:location,
	      feature_id:feature_id
	    }
	  }

		const feature = getFeatureById(activeFeatureId);
		const data = getPopupData(feature);

    setLatLng(data.latlng);
    setFeatureId(data.feature_id);

	},[activeFeatureId])

  const handleClose = () => {
    setShowPopup(false);
  }

  return (
    <>
    {
      (latLng && (featureId !== undefined) ) &&
      <MapPopup
      lngLat={latLng}
      onClose={handleClose}
      settings={popupSettings}
      >
        <FeaturePopupContent featureId={featureId}/>
      </MapPopup>
    }
    </>
  );
};

export default FeaturePopup;
