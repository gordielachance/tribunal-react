import React, { useEffect, useRef } from "react";
import mapboxgl from '!mapbox-gl'; // eslint-disable-line import/no-webpack-loader-syntax
import { Button } from 'semantic-ui-react';

import { FeatureCard } from "./FeatureCard";
import { useMap } from './MapContext';
import { useParams,useNavigate } from 'react-router-dom';

import {DEBUG} from "../../Constants";

const FeaturePopup = props => {

  const navigate = useNavigate();
  const {
    mapboxMap,
    activeFeature,
    getMapUrl,
    getPostUrl,
    getMapPostById
  } = useMap();
  const popupRef = useRef(null);
  const popupContentRef = useRef();
  const postId = activeFeature?.properties.wp_id;
  const post = postId ? getMapPostById(postId) : undefined;

  const handleClose = () => {
    DEBUG && console.log("CLOSE POST POPUP",postId);
    const url = getMapUrl();
    navigate(url);
  }

  const handleOpen = e => {
    DEBUG && console.log("OPEN POST POPUP",postId);
    e.preventDefault();
    if (!post) return;
    const feature_url = getPostUrl(post);
    navigate(feature_url);
  }

  //on init
  useEffect(() => {
    if (mapboxMap.current === undefined) return;

    if (activeFeature){
      // Create a new popup instance
      //https://docs.mapbox.com/mapbox-gl-js/api/markers/#popup
      popupRef.current = new mapboxgl.Popup({
        anchor: "bottom",
      })
      .setLngLat(activeFeature.geometry.coordinates)
      .setDOMContent(popupContentRef.current)
      .addTo(mapboxMap.current)
      .on('close',handleClose)
    }

    //clean-up
    return () => {
      popupRef.current
      .off('close',handleClose)
      .remove();
    }

  }, [activeFeature]);

  return (
    <div style={{ display: "none" }}>
      <div ref={popupContentRef}>
        {
          post &&
          <div className="feature-popup">
            <FeatureCard type={post?.type} id={post?.id}/>
            {
              post.has_more &&
              <div className="popup-actions">
                <Button onClick={handleOpen}>Ouvrir</Button>
              </div>
            }
          </div>
        }

      </div>
    </div>
  );
};

export default FeaturePopup;
