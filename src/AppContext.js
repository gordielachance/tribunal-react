////https://gist.github.com/jimode/c1d2d4c1ab33ba1b7be8be8c50d64555

import React, { useState,useEffect,createContext,useRef } from 'react';
import DatabaseAPI from "./databaseAPI/api";
import {DEBUG} from "./Constants";

const AppContext = createContext();

export function AppProvider({children}){
	const [tags,setTags] = useState();
  const [mapPosts,setMapPosts] = useState();

	//load home on init
  useEffect(() => {

  }, []);

	//load maps on init
  useEffect(() => {
    //LOAD MAPS
    console.info("GETTING MAPS...");
    DatabaseAPI.getMaps()
    .then(resp => {
      console.info("...MAPS LOADED",resp);
      setMapPosts(resp);
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
    mapPosts:mapPosts
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
