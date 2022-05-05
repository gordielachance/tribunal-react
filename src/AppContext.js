////https://gist.github.com/jimode/c1d2d4c1ab33ba1b7be8be8c50d64555

import React, { useState,useEffect,createContext,useRef } from 'react';
import DatabaseAPI from "./databaseAPI/api";

const AppContext = createContext();

export function AppProvider({children}){
	const [tags,setTags] = useState();
  const [maps,setMaps] = useState();
	const [map,setMap] = useState();
	const mapContainerRef = useRef();
	const [mapData,setMapData] = useState();
	const [selectedMarkerFeature,setSelectedMarkerFeature] = useState();
	const [popupMarkerFeature,setPopupMarkerFeature] = useState();
	const [popupDrawingFeature,setPopupDrawingFeature] = useState();

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

	useEffect(()=>{
		if (mapData === undefined) return;
    console.log("SET MAP DATA",mapData);
	},[mapData])

	useEffect(()=>{
    console.log("SET POPUP MARKER FEATURE",popupMarkerFeature);
	},[popupMarkerFeature])

	useEffect(()=>{
    console.log("SET POPUP DRAWING FEATURE",popupDrawingFeature);
	},[popupDrawingFeature])

	// NOTE: you *might* need to memoize this value
  // Learn more in http://kcd.im/optimize-context
  const value = {
		mapContainerRef:mapContainerRef,
    tags:tags,
    maps:maps,
		mapData:mapData,
		setMapData:setMapData,
		map:map,
		setMap:setMap,
		selectedMarkerFeature:selectedMarkerFeature,//TOUFIX TOUCHECK USEFUL ?
		setSelectedMarkerFeature:setSelectedMarkerFeature,//TOUFIX TOUCHECK USEFUL ?
		popupMarkerFeature:popupMarkerFeature,
		setPopupMarkerFeature:setPopupMarkerFeature,
		popupDrawingFeature:popupDrawingFeature,
		setPopupDrawingFeature:setPopupDrawingFeature
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
