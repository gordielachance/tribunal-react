import React,{useState,useEffect} from "react";
import { useParams,Link } from 'react-router-dom';
import { Container } from 'semantic-ui-react';
import axios from 'axios';
import {WP_URL} from "./../Constants";

import Map from "./Map";

const getSingleMap = (post_id) => {
  return axios.get(
    WP_URL + '/wp-json/wp/v2/maps/' + post_id,
    {
    headers: {
      'Content-Type': 'application/json'
    }
  })
  .then(response => response.data)
}

const SingleMapPage = (props) => {

  const { mapId } = useParams();

  const [loading,setLoading] = useState();
  const [post,setPost] = useState();

  //load map post
  useEffect(()=>{
    setLoading(true);
    getSingleMap(mapId)
    .then(post => {
      console.log("MAP POPULATED",post);
      setPost(posts);

    })
    .catch(error => {
      // react on errors.
      console.error("error while fetching map",error);
    })
    .finally(()=>{
      setLoading(false);
    })
  },[])

  return(
    <Container id="singleMapPage" className="page horizontal-page">
      <Map/>
    </Container>
  )
}

export default SingleMapPage
