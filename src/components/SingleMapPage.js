import React,{useState,useEffect} from "react";
import { useParams } from 'react-router-dom';
import { Container } from 'semantic-ui-react';
import DatabaseAPI from "../databaseAPI/api";

import { MapProvider } from "../MapContext";
import MapPost from "./MapPost";



const SingleMapPage = (props) => {

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
    <div id="singleMapPage" className="page horizontal-page">
      <MapProvider>
        <MapPost
        title={post?.title.react}
        mapData={post?.map}
        />
      </MapProvider>
    </div>
  )
}

export default SingleMapPage
