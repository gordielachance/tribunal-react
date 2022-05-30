import React from "react";
import { Button } from 'semantic-ui-react';

import MapPopup from "./MapPopup";
import { CreationCard } from "./CreationCard";
import { useMap } from '../MapContext';
import { useParams,useNavigate } from 'react-router-dom';

import {getFeatureUrl} from "./../Constants";

const FeaturePopupContent = (props) => {

  const navigate = useNavigate();
  const {mapPostSlug,mapPostId} = useParams();

  const hasMore = props.feature?.properties.has_more;

  const handleClick = () => {
    const url = getFeatureUrl(mapPostId,mapPostSlug,props.feature.properties.source,props.feature.properties.id,'full');
    navigate(url);
  }

  return (
    <div className="feature-popup">
      <CreationCard
      feature={props.feature}
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

  const navigate = useNavigate();
  const {mapPostSlug,mapPostId} = useParams();

  const {
    activeFeature
  } = useMap();

  let popupSettings = {
    anchor:'bottom'
  }

  const handleClose = e => {
    /*
    if (JSON.stringify(activeFeature) !== JSON.stringify(props.feature)) return;
    const url = getMapUrl(mapPostId,mapPostSlug);
    navigate(url);
    */
  }

  return (
    <>
      {
        props.feature &&
        <MapPopup
        lngLat={props.feature.geometry.coordinates}
        settings={popupSettings}
        onClose={handleClose}
        >
          <FeaturePopupContent feature={props.feature}/>
        </MapPopup>
      }

    </>
  );
};

export default FeaturePopup;
