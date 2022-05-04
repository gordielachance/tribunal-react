import React,{useState,useEffect} from "react";
import { useParams,Link } from 'react-router-dom';
import { Container } from 'semantic-ui-react';
import DatabaseAPI from "../databaseAPI/api";

import Map from "./Map";



const SingleMapPage = (props) => {

  const { mapId } = useParams();

  const [loading,setLoading] = useState(true);
  const [post,setPost] = useState();
  const [mapData,setMapData] = useState();

  const prepareMapData = data => {

    //set unique IDs for features in geojson sources
    const setFeatureIds = (features,prefix) => {
      for (var index in features) {
        const feature = features[index];
        const id = `${prefix}-${index}`;

        features[index] = {
          ...feature,
          properties:{
            ...feature.properties,
            unique_id:id
          }
        }
      }
      console.info("...POPULATED UNIQUE IDs FOR FEATURES IN SOURCE",prefix,features);
    }

    for (var key in data.sources) {

      const source = data.sources[key];

      if (source.type === 'geojson'){

        data.sources[key] = {
          ...data.sources[key],
          promoteId:'unique_id' //property to use for mapbox features IDs.
          //generateId:   true
        }

        setFeatureIds(source.data.features,key);
      }

    }
    return data;
  }

  //load map post on init
  useEffect(()=>{
    DatabaseAPI.getMapPost(mapId)
    .then(post => {
      setPost(post);
    })

  },[])

  useEffect(()=>{
    if (post === undefined) return;
    console.log("MAP POST POPULATED",post);
    const mapData = prepareMapData(post?.map);
    setMapData(mapData);
  },[post])

  useEffect(()=>{
    if (mapData === undefined) return;
    console.log("MAP DATA POPULATED",mapData);
    setLoading(false);
  },[mapData])

  return(
    <Container id="singleMapPage" className="page horizontal-page">
      <Map
      title={post?.title.react}
      data={mapData}
      />
    </Container>
  )
}

export default SingleMapPage
