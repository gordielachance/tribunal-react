import React,{useState,useEffect} from "react";
import { useParams } from 'react-router-dom';
import { Container } from 'semantic-ui-react';
import DatabaseAPI from "../databaseAPI/api";

import MapPost from "./MapPost";



const SingleMapPage = (props) => {

  const { mapPostId } = useParams();

  const [loading,setLoading] = useState(true);
  const [post,setPost] = useState();
  const [mapData,setMapData] = useState();


  //load map post on init
  useEffect(()=>{
    DatabaseAPI.getMapPost(mapPostId)
    .then(post => {
      setPost(post);
      setLoading(false);
    })

  },[])

  return(
    <Container id="singleMapPage" className="page horizontal-page">
      <MapPost
      title={post?.title.react}
      mapData={post?.map}
      />
    </Container>
  )
}

export default SingleMapPage
