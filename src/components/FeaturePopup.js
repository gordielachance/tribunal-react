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
    activeFeature,
    setActiveFeatureId
  } = useMap();

  const [latLng,setLatLng] = useState();
  const [dataFeatureId,setDataFeatureId] = useState();

  let popupSettings = {
    anchor:'bottom'
  }

  if (!props.featureId) return;

  const feature = getFeatureById(props.featureId);

  const handleClose = e => {
    if (activeFeature !== props.featureId) return;
    setActiveFeatureId();
  }

  return (
    <>
      {
        feature &&
        <MapPopup
        lngLat={feature.geometry.coordinates}
        settings={popupSettings}
        onClose={handleClose}
        >
          <FeaturePopupContent featureId={feature.properties.id}/>
        </MapPopup>
      }

    </>
  );
};

export default FeaturePopup;
