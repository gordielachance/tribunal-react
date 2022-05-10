import React, { useEffect,useState }  from "react";
import { useParams,useNavigate } from 'react-router-dom';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';
import { Loader,Dimmer,Container } from 'semantic-ui-react';

import {DEBUG} from "./../Constants";

import './Map.scss';
import MarkerPost from "./MarkerPost";
import MapSidebar from "./MapSidebar";

import { useMap } from '../MapContext';
import Map from "./Map";

const MapPost = (props) => {

  const navigate = useNavigate();

  const {mapPostName,creationPostId} = useParams();
  const {mapboxMap,setMapData,setActiveFeatureId} = useMap();

  const [loading,setLoading] = useState(true);

  //marker in URL
  useEffect(()=>{
    if (creationPostId === undefined) return;
    console.log("POPULATE CREATION FROM URL",creationPostId);
    setActiveFeatureId({
      source:'creations',
      id:creationPostId,
      context:'map'
    });

  },[creationPostId])

  //initialize map data
  useEffect(()=>{
    if (props.mapData === undefined) return;
    setMapData(props.mapData);
  },[props.mapData]);

  useEffect(()=>{
    if (mapboxMap === undefined) return;
    setLoading(false);
  },[mapboxMap]);

  return (
    <Dimmer.Dimmable as={Container} dimmed={loading} id="map-post-container">
      <Dimmer active={loading} inverted>
        <Loader />
      </Dimmer>
      <MarkerPost
      post_id={creationPostId}
      onClose={()=>navigate(`/carte/${mapPostName}`)}
      />
      <MapSidebar
      title={props.title}
      active={true}
      />
      <Map/>
    </Dimmer.Dimmable>
  );
}

export default MapPost
