////https://gist.github.com/jimode/c1d2d4c1ab33ba1b7be8be8c50d64555

import React, { useState,useEffect,createContext } from 'react';
import DatabaseAPI from "./databaseAPI/api";
import {DEBUG} from "./Constants";
import useWindowDimensions from './components/ScreenSize';

const AppContext = createContext();

export function AppProvider({children}){
	const [tags,setTags] = useState();
  const [mapPosts,setMapPosts] = useState();
	const [creationPosts,setCreationPosts] = useState();
	const [agendaPosts,setAgendaPosts] = useState();
	const screenSize = useWindowDimensions();
  const [verticalScreen,setVerticalScreen] = useState();
  const [mobileScreen,setMobileScreen] = useState();

	//check is vertical
  useEffect(()=>{
    const isVertical = screenSize.height > screenSize.width;
    const isMobile = screenSize.width <= 576;
    setVerticalScreen(isVertical);
    setMobileScreen(isMobile);
  },[screenSize]);

	//load maps on init
  useEffect(() => {

		let isSubscribed = true;

		const fetchData = async () => {
	    DEBUG && console.info("GETTING MAPS...");
	    const data = await DatabaseAPI.getMaps();
			if (isSubscribed) {
				DEBUG && console.info("...MAPS LOADED",data);
	      setMapPosts(data);
	    }
		}

	  fetchData();

		//clean up fn
		return () => isSubscribed = false;

  }, []);

	//load creations on init
	useEffect(() => {

		let isSubscribed = true;

		const fetchData = async () => {
	    DEBUG && console.info("GETTING CREATIONS...");
	    const data = await DatabaseAPI.getCreations();
			if (isSubscribed) {
				DEBUG && console.info("...CREATIONS LOADED",data);
	      setCreationPosts(data);
	    }
		}

	  fetchData();

		//clean up fn
		return () => isSubscribed = false;

  }, []);

	//load events on init
	useEffect(() => {

		let isSubscribed = true;

		const fetchData = async () => {
	    DEBUG && console.info("GETTING EVENTS...");
	    const data = await DatabaseAPI.getCreations();
			if (isSubscribed) {
				DEBUG && console.info("...EVENTS LOADED",data);
	      setAgendaPosts(data);
	    }
		}

	  fetchData();

		//clean up fn
		return () => isSubscribed = false;

  }, []);

	//load events on init
	useEffect(() => {

		let isSubscribed = true;

		const fetchData = async () => {
	    DEBUG && console.info("GETTING TAGS...");
	    const data = await DatabaseAPI.getTags();
			if (isSubscribed) {
				DEBUG && console.info("...TAGS LOADED",data);
	      setTags(data);
	    }
		}

	  fetchData();

		//clean up fn
		return () => isSubscribed = false;

  }, []);


	// NOTE: you *might* need to memoize this value
  // Learn more in http://kcd.im/optimize-context
  const value = {
    tags:tags,
    mapPosts:mapPosts,
		creationPosts:creationPosts,
		agendaPosts:agendaPosts,
		mobileScreen:mobileScreen,
		verticalScreen:verticalScreen
	};

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export function useApp() {
  const context = React.useContext(AppContext);
  if (context === undefined) {
    throw new Error('useMap must be used within a AppProvider')
  }
  return context
}
