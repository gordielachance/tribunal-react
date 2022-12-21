import React,{useState,useEffect} from "react";
import { useParams } from 'react-router-dom';
import DatabaseAPI from "../databaseAPI/api";
import {DEBUG} from "../Constants";
import { MapProvider } from "./SingleMap/MapContext";
import MapPost from "./SingleMap/MapPost";



const PageSingleMap = (props) => {

  const { mapPostId } = useParams();

  const [loading,setLoading] = useState(true);
  const [post,setPost] = useState();

  //load map post on init
  useEffect(()=>{

    let isSubscribed = true;

    const fetchData = async () => {
	    const data = await DatabaseAPI.getMapPost(mapPostId);
			if (isSubscribed) {
        DEBUG && console.log("GOT MAP POST",mapPostId,JSON.parse(JSON.stringify(data || [])))
        setPost(data);
        setLoading(false);
	    }
		}

	  fetchData();

		//clean up fn
		return () => isSubscribed = false;


  },[])

  return(
    <div class="page-container">
      <div id="singleMapPage" className="page">
        <MapProvider>
          <MapPost
          title={post?.title.react}
          mapData={post?.map}
          />
        </MapProvider>
      </div>
    </div>
  )
}

export default PageSingleMap
