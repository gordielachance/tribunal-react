import React, { useEffect,useState }  from "react";
import { Link,useParams,useNavigate } from 'react-router-dom';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';
import {DEBUG,ImageLogo} from "../../Constants";


import './Map.scss';
import WpPostModal from "../WpPostModal";
import Sidebar from "./Sidebar";
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
  const {mapboxMap,mapData,setMapData,mapHasInit,activeFeature,setActiveFeature,featuresFilter,layersDisabled,getPostUrl} = useMap();
  const [loading,setLoading] = useState(true);

  const [modalPostId,setModalPostId] = useState();

  //initialize map data
  useEffect(()=>{
    if (props.mapData === undefined) return;
    setMapData(props.mapData);
  },[props.mapData]);

  useEffect(()=>{
    if (mapHasInit){
      setLoading(false);
    }
  },[mapHasInit]);

  useEffect(()=>{

    let postId = undefined;

    if ( (urlFeatureAction==='full') && activeFeature){
      postId = activeFeature?.properties.id;
    }
    setModalPostId(postId);

  },[activeFeature,urlFeatureAction])

  const handleCloseModal = () => {
    const url = getPostUrl(activeFeature.properties.post_id);
    navigate(url);
  }

  return (
    <div className="page-content">

      <Sidebar
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
