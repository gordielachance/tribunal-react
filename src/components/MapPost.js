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

  const {featurePostId} = useParams();
  const {mapboxMap,mapData,setRawMapData,setActiveFeatureId} = useMap();

  const [loading,setLoading] = useState(true);

  //marker in URL
  useEffect(()=>{
    if (mapboxMap === undefined) return;
    if (featurePostId === undefined) return;

    //get the source feature based on its post ID
    const creationFeatures = mapData?.sources.creations?.data.features || [];
    const feature = creationFeatures.find(feature => {
      return (feature.properties.post_id === parseInt(featurePostId));
    })

    if (feature){
      DEBUG && console.log("SET ACTIVE FEATURE BASED ON THE POST ID",featurePostId,feature);

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

  },[featurePostId,mapboxMap])

  //initialize map data
  useEffect(()=>{
    if (props.mapData === undefined) return;
    setRawMapData(props.mapData);
  },[props.mapData]);

  useEffect(()=>{
    mapboxMap?.once('idle', (e) => {
      setLoading(false);
    });

  },[mapboxMap]);

  return (
    <Dimmer.Dimmable dimmed={loading} id="map-post-container">
      <Dimmer active={loading} inverted>
        <Loader />
      </Dimmer>
      <MapSidebar
      title={props.title}
      />
      <CreationModal postId={featurePostId}/>
      <Map/>
    </Dimmer.Dimmable>
  );
}

export default MapPost
