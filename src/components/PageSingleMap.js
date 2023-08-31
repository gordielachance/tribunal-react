import React,{useState,useEffect} from "react";
import { useParams } from 'react-router-dom';
import DatabaseAPI from "../databaseAPI/api";
import {DEBUG} from "../Constants";
import { MapProvider } from "./SingleMap/MapContext";
import MapPost from "./SingleMap/MapPost";



const PageSingleMap = (props) => {

  const { mapPostId } = useParams();

  const [loading,setLoading] = useState(true);
  const [item,setItem] = useState();

  //load map on init
  useEffect(()=>{

    let isSubscribed = true;

    const fetchData = async () => {
	    const data = await DatabaseAPI.getSingleItem('maps',mapPostId,{mapbox:true});
			if (isSubscribed) {
        DEBUG && console.log("GOT MAP ITEM",mapPostId,JSON.parse(JSON.stringify(data || [])))
        setItem(data);
        setLoading(false);
	    }
		}

	  fetchData();

		//clean up fn
		return () => isSubscribed = false;


  },[])

  return(
    <div className="page-container">
      <div id="singleMapPage" className="page">
        <MapProvider>
          <MapPost
          mapData={item}
          id={item?.id}
          title={item?.name}
          description={item?.description}
          />
        </MapProvider>
      </div>
    </div>
  )
}

export default PageSingleMap
