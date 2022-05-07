import React, { useEffect, useState } from "react";
import { Button } from 'semantic-ui-react';

import MapPopup from "./MapPopup";
import { FeatureCard } from "./FeatureCard";
import { useApp } from '../AppContext';
import { useParams,useNavigate } from 'react-router-dom';

const PopupContent = (props) => {

  const hasMore = props.feature?.properties.has_more;

  return (
    <div className="feature-popup">
      <FeatureCard feature={props.feature}/>
      <div className="feature-actions">
        {
          hasMore &&
          <Button onClick={props.onClick}>Ouvrir</Button>
        }
      </div>
    </div>
  );
}

const MapMarkerPopup = props => {
  const {mapPostName} = useParams();
  const navigate = useNavigate();

  const {popupMarkerFeature,setPopupMarkerFeature} = useApp();
  const [location,setLocation] = useState();
  const [content,setContent] = useState();

  const handleClose = () => {
    setPopupMarkerFeature(undefined);
  }

  const handleClick = () => {

    const getMarkerUrl = feature => {
      return `/carte/${mapPostName}/marker/${feature.properties.post_id}/${feature.properties.slug}`;
    }

    const url = getMarkerUrl(popupMarkerFeature);
    navigate(url);
  }

  useEffect(() => {

    if (popupMarkerFeature !== undefined){

      const popupCenter = popupMarkerFeature.geometry.coordinates;
      const popupContent = <PopupContent feature={popupMarkerFeature} onClick={handleClick}/>

      setLocation(popupCenter);
      setContent(popupContent);

      //get feature on map
      /*
      const features = map.querySourceFeatures('markers');
      const feature = (features || []).find(feature => feature.id === popupMarkerFeature);
      */
    }else{
      setLocation();
      setContent();
    }



  },[popupMarkerFeature])


  return (
    <>
    {
      content &&
      <MapPopup
      lngLat={location}
      onClose={handleClose}
      settings={{closeOnClick:false,anchor:'bottom'}}
      >
        {content}
      </MapPopup>
    }
    </>
  );
};

export default MapMarkerPopup;
