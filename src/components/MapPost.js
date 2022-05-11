import React, { useEffect,useState }  from "react";
import { useParams,useNavigate } from 'react-router-dom';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';
import { Loader,Dimmer,Container } from 'semantic-ui-react';

import {DEBUG} from "./../Constants";

import './Map.scss';
import CreationModal from "./CreationModal";
import MapSidebar from "./MapSidebar";

import { useMap } from '../MapContext';
import Map from "./Map";

const MapPost = (props) => {

  const navigate = useNavigate();

  const {mapPostId,mapPostSlug,featurePostId} = useParams();
  const {mapboxMap,setRawMapData,setActiveFeatureId} = useMap();

  const [loading,setLoading] = useState(true);

  //marker in URL
  useEffect(()=>{
    if (featurePostId === undefined) return;
    console.log("POPULATE CREATION FROM URL",featurePostId);
    /*
    setActiveFeatureId({
      source:'creations',
      id:featurePostId,
      context:'map'
    });
    */

  },[featurePostId])

  //initialize map data
  useEffect(()=>{
    if (props.mapData === undefined) return;
    setRawMapData(props.mapData);
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
      <MapSidebar
      title={props.title}
      active={true}
      />
      <CreationModal/>
      <Map/>
    </Dimmer.Dimmable>
  );
}

export default MapPost
