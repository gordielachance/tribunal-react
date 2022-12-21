import React,{useEffect,useState} from "react";
import { useApp } from './../AppContext';
import DatabaseAPI from "../databaseAPI/api";
import {DEBUG} from "../Constants";
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
  	    DEBUG && console.info("GETTING CREATIONS POSTS...");
  	    const data = await DatabaseAPI.getCreations();
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
    <div class="page-container">
      <PagePosts id="creationsPage" title="Créations" posts={creationPosts}/>
      <BGCreations/>
    </div>
  )
}

export default PageCreations
