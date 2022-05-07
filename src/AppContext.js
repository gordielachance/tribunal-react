////https://gist.github.com/jimode/c1d2d4c1ab33ba1b7be8be8c50d64555

import React, { useState,useEffect,createContext,useRef } from 'react';
import DatabaseAPI from "./databaseAPI/api";

const AppContext = createContext();

export function AppProvider({children}){
	const [tags,setTags] = useState();
  const [mapPosts,setMapPosts] = useState();
	const [mapboxMap,setMapboxMap] = useState();
	const mapContainerRef = useRef();
	const [mapData,setMapData] = useState();
	const [selectedMarkerFeature,setSelectedMarkerFeature] = useState();
	const [popupMarkerFeature,setPopupMarkerFeature] = useState();
	const [popupDrawingFeatureId,setPopupDrawingFeatureId] = useState();

	const [activePolygonGroupIds,setActivePolygonGroupIds] = useState();

	const [activePolygonIds,setActivePolygonIds] = useState([]);
	const [activePolygonHandleId,setActivePolygonHandleId] = useState([]);

	const getPolygonByHandleFeature = (handleFeature) => {
		const polygonId = handleFeature.properties.target_id;
		return mapData.sources.drawingPolygons.data.features.find(feature => feature.properties.unique_id === polygonId);
	}

	const togglePolygonHandle = (feature,bool) => {
		const handleId = feature.properties.unique_id;

		let newIds = [...activePolygonHandleId];

		//hide old
		if (!bool){
			console.log("HIDE OLD HANDLE",handleId);
			mapboxMap.setFeatureState(
				{ source: 'polygonHandles', id: handleId },
				{ hover: false }
			);
			newIds = newIds.filter(x => ![handleId].includes(x));
		}else{
			console.log("SHOW NEW HANDLE",handleId);
			mapboxMap.setFeatureState(
				{ source: 'polygonHandles', id: handleId },
				{ hover: true }
			);
			newIds = activePolygonHandleId.concat([handleId]);
		}

		setActivePolygonHandleId(newIds);

	}

	const togglePolygon = (polygon,bool) => {

		const getPolygonGroupIds = feature => {

			if (feature === undefined) return;

			const polygonGroupId = feature.properties.group_id;
			const polygonId = feature.properties.unique_id;

			//if this handle points to a group of polygons
			if (polygonGroupId){
				const matches = mapData.sources.drawingPolygons.data.features.filter(feature => feature.properties.group_id === polygonGroupId);
				return matches.map(feature=>feature.properties.unique_id);
			}else if(polygonId){
				return [polygonId];
			}
		}

		const polygonId = polygon.properties.unique_id;

		const polygonIds = getPolygonGroupIds(polygon);
		//const bool = !activePolygonIds.includes(polygonId);
		let newIds = [...activePolygonIds];

		if (bool){//show
			newIds = polygonIds.concat(polygonIds);

			console.log("SHOW POLYGONS",polygonIds);

			(polygonIds || []).forEach(featureId => {
				mapboxMap.setFeatureState(
					{ source: 'drawingPolygons', id: featureId },
					{ hover: true }
				);
			})

		}else{//hide
			newIds = newIds.filter(x => !polygonIds.includes(x));

			console.log("HIDE POLYGONS",polygonIds);

			(polygonIds || []).forEach(featureId => {
				mapboxMap.setFeatureState(
					{ source: 'drawingPolygons', id: featureId },
					{ hover: false }
				);
			})

		}

		setActivePolygonIds(newIds);

	}


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
      setMapPosts(resp);
    })

  }, []);

	useEffect(()=>{
		if (mapData === undefined) return;
    console.log("SET MAP DATA",mapData);
	},[mapData])

	useEffect(()=>{
		if (mapboxMap === undefined) return;
		console.log("!!!SET MAP",mapboxMap);
	},[mapboxMap])

	useEffect(()=>{
    console.log("SET POPUP MARKER FEATURE",popupMarkerFeature);
	},[popupMarkerFeature])

	useEffect(()=>{
    console.log("SET POPUP DRAWING FEATURE",popupDrawingFeatureId);
	},[popupDrawingFeatureId])


	// NOTE: you *might* need to memoize this value
  // Learn more in http://kcd.im/optimize-context
  const value = {
		mapContainerRef:mapContainerRef,
    tags:tags,
    mapPosts:mapPosts,
		mapData:mapData,
		setMapData:setMapData,
		mapboxMap:mapboxMap,
		setMapboxMap:setMapboxMap,
		selectedMarkerFeature:selectedMarkerFeature,//TOUFIX TOUCHECK USEFUL ?
		setSelectedMarkerFeature:setSelectedMarkerFeature,//TOUFIX TOUCHECK USEFUL ?
		popupMarkerFeature:popupMarkerFeature,
		setPopupMarkerFeature:setPopupMarkerFeature,
		popupDrawingFeatureId:popupDrawingFeatureId,
		setPopupDrawingFeatureId:setPopupDrawingFeatureId,
		togglePolygon:togglePolygon,
		togglePolygonHandle:togglePolygonHandle,
		getPolygonByHandleFeature:getPolygonByHandleFeature
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
