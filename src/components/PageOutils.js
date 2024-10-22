import React,{useEffect,useState} from "react";
import {WP_PAGE_ID_TOOLS,WP_CAT_ID_TOOLS} from "./../Constants";
import { useApp } from './../AppContext';
import PagePosts from "./PagePosts";
import DatabaseAPI from "../databaseAPI/api";
import {DEBUG} from "../Constants";
import {BGCreations} from "./PageBackgrounds";

const PageOutils = (props) => {

  const {toolsPage,setToolsPage} = useApp();
  const {toolsPosts,setToolsPosts} = useApp();
  const [loading,setLoading] = useState();
  const [pageLoading,setPageLoading] = useState();

  //load page on init
  useEffect(() => {

    let isSubscribed;

    if (toolsPage === undefined){

      isSubscribed = true;
      setPageLoading(true);

  		const fetchData = async () => {
  	    DEBUG && console.info("GETTING TOOLS PAGE...");
  	    const data = await DatabaseAPI.getSingleItem('pages',WP_PAGE_ID_TOOLS);
  			if (isSubscribed) {
  				DEBUG && console.info("...TOOLS PAGE LOADED",data);
          setPageLoading(false);
  	      setToolsPage(data);
  	    }
  		}

  	  fetchData();
    }

		//clean up fn
		return () => isSubscribed = false;

  }, [toolsPage]);


  //load posts on init
  useEffect(() => {

    let isSubscribed;

    if (toolsPosts === undefined){

      isSubscribed = true;
      setLoading(true);

  		const fetchData = async () => {
  	    const data = await DatabaseAPI.getItems('features',{
          categories:WP_CAT_ID_TOOLS,
          format:'frontend'
        });

  			if (isSubscribed) {
  				DEBUG && console.info("...TOOLS POSTS LOADED",data);
          setLoading(false);
  	      setToolsPosts(data);
  	    }
  		}

  	  fetchData();
    }

		//clean up fn
		return () => isSubscribed = false;

  }, [toolsPosts]);

  return(
    <div className="page-container">
      <PagePosts
      id="toolsPage"
      title="Boîte à Outils"
      page={toolsPage}
      posts={toolsPosts}
      />
      <BGCreations/>
    </div>
  )
}

export default PageOutils
