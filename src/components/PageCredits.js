import React,{useEffect,useState} from "react";
import {WP_POST_ID_CONTACT} from "./../Constants";
import { useApp } from './../AppContext';
import PageMenu from "./PageMenu";
import DatabaseAPI from "../databaseAPI/api";
import {DEBUG} from "../Constants";
import { Loader,Dimmer } from 'semantic-ui-react';
import {BGCredits} from "./PageBackgrounds";

const PageCredits = (props) => {

  const {creditsPost,setCreditsPost} = useApp();
  const [loading,setLoading] = useState();

  //load credits post on init
  useEffect(() => {

    let isSubscribed;

    if (creditsPost === undefined){

      isSubscribed = true;
      setLoading(true);

  		const fetchData = async () => {
  	    DEBUG && console.info("GETTING CREDITS PAGE...");
  	    const data = await DatabaseAPI.getPage(WP_POST_ID_CONTACT);
  			if (isSubscribed) {
  				DEBUG && console.info("...CREDITS PAGE LOADED",data);
          setLoading(false);
  	      setCreditsPost(data);
  	    }
  		}

  	  fetchData();
    }

		//clean up fn
		return () => isSubscribed = false;

  }, [creditsPost]);

  return(
    <div className="page-container">
      <div id="creditsPage" className="page">
        <div className="page-header">
          <h1>Crédits</h1>
          <PageMenu/>
        </div>
        <Dimmer.Dimmable as="div" dimmed={loading} className="page-content">
          <Dimmer active={loading} inverted>
            <Loader />
          </Dimmer>
          {
            creditsPost?.content.rendered &&
            <div
              dangerouslySetInnerHTML={{__html: creditsPost.content.rendered}}
            />
          }
        </Dimmer.Dimmable>
      </div>
      <BGCredits/>
    </div>
  )
}

export default PageCredits
