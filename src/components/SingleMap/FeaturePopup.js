import React, { useEffect, useRef } from "react";
import mapboxgl from '!mapbox-gl'; // eslint-disable-line import/no-webpack-loader-syntax
import { Button } from 'semantic-ui-react';

import { CreationCard } from "./CreationCard";
import { useMap } from './MapContext';
import { useParams,useNavigate } from 'react-router-dom';

import {DEBUG,getFeatureUrl,getMapUrl} from "../../Constants";

const FeaturePopup = props => {

  const navigate = useNavigate();
  const {mapPostSlug,mapPostId} = useParams();
  const {mapboxMap} = useMap();
  const popupRef = useRef();

  const feature_url = getFeatureUrl(mapPostId,mapPostSlug,props.feature.properties.source,props.feature.properties.id);


  //https://docs.mapbox.com/mapbox-gl-js/api/markers/#popup
  const popup = new mapboxgl.Popup({
    anchor:'bottom'
  })

  const handleClose = () => {
    /*
    It seems that mapbox fires the popup close event when the user clicks the icon,
    but also when it is destroyed.
    So we need to ensure that we don't redirect to the map URL twice.
    */

    /*

    console.log("URL FEATURE",urlSourceId, urlFeatureId);
    console.log("CURRENT FEATURE",props.feature.properties.source,props.feature.properties.id);

    DEBUG && console.log("CLOSE FEATURE POPUP",props.feature.properties.id);
    const url = getMapUrl(mapPostId,mapPostSlug);
    navigate(url);
    */
  }

  const handleOpen = e => {
    DEBUG && console.log("HANDLE OPEN",props.feature.properties.id);
    e.preventDefault();
    navigate(feature_url + '/full');
  }

  //on init
  useEffect(() => {
    if (mapboxMap === undefined) return;

    if (props.feature){
      popup
      .setLngLat(props.feature.geometry.coordinates)
      .setDOMContent(popupRef.current)
      .addTo(mapboxMap)
      .on('close',handleClose)
    }

    return () => {
      popup.remove();
    };

  }, [props.feature]);

  return (
    <div style={{ display: "none" }}>
      <div ref={popupRef}>
        <div className="feature-popup">
          <CreationCard
          feature={props.feature}
          highlightTags={true}
          />
          {
            props.feature.properties.has_more &&
            <div className="popup-actions">
              <Button onClick={handleOpen}>Ouvrir</Button>
            </div>
          }

        </div>
      </div>
    </div>
  );
};

export default FeaturePopup;
//TOUFIX TOUCHECK use react.memo ?
