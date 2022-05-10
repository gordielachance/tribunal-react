////https://gist.github.com/jimode/c1d2d4c1ab33ba1b7be8be8c50d64555

import React, { useState,useEffect,createContext,useRef } from 'react';
import {
	DEBUG,
	getDistanceFromOriginToClosestFeature,
	getDistanceFromFeatureToClosest,
	getClosestFeature
} from "./Constants";
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
			{ active: bool }
		);
	}

	const toggleCreation = (feature,bool) => {
		const featureId = feature.properties.id;

		mapboxMap.setFeatureState(
			{ source: 'creations', id: featureId },
			{ active: bool }
		);
	}

	const togglePolygon = (polygon,bool) => {

		const polygonId = polygon.properties.id;

		mapboxMap.setFeatureState(
			{ source: 'annotations', id: polygonId },
			{ active: bool }
		);

	}




	/*
	create a circle that extends to the closest marker,
	and zoom on it.
	*/
	const fitToFeature = (source_id,feature_id) => {

		console.log("FIT TO FEATURE SOURCE",source_id);

		const source = mapData?.sources[source_id];
	  const sourceCollection = source?.data.features;
    const sourceFeature = (sourceCollection || []).find(feature => feature.properties.id === feature_id);

		//get the center no matter the feature type
		const centroid = turf.centroid(sourceFeature);

		const getZoomForTargetSize = (meters,lat,targetPixels) => {

			if (meters === undefined){
				throw "Missing 'meters' parameter.";
			}

			if (lat === undefined){
				throw "Missing 'latitude' parameter.";
			}

			if (targetPixels === undefined){
				throw "Missing 'targetPixels' parameter.";
			}

			let currentZoom = 0;
			const zoomSteps = .5;
			const maxZoom = 22;
			let matchZoom = undefined;

			console.log("GET IDEAL ZOOM FOR METERS/PIXELS/LAT",Math.round(meters),targetPixels,lat);

			const getSizeForZoom = (meters,latitude,zoomLevel) => {

				const metersPerPixel = function(latitude, zoomLevel) {
					const EARTH_RADIUS = 6378137;
					const TILESIZE = 512;
					const EARTH_CIRCUMFERENCE = 2 * Math.PI * EARTH_RADIUS;
					const scale = Math.pow(2,zoomLevel);
					const worldSize = TILESIZE * scale;
					var latitudeRadians = latitude * (Math.PI/180);
					return EARTH_CIRCUMFERENCE * Math.cos(latitudeRadians) / worldSize;
				};

				return meters / metersPerPixel(latitude, zoomLevel);
			}


			while (currentZoom <= maxZoom) {

				const size = getSizeForZoom(meters,lat,currentZoom);

				//console.log("SIZE AT ZOOM",currentZoom,size);

				if (size > targetPixels){
					matchZoom = currentZoom;
					break;
				}

				currentZoom +=zoomSteps;
			}

			return matchZoom;
		}

		let inputMeters = undefined;//distance (in meters) that will be used to compute the target zoom
		let outputPixels = undefined;//what should be the pixel size of the converted distance

		switch(source_id){
			case 'creations':
				const nearestFeature = getClosestFeature(sourceFeature,sourceCollection);
				inputMeters = getDistanceFromFeatureToClosest(feature_id,sourceCollection);
				outputPixels = 25;
			break;
			case 'annotations':
				const bbox = turf.bbox(sourceFeature);
				const pointA = [bbox[0],bbox[1]];
				const pointB = [bbox[2],bbox[3]];
				inputMeters = turf.distance(pointA,pointB) * 1000;
				outputPixels = 50;
			break;
		}

		const cameraSettings = {
			center: centroid.geometry.coordinates,
			duration:1000
		}

		/*TOUFIX URGENT
		if (inputMeters){
			const idealZoom = getZoomForTargetSize(inputMeters,centroid.geometry.coordinates[0],outputPixels);
			if ( idealZoom > mapboxMap.getZoom() ){
				cameraSettings.zoom = idealZoom;
			}
		}
		*/

		mapboxMap.easeTo(cameraSettings);

	}

	const toggleFeatureId = (source_id,feature_id,bool) => {

		const sourceCollection = mapData?.sources[source_id].data.features;
    const sourceFeature = (sourceCollection || []).find(feature => feature.properties.id === feature_id);

		if (bool){
			console.log("TOGGLE FEATURE",bool,source_id,feature_id,sourceFeature);
		}

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

		//hide old
		if (prevActiveFeatureId.current){
			toggleFeatureId(prevActiveFeatureId.current.source,prevActiveFeatureId.current.id,false);
		}

		if (activeFeatureId === undefined) return;
		if (JSON.stringify(activeFeatureId) === JSON.stringify(prevActiveFeatureId.current) ) return; //reclick


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
