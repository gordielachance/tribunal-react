import React, { useEffect,useState }  from "react";
import { Link,useParams,useNavigate } from 'react-router-dom';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';
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
  const {mapboxMap,mapData,setMapData,mapHasInit,activeFeature,featuresFilter,layersDisabled,getPointUrl} = useMap();

  const [modalPostId,setModalPostId] = useState();

  const [item,setItem] = useState();

  //load map on init
  useEffect(()=>{

    let isSubscribed = true;

    const fetchData = async mapId => {
	    const data = await DatabaseAPI.getSingleItem('maps',mapId,{mapbox:true});
			if (isSubscribed) {
        DEBUG && console.log("GOT MAP ITEM",mapPostId,JSON.parse(JSON.stringify(data || [])))
        setMapData(data);
	    }
		}

	  fetchData(props.id);

		//clean up fn
		return () => isSubscribed = false;

  },[props.id])

  useEffect(()=>{

    let postId = undefined;

    if ( (urlItemType==='posts') && activeFeature){
      postId = activeFeature?.properties.post_id;
    }
    setModalPostId(postId);

  },[activeFeature,urlItemType])

  const handleCloseModal = () => {
    const url = getPointUrl(activeFeature.properties.id);
    navigate(url);
  }

  return (
    <div className="page-content">
      {
        ( modalPostId !== undefined ) &&
        <WpPostModal
        postId={modalPostId}
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
