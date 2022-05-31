import React, { useEffect,useState }  from "react";
import { useParams } from 'react-router-dom';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';
import { Loader,Dimmer } from 'semantic-ui-react';

import {DEBUG} from "../../Constants";

import './Map.scss';
import CreationModal from "./CreationModal";
import MapSidebar from "./MapSidebar";

import { useMap } from './MapContext';
import Map from "./Map";

const MapPost = (props) => {

  const {urlSourceId,urlFeatureId,urlFeatureAction} = useParams();
  const {mapboxMap,mapData,setRawMapData,mapHasInit,activeFeature,setActiveFeature} = useMap();

  const [loading,setLoading] = useState(true);

  //marker in URL
  useEffect(()=>{
    if (!mapHasInit) return;
    if (urlSourceId === undefined) return;
    if (urlFeatureId === undefined) return;

    const getSourceFeature = (sourceId,featureId) => {

  		const sources = mapData?.sources || {};
  		const source = sources[sourceId];
  		const features = source.data.features || [];

  		return features.find(feature => feature.properties.id === parseInt(featureId));

  	}

    const feature = getSourceFeature(urlSourceId,urlFeatureId);
    console.log("!!!FEATURE",feature);

    if (feature){

      //center on the marker since we need to have it in the viewport
      mapboxMap.easeTo({
        //center: [-75,43],
        center: feature.geometry.coordinates,
        duration: 2000,

      })

      //once done, set marker as active
      setActiveFeature(feature);

    }

  },[urlFeatureId,urlSourceId,mapHasInit])

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
      {
        ( activeFeature && (urlFeatureAction==='full') ) &&
        <CreationModal/>
      }
      <Map featureId={activeFeature}/>
    </Dimmer.Dimmable>
  );
}

export default MapPost
