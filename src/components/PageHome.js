import React,{useEffect,useState} from "react";
import { useApp } from './../AppContext';
import PageMenu from "./PageMenu";
import DatabaseAPI from "../databaseAPI/api";
import { Loader,Dimmer } from 'semantic-ui-react';
import {DEBUG,WP_POST_ID_HOME,ImageLogo} from "../Constants";
import {BGHome} from "./PageBackgrounds";

export const PageHome = (props) => {

  const [loading,setLoading] = useState();
  const {homePost,setHomePost} = useApp();

  //load "home" page
  useEffect(() => {

    let isSubscribed;

    if (homePost === undefined){

      isSubscribed = true;
      setLoading(true);

      const fetchData = async () => {
  	    DEBUG && console.info("GETTING HOME PAGE...");
  	    const data = await DatabaseAPI.getSingleItem('pages',WP_POST_ID_HOME);
  			if (isSubscribed) {
  				DEBUG && console.info("...HOME PAGE LOADED",data);
          setLoading(false);
  	      setHomePost(data);
  	    }
  		}

  	  fetchData();
    }

		//clean up fn
		return () => isSubscribed = false;

  }, [homePost]);


  return (
    <div className="page-container">
      <Dimmer.Dimmable as="div" dimmed={loading}>
        <Dimmer active={loading} inverted>
          <Loader />
        </Dimmer>
        <div id="homePage" className="page">

          <div id="homeLogo">
            <img src={ImageLogo}/>
          </div>
          <div id="homeContent">
            <div id="homeText">
            {
              homePost?.content.rendered &&
              <div
                dangerouslySetInnerHTML={{__html: homePost.content.rendered}}
              />
            }
            </div>
            <PageMenu id="homeMenu"/>
          </div>
        </div>
        <BGHome/>
      </Dimmer.Dimmable>
    </div>
  )

}

export default PageHome
