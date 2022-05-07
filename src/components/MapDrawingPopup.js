import React, { useEffect, useState } from "react";

import MapPopup from "./MapPopup";
import { useApp } from '../AppContext';

const PopupContent = (props) => {

  return (
    <div className="feature-popup">
    {props.feature.properties.unique_id}
    </div>
  );
}

const MapDrawingPopup = props => {

  const [feature,setFeature] = useState();

  const {mapData,togglePolygon,togglePolygonHandle,getPolygonByHandleFeature,setPopupDrawingFeatureId} = useApp();

  const [location,setLocation] = useState();
  const [content,setContent] = useState();

  const handleClose = e => {

    const polygon = getPolygonByHandleFeature(feature);

    console.log("DRAWING POPUP CLOSED", props.feature_id);
    togglePolygonHandle(feature,false);
    togglePolygon(polygon,false);
    setPopupDrawingFeatureId();

    /*
    const isSameFeature = (props.feature_id.properties.unique_id === prevFeature.current?.properties.unique_id);

    if (!isSameFeature){
      console.log("REMOVE OLD POPUPZZZ");
      togglePolygonHandle(feature,false);
      togglePolygon(feature,false);
    }
    */
  }

  //get feature based on its ID
  useEffect(() => {
    if (props.feature_id !== undefined){
      const sourceCollection = mapData?.sources.polygonHandles.data.features;
      const sourceFeature = (sourceCollection || []).find(feature => feature.properties.unique_id === props.feature_id);

      const popupCenter = sourceFeature.geometry.coordinates;
      const popupContent = <PopupContent feature={sourceFeature}/>

      setLocation(popupCenter);
      setContent(popupContent);
      setFeature(sourceFeature);
    }else{
      setFeature();
    }



  },[props.feature_id])

  return (
    <>
    {
      (feature && location && content) &&
      <MapPopup
      settings={{offset:10,anchor:'left'}}
      lngLat={location}
      onClose={handleClose}
      >
        {content}
      </MapPopup>
    }
    </>
  );
};

export default MapDrawingPopup;
