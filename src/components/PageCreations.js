import React,{useEffect,useState} from "react";
import { useApp } from './../AppContext';
import DatabaseAPI from "../databaseAPI/api";
import {DEBUG,WP_CAT_ID_CREATION} from "../Constants";
import PagePosts from "./PagePosts";
import {BGCreations} from "./PageBackgrounds";


const PageCreations = (props) => {

  const {creationPosts,setCreationPosts} = useApp();
  const [loading,setLoading] = useState();

  //load posts on init
  useEffect(() => {

    let isSubscribed;

    if (creationPosts === undefined){

      isSubscribed = true;
      setLoading(true);

  		const fetchData = async () => {
  	    const data = await DatabaseAPI.getItems('features',{categories:WP_CAT_ID_CREATION,frontend:true});
  			if (isSubscribed) {
  				DEBUG && console.info("...CREATIONS POSTS LOADED",data);
          setLoading(false);
  	      setCreationPosts(data);
  	    }
  		}

  	  fetchData();
    }

		//clean up fn
		return () => isSubscribed = false;

  }, [creationPosts]);

  return(
    <div className="page-container">
      <PagePosts id="creationsPage" title="Créations" posts={creationPosts}/>
      <BGCreations/>
    </div>
  )
}

export default PageCreations
