import React, { useEffect,useState }  from "react";
import { Link,useParams,useNavigate } from 'react-router-dom';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';
import * as turf from "@turf/turf";

import {DEBUG,ImageLogo} from "../../Constants";


import './Map.scss';
import WpPostModal from "../WpPostModal";
import Sidebar from "./Sidebar";
import MapLegend from "./MapLegend";
import DatabaseAPI from "../../databaseAPI/api";

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
  const {mapPostId,mapPostSlug,urlItemType} = useParams();
  const {
    mapboxMap,
    mapData,
    setMapId,
    mapHasInit,
    activeFeature,
    getPointUrl,
    assignAreasToPoints,
    getMapPostById
  } = useMap();

  const [item,setItem] = useState();

  //pass ID to context
  useEffect(()=>{
    setMapId(props.id);
  },[props.id])

  const handleCloseModal = () => {
    const url = getPointUrl(activeFeature.properties.id);
    navigate(url);
  }

  return (
    <div className="page-content" id={`map-${props.id}`}>
      {
        ( (urlItemType==='posts') && activeFeature ) &&
        <WpPostModal
        id={activeFeature.properties.wp_id}
        title={activeFeature.properties.post_title}
        onClose={handleCloseModal}
        />
      }
      <Sidebar/>
      <MapLegend/>
      <Map/>
    </div>
  );
}

export default MapPost
