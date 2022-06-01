import React,{useState,useEffect} from "react";
import { useParams } from 'react-router-dom';
import DatabaseAPI from "../databaseAPI/api";

import { MapProvider } from "./SingleMap/MapContext";
import MapPost from "./SingleMap/MapPost";



const PageSingleMap = (props) => {

  const { mapPostId } = useParams();

  const [loading,setLoading] = useState(true);
  const [post,setPost] = useState();

  //load map post on init
  useEffect(()=>{
    DatabaseAPI.getMapPost(mapPostId)
    .then(post => {
      setPost(post);
      setLoading(false);
    })

  },[])

  return(
    <div id="singleMapPage" className="page">
      <MapProvider>
        <MapPost
        title={post?.title.react}
        mapData={post?.map}
        />
      </MapProvider>
    </div>
  )
}

export default PageSingleMap
