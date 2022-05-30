import React, { useEffect,useState }  from "react";
import { useParams } from 'react-router-dom';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';
import { Loader,Dimmer,Container } from 'semantic-ui-react';

import {DEBUG} from "./../Constants";

import './Map.scss';
import CreationModal from "./CreationModal";
import MapSidebar from "./MapSidebar";

import { useMap } from '../MapContext';
import Map from "./Map";

const MapPost = (props) => {

  const {postFeatureId} = useParams();
  const {mapboxMap,mapData,setRawMapData,mapHasInit,setActiveFeatureId,getFeatureById} = useMap();
  const [activePostId,setActivePostId] = useState();

  const [loading,setLoading] = useState(true);

  //marker in URL
  useEffect(()=>{
    if (mapboxMap === undefined) return;
    if (postFeatureId === undefined) return;

    const feature = getFeatureById('creations-'+postFeatureId);

    if (feature){
      DEBUG && console.log("SET ACTIVE FEATURE BASED ON THE POST ID",postFeatureId,feature);

      setActivePostId(feature.properties.post_id);

      //center on the marker since we need to have it in the viewport
      mapboxMap.jumpTo({
        //center: [-75,43],
        center: feature.geometry.coordinates,
      })

      //once done, set marker as active
      mapboxMap.once('idle',(e) => {
        setActiveFeatureId(feature.properties.id);
      })

    }

  },[postFeatureId,mapboxMap])

  //initialize map data
  useEffect(()=>{
    if (props.mapData === undefined) return;
    setRawMapData(props.mapData);
  },[props.mapData]);

  useEffect(()=>{
    if (mapHasInit){
      setLoading(false);
    }
  },[mapHasInit]);

  return (
    <Dimmer.Dimmable dimmed={loading} id="map-post-container">
      <Dimmer active={loading} inverted>
        <Loader />
      </Dimmer>
      <MapSidebar
      title={props.title}
      />
      <CreationModal postId={activePostId}/>
      <Map/>
    </Dimmer.Dimmable>
  );
}

export default MapPost
