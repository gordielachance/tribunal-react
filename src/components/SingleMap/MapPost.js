import React, { useEffect,useState }  from "react";
import { Link,useParams,useNavigate } from 'react-router-dom';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';
import {DEBUG,ImageLogo,getFeatureUrl} from "../../Constants";


import './Map.scss';
import WpPostModal from "../WpPostModal";
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
  const navigate = useNavigate();
  const {mapPostId,mapPostSlug,urlFeatureAction} = useParams();
  const {mapboxMap,mapData,setRawMapData,mapHasInit,activeFeature,setActiveFeature,featuresFilter,layersDisabled,updateSidebarFeatures} = useMap();
  const [loading,setLoading] = useState(true);

  const [modalPostId,setModalPostId] = useState();

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

    updateSidebarFeatures();
    mapboxMap.on('moveend',updateSidebarFeatures);

  },[mapHasInit])

  //update sidebar features when filters are updated
  useEffect(()=>{
    if (mapboxMap === undefined) return;
    setTimeout(updateSidebarFeatures,250); //wait map finishes refreshing before update (TOUFIX TOUCHECK use 'idle' event instead?)
  },[featuresFilter,layersDisabled])

  useEffect(()=>{

    let postId = undefined;

    if ( (urlFeatureAction==='full') && activeFeature){
      postId = activeFeature?.properties.id;
    }
    setModalPostId(postId);

  },[activeFeature,urlFeatureAction])

  const handleCloseModal = () => {
    const url = getFeatureUrl(mapPostId,mapPostSlug,activeFeature.properties.source,activeFeature.properties.id);
    navigate(url);
  }

  return (
    <div className="page-content">

      <MapSidebar
      title={props.title}
      id={props.id}
      />
      {
        ( modalPostId !== undefined ) &&
        <WpPostModal
        postId={modalPostId}
        onClose={handleCloseModal}
        />
      }
      <TdpLogoLink/>
      <MapLegend/>
      <Map/>
    </div>
  );
}

export default MapPost
