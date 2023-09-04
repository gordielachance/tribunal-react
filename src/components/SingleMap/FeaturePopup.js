import React, { useEffect, useRef } from "react";
import mapboxgl from '!mapbox-gl'; // eslint-disable-line import/no-webpack-loader-syntax
import { Button } from 'semantic-ui-react';

import { FeatureCard } from "./FeatureCard";
import { useMap } from './MapContext';
import { useParams,useNavigate } from 'react-router-dom';

import {DEBUG,getFeaturePostUrl,getMapUrl} from "../../Constants";

const FeaturePopup = props => {

  const navigate = useNavigate();
  const {mapPostSlug,mapPostId} = useParams();
  const {mapboxMap,activeFeature,setActiveFeature} = useMap();
  const popupRef = useRef();
  const feature = activeFeature;

  //https://docs.mapbox.com/mapbox-gl-js/api/markers/#popup
  const popup = new mapboxgl.Popup({
    anchor:'bottom'
  })


  const handleClose = () => {
    DEBUG && console.log("CLOSE FEATURE POPUP",feature.properties.id);
    const url = getMapUrl(mapPostId,mapPostSlug);
    navigate(url);
  }

  const handleOpen = e => {
    DEBUG && console.log("HANDLE OPEN",feature.properties.id);
    e.preventDefault();
    const feature_url = getFeaturePostUrl(mapPostId,mapPostSlug,feature.source,feature.properties.id);
    navigate(feature_url + '/full');
  }

  //on init
  useEffect(() => {
    if (mapboxMap.current === undefined) return;

    if (feature){
      popup
      .setLngLat(feature.geometry.coordinates)
      .setDOMContent(popupRef.current)
      .addTo(mapboxMap.current)
      .on('close',handleClose)
    }

  }, [activeFeature]);

  return (
    <>
    {
      feature &&
      <div style={{ display: "none" }}>
        <div ref={popupRef}>
          <div className="feature-popup">
            <FeatureCard
            feature={feature}
            />
            {
              feature.properties.has_more &&
              <div className="popup-actions">
                <Button onClick={handleOpen}>Ouvrir</Button>
              </div>
            }

          </div>
        </div>
      </div>
    }
    </>

  );
};

export default FeaturePopup;
//TOUFIX TOUCHECK use react.memo ?
