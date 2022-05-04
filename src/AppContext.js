////https://gist.github.com/jimode/c1d2d4c1ab33ba1b7be8be8c50d64555

import React, { useState,useEffect,createContext,useRef } from 'react';
import DatabaseAPI from "./databaseAPI/api";

const AppContext = createContext();

export function AppProvider({children}){
	const [tags,setTags] = useState();
  const [maps,setMaps] = useState();
	const mapContainerRef = useRef();

	//load tags on init
  useEffect(() => {

    //LOAD TAGS
    console.info("GETTING TAGS...");
    DatabaseAPI.getTags()
    .then(resp => {
      console.info("...TAGS LOADED",resp);
      setTags(resp);
    })

    //LOAD MAPS
    console.info("GETTING MAPS...");
    DatabaseAPI.getMaps()
    .then(resp => {
      console.info("...MAPS LOADED",resp);
      setMaps(resp);
    })

  }, []);

	// NOTE: you *might* need to memoize this value
  // Learn more in http://kcd.im/optimize-context
  const value = {
    tags:tags,
    maps:maps,
		mapContainerRef:mapContainerRef
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
    throw new Error('useApp must be used within a AppProvider')
  }
  return context
}
