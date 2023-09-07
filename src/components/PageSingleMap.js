import React,{useState,useEffect} from "react";
import { useParams } from 'react-router-dom';
import {DEBUG} from "../Constants";
import { MapProvider } from "./SingleMap/MapContext";
import MapPost from "./SingleMap/MapPost";



const PageSingleMap = (props) => {

  const { mapPostId } = useParams();

  const [loading,setLoading] = useState(true);


  return(
    <div className="page-container">
      <div id="singleMapPage" className="page">
        <MapProvider>
          <MapPost id={parseInt(mapPostId)}/>
        </MapProvider>
      </div>
    </div>
  )
}

export default PageSingleMap
