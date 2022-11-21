import React from "react";
import { Button } from 'semantic-ui-react';

import MapPopup from "./MapPopup";
import { CreationCard } from "./CreationCard";
import { useMap } from './MapContext';
import { useParams,useNavigate } from 'react-router-dom';

import {getFeatureUrl,getMapUrl} from "../../Constants";

const FeaturePopupContent = (props) => {

  const navigate = useNavigate();
  const {mapPostSlug,mapPostId} = useParams();

  const hasMore = props.feature?.properties.has_more;

  return (
    <div className="feature-popup">
      <CreationCard
      feature={props.feature}
      highlightTags={true}
      />
      {
        hasMore &&
        <div className="popup-actions">
          <Button onClick={props.onClick}>Ouvrir</Button>
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

  const handleClose = () => {
    //TOUFIX URGENT something fucks up when opening the popup, there is probably a conflict in the flow.
    /*
    if (JSON.stringify(activeFeature) !== JSON.stringify(props.feature)) return;
    const url = getMapUrl(mapPostId,mapPostSlug);
    navigate(url);
    */
  }

  const handleOpen = e => {
    e.preventDefault();
    const url = getFeatureUrl(mapPostId,mapPostSlug,props.feature.properties.source,props.feature.properties.id,'full');
    navigate(url);
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
          <FeaturePopupContent feature={props.feature} onClick={handleOpen}/>
        </MapPopup>
      }

    </>
  );
};

export default FeaturePopup;
