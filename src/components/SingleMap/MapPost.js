import React, { useEffect,useState }  from "react";
import { useParams } from 'react-router-dom';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';
import { Loader,Dimmer } from 'semantic-ui-react';

import {DEBUG} from "../../Constants";

import './Map.scss';
import CreationModal from "./CreationModal";
import MapSidebar from "./MapSidebar";
import MapLegend from "./MapLegend";

import { useMap } from './MapContext';
import Map from "./Map";

const MapPost = (props) => {

  const {urlFeatureAction} = useParams();
  const {mapboxMap,mapData,setRawMapData,mapHasInit,activeFeature,setActiveFeature,sidebarFeatures} = useMap();
  const [loading,setLoading] = useState(true);


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
    <div id="map-post-container">
      <MapSidebar
      title={props.title}
      />
      {
        ( activeFeature && (urlFeatureAction==='full') ) &&
        <CreationModal/>
      }
      <MapLegend features={sidebarFeatures}/>
      <Map/>
    </div>
  );
}

export default MapPost
