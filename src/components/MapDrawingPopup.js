import React, { useEffect, useState } from "react";
import { Button } from 'semantic-ui-react';

import MapPopup from "./MapPopup";
import { useApp } from '../AppContext';
import { useParams,useNavigate } from 'react-router-dom';

const PopupContent = (props) => {


  return (
    <div className="feature-popup">
      COUCOU
    </div>
  );
}

const MapDrawingPopup = props => {
  const {mapPostName} = useParams();
  const navigate = useNavigate();

  const {map,popupDrawingFeature} = useApp();
  const [location,setLocation] = useState();
  const [content,setContent] = useState();

  const handleClosePopup = () =>{
    if (typeof props.onFeatureClick === 'function'){
      props.onFeatureClick(undefined);
    }
  }

  useEffect(()=>{
    if (map === undefined) return;
    if (popupDrawingFeature === undefined) return;
    map.on('mousemove', (e) => {
      //setLocation(e.lngLat);
      //console.log("MOUZ POZ",e.lngLat);
    })
  },[map,popupDrawingFeature])



  useEffect(() => {

    if (popupDrawingFeature !== undefined){

      const popupCenter = popupDrawingFeature.geometry.coordinates;

      const popupContent =       <PopupContent
            feature={popupDrawingFeature}
            onClose={handleClosePopup}
            />

      setLocation(popupCenter);
      setContent(popupContent);

      //get feature on map
      /*
      const features = map.querySourceFeatures('markers');
      const feature = (features || []).find(feature => feature.id === popupDrawingFeature);
      */
    }else{
      setLocation();
      setContent();
    }



  },[popupDrawingFeature])


  return (
    <>
    {
      content &&
      <MapPopup
      settings={{offset:10}}
      lngLat={location}>
        {content}
      </MapPopup>
    }
    </>
  );
};

export default MapDrawingPopup;
