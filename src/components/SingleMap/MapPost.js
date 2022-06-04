import React, { useEffect,useState }  from "react";
import { Link,useParams } from 'react-router-dom';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';
import { Loader,Dimmer } from 'semantic-ui-react';

import {DEBUG,ImageLogo} from "../../Constants";


import './Map.scss';
import {getUniqueMapFeatures} from "./MapFunctions";
import CreationModal from "./CreationModal";
import MapSidebar from "./MapSidebar";
import MapLegend from "./MapLegend";

import { useMap } from './MapContext';
import Map from "./Map";

export const TdpLogoLink = props => {
  return(
    <div className="site-logo">
      <Link to="/">
        <img src={ImageLogo}/>
      </Link>
    </div>
  )
}

const MapPost = (props) => {

  const {urlFeatureAction} = useParams();
  const {mapboxMap,mapData,setRawMapData,mapHasInit,activeFeature,setActiveFeature,featuresFilter,layersDisabled} = useMap();
  const [loading,setLoading] = useState(true);
	const [sidebarFeatures,setSidebarFeatures] = useState();

  const populateVisibleFeatures = e => {
    //get visible features on map for use in the sidebar

    const getVisibleFeatures = (layerIds) => {
      let features = mapboxMap.queryRenderedFeatures({
        layers: layerIds,
        filter: featuresFilter
      }) || [];
      return getUniqueMapFeatures(features);
    }

    const features = getVisibleFeatures(['creations','annotationsHandles','events']);

    setSidebarFeatures(features);
  }

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

  //update sidebar features when map initialize or is moved
  useEffect(()=>{
    if (!mapHasInit) return;

    populateVisibleFeatures();
    mapboxMap.on('moveend',populateVisibleFeatures);

  },[mapHasInit])

  //update sidebar features when filters are updated
  useEffect(()=>{
    if (mapboxMap === undefined) return;
    setTimeout(populateVisibleFeatures,250); //wait map finishes refreshing before update (TOUFIX TOUCHECK use 'idle' event instead?)
  },[featuresFilter,layersDisabled])

  return (
    <div className="page-content">

      <MapSidebar
      title={props.title}
      features={sidebarFeatures}
      />
      {
        ( activeFeature && (urlFeatureAction==='full') ) &&
        <CreationModal/>
      }
      <TdpLogoLink/>
      <MapLegend features={sidebarFeatures}/>
      <Map/>
    </div>
  );
}

export default MapPost
