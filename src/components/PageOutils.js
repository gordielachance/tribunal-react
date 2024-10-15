import React,{useEffect,useState} from "react";
import {WP_POST_ID_OUTILS} from "./../Constants";
import { useApp } from './../AppContext';
import PageMenu from "./PageMenu";
import DatabaseAPI from "../databaseAPI/api";
import {DEBUG} from "../Constants";
import { Loader,Dimmer } from 'semantic-ui-react';
import {BGCredits} from "./PageBackgrounds";

const PageOutils = (props) => {

  const {toolsPost,setToolsPost} = useApp();
  const [loading,setLoading] = useState();

  //load credits post on init
  useEffect(() => {

    let isSubscribed;

    if (toolsPost === undefined){

      isSubscribed = true;
      setLoading(true);

  		const fetchData = async () => {
  	    DEBUG && console.info("GETTING TOOLS PAGE...");
  	    const data = await DatabaseAPI.getSingleItem('pages',WP_POST_ID_OUTILS);
  			if (isSubscribed) {
  				DEBUG && console.info("...TOOLS PAGE LOADED",data);
          setLoading(false);
  	      setToolsPost(data);
  	    }
  		}

  	  fetchData();
    }

		//clean up fn
		return () => isSubscribed = false;

  }, [toolsPost]);

  return(
    <div className="page-container">
      <div id="toolsPage" className="page">
        <div className="page-header">
          <h1>Boîte à outils</h1>
          <PageMenu/>
        </div>
        <Dimmer.Dimmable as="div" dimmed={loading} className="page-content">
          <Dimmer active={loading} inverted>
            <Loader />
          </Dimmer>
          {
            toolsPost?.content.rendered &&
            <div
              dangerouslySetInnerHTML={{__html: toolsPost.content.rendered}}
            />
          }
        </Dimmer.Dimmable>
      </div>
      <BGCredits/>
    </div>
  )
}

export default PageOutils
