////https://gist.github.com/jimode/c1d2d4c1ab33ba1b7be8be8c50d64555

import React, { useState,useEffect,createContext,useRef } from 'react';
import {DEBUG,getDistanceFromOriginToClosestFeature} from "./Constants";
import * as turf from "@turf/turf";

const MapContext = createContext();

export function MapProvider({children}){
	const [mapboxMap,setMapboxMap] = useState();
	const mapContainerRef = useRef();
	const [mapData,setMapData] = useState();

	const [activeFeatureId,setActiveFeatureId] = useState();
	const [showPopup,setShowPopup] = useState();
	const prevActiveFeatureId = useRef();

	const [sortMarkerBy,setSortMarkerBy] = useState('date');
  const [markerTagsDisabled,setMarkerTagsDisabled] = useState([]);
  const [tagsFilter,setTagsFilter] = useState();
  const [markerFormatsDisabled,setMarkerFormatsDisabled] = useState([]);
  const [formatsFilter,setFormatsFilter] = useState();
  const [markersFilter,setMarkersFilter] = useState();

	//get the first handle for this annotation feature
	const getHandleIdByAnnotationId = feature_id => {

		const sourceCollection = mapData?.sources.annotationsHandles.data.features;
    const sourceFeature = (sourceCollection || []).find(feature => feature.properties.target_id === feature_id);
		return sourceFeature?.properties.id;
	}

	const getAnnotationPolygonByHandle = (handleFeature) => {
		const polygonId = handleFeature.properties.target_id;
		return mapData?.sources.annotations.data.features.find(feature => feature.properties.id === polygonId);
	}

	const togglePolygonHandle = (feature,bool) => {
		const handleId = feature.properties.id;

		mapboxMap.setFeatureState(
			{ source: 'annotationsHandles', id: handleId },
			{ hover: bool }
		);
	}

	const toggleCreation = (feature,bool) => {
		const featureId = feature.properties.id;

		mapboxMap.setFeatureState(
			{ source: 'creations', id: featureId },
			{ selected: bool }
		);
	}

	const togglePolygon = (polygon,bool) => {

		const polygonId = polygon.properties.id;

		mapboxMap.setFeatureState(
			{ source: 'annotations', id: polygonId },
			{ hover: bool }
		);

	}

	/*
	create a circle that extends to the closest marker,
	and zoom on it.
	*/
	const fitToFeature = (source_id,feature_id) => {

		const source = mapData?.sources[source_id];
	  const sourceCollection = source?.data.features;
    const sourceFeature = (sourceCollection || []).find(feature => feature.properties.id === feature_id);

		//get the center no matter the feature type
		const centroid = turf.centroid(sourceFeature);

		mapboxMap.flyTo({
			center: centroid.geometry.coordinates
		});

		return;

		//URGENT


	  //get minimum zoom to see clearly this marker

	  /*
	  //distance from feature to the nearest point
	  const distanceToNearest = getDistanceFromFeatureToClosest(feature_id,collection);
	  console.log("NEAREST MARKER DIST",distanceToNearest);
	  return;
	  */




	  const radius = getDistanceFromOriginToClosestFeature(origin,sourceCollection);
	  const circle = turf.circle(origin,radius);

	  //compute a bouding box for this circle
	  const bbox = turf.bbox(circle);

	  mapboxMap.fitBounds(bbox, {
	    maxZoom:14,
	    padding:100//px
	  });

	}

	const toggleFeatureId = (source_id,feature_id,bool) => {

		const sourceCollection = mapData?.sources[source_id].data.features;
    const sourceFeature = (sourceCollection || []).find(feature => feature.properties.id === feature_id);

		console.log("TOGGLE FEATURE",bool,source_id,feature_id);

		switch(source_id){
			case 'annotationsHandles':
				const polygonFeature = getAnnotationPolygonByHandle(sourceFeature);
				togglePolygon(polygonFeature,bool);
				togglePolygonHandle(sourceFeature,bool);
			break;
			case 'creations':
				toggleCreation(sourceFeature,bool);
			break;
		}

  }

	//set global marker filters
  useEffect(()=>{

    const filters = [
      tagsFilter,
      formatsFilter
    ]

    const buildFilter = filters => {

      filters = filters.filter(function(filter) {
        return filter !== undefined;
      });

      //no filters
      if ( (filters || []).length === 0) return;
      return ['all'].concat(filters);
    }

    const filter = buildFilter(filters);
    setMarkersFilter(filter);

  },[tagsFilter,formatsFilter])


		//build features tags filter
	  useEffect(()=>{
	    const buildFilter = tags => {

	      //no tags set
	      if ( (tags || []).length === 0) return;

	      //expression for each tag
	      const tagFilters = tags.map(tag=>['in',tag,['get', 'tag_slugs']]) //URGENT TOU FIX

	      return ['any'].concat(tagFilters);

	    }

	    let filter = buildFilter(markerTagsDisabled);

	    if (filter){//exclude all
	      filter = ['!',filter];
	    }

	    setTagsFilter(filter);
	  },[markerTagsDisabled])

	  //build features formats filter
	  useEffect(()=>{
	    const buildFilter = formats => {

	      //no formats set
	      if ( (formats || []).length === 0) return;

	      return ['in', ['get', 'format'], ['literal', formats]];

	    }

	    let filter = buildFilter(markerFormatsDisabled);

	    if (filter){//exclude all
	      filter = ['!',filter];
	    }

	    setFormatsFilter(filter);
	  },[markerFormatsDisabled])

	  //set global marker filters
	  useEffect(()=>{
	    if (mapboxMap === undefined) return;
	    console.log("RUN GLOBAL FILTER",markersFilter);
	    mapboxMap.setFilter("creations",markersFilter);
	    mapboxMap.setFilter("annotationsHandles",markersFilter);
			mapboxMap.setFilter("annotationsFill",markersFilter);
			mapboxMap.setFilter("annotationsStroke",markersFilter);
	  },[markersFilter])

	useEffect(()=>{
		if (activeFeatureId === undefined) return;
		if (JSON.stringify(activeFeatureId) === JSON.stringify(prevActiveFeatureId.current) ) return; //reclick

		//hide old
		if (prevActiveFeatureId.current){
			toggleFeatureId(prevActiveFeatureId.current.source,prevActiveFeatureId.current.id,false);
		}

		//show new
		toggleFeatureId(activeFeatureId.source,activeFeatureId.id,true);
		prevActiveFeatureId.current = activeFeatureId;

	},[activeFeatureId])

	// NOTE: you *might* need to memoize this value
  // Learn more in http://kcd.im/optimize-context
  const value = {
		mapContainerRef:mapContainerRef,
		mapData:mapData,
		setMapData:setMapData,
		mapboxMap:mapboxMap,
		setMapboxMap:setMapboxMap,
		fitToFeature:fitToFeature,
		getHandleIdByAnnotationId:getHandleIdByAnnotationId,
		getAnnotationPolygonByHandle:getAnnotationPolygonByHandle,
		activeFeatureId:activeFeatureId,
		setActiveFeatureId:setActiveFeatureId,
		showPopup:showPopup,
		setShowPopup:setShowPopup,
		sortMarkerBy:sortMarkerBy,
		setSortMarkerBy:setSortMarkerBy,
		markerTagsDisabled:markerTagsDisabled,
		setMarkerTagsDisabled:setMarkerTagsDisabled,
		markerFormatsDisabled:markerFormatsDisabled,
		setMarkerFormatsDisabled:setMarkerFormatsDisabled,
		togglePolygon:togglePolygon
	};

  return (
    <MapContext.Provider value={value}>
      {children}
    </MapContext.Provider>
  );
};

export function useMap() {
  const context = React.useContext(MapContext);
  if (context === undefined) {
    throw new Error('useMap must be used within a MapProvider')
  }
  return context
}
