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
  const popupRef = useRef();
  const feature = activeFeature;
  const postId = activeFeature?.properties.post_id;
  const post = postId ? getMapPostById(postId) : undefined;
  const postType = post?.type;

  //https://docs.mapbox.com/mapbox-gl-js/api/markers/#popup
  const popup = new mapboxgl.Popup({
    anchor:'bottom'
  })


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
            <FeatureCard type={postType} id={postId}/>
            {
              post.has_more &&
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
