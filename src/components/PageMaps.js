import React,{useEffect,useState} from "react";
import { useApp } from './../AppContext';
import DatabaseAPI from "../databaseAPI/api";
import {DEBUG} from "../Constants";
import PagePosts from "./PagePosts";
import {BGMaps} from "./PageBackgrounds";

const PageMaps = (props) => {

  const {mapPosts,setMapPosts} = useApp();
  const [loading,setLoading] = useState();

  //load events on init
  useEffect(() => {

    let isSubscribed;

    if (mapPosts === undefined){

      isSubscribed = true;
      setLoading(true);

  		const fetchData = async () => {
  	    DEBUG && console.info("GETTING MAPS POSTS...");
  	    const data = await DatabaseAPI.getMaps();
  			if (isSubscribed) {
  				DEBUG && console.info("...MAPS POSTS LOADED",data);
          setLoading(false);
  	      setMapPosts(data);
  	    }
  		}

  	  fetchData();
    }

		//clean up fn
		return () => isSubscribed = false;

  }, [mapPosts]);

  return(
    <div class="page-container">
      <PagePosts id="mapListPage" title="Cartes" posts={mapPosts}/>
      <BGMaps/>
    </div>
  )
}

export default PageMaps
