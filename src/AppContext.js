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
    console.info("GETTING MAPS...");
    DatabaseAPI.getMaps()
    .then(resp => {
      console.info("...MAPS LOADED",resp);
      setMapPosts(resp);
    })
  }, []);

	//load creations on init
  useEffect(() => {
    console.info("GETTING CREATIONS...");
    DatabaseAPI.getCreations()
    .then(resp => {
      console.info("...CREATIONS LOADED",resp);
      setCreationPosts(resp);
    })
  }, []);

	//load tags on init
  useEffect(() => {
    console.info("GETTING TAGS...");
    DatabaseAPI.getTags()
    .then(resp => {
      console.info("...TAGS LOADED",resp);
      setTags(resp);
    })
  }, []);

	// NOTE: you *might* need to memoize this value
  // Learn more in http://kcd.im/optimize-context
  const value = {
    tags:tags,
    mapPosts:mapPosts,
		creationPosts:creationPosts,
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
