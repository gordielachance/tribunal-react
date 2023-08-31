import React,{useEffect,useState} from "react";
import { useApp } from './../AppContext';
import DatabaseAPI from "../databaseAPI/api";
import {DEBUG} from "../Constants";
import PagePosts from "./PagePosts";
import {BGMaps} from "./PageBackgrounds";

const PageMaps = (props) => {

  const {mapItems,setmapItems} = useApp();
  const [loading,setLoading] = useState();

  //load events on init
  useEffect(() => {

    let isSubscribed;

    if (mapItems === undefined){

      isSubscribed = true;
      setLoading(true);

  		const fetchData = async () => {
  	    DEBUG && console.info("GETTING MAPS...");
  	    const data = await DatabaseAPI.getItems('maps');
  			if (isSubscribed) {
  				DEBUG && console.info("...MAPS POSTS LOADED",data);
          setLoading(false);
  	      setmapItems(data);
  	    }
  		}

  	  fetchData();
    }

		//clean up fn
		return () => isSubscribed = false;

  }, [mapItems]);

  return(
    <div className="page-container">
      <PagePosts id="mapListPage" title="Cartes" items={mapItems}/>
      <BGMaps/>
    </div>
  )
}

export default PageMaps
