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
	const [rawMapData,setRawMapData] = useState(); //map data before it is cleaned
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

	const getHandlesByAnnotationId = feature_id => {
		const sourceCollection = mapData?.sources.annotationsHandles.data.features || [];
    const handleFeatures = sourceCollection.filter(feature => feature.properties.target_id === feature_id);
		return handleFeatures;
	}

	const getAnnotationPolygonByHandle = handleFeature => {
		if (!handleFeature){
			throw "Missing parameter 'handleFeature'."
		}
		const sourceCollection = mapData?.sources.annotations?.data.features;
		const polygonId = handleFeature.properties.target_id;
		return sourceCollection.find(feature => feature.properties.id === polygonId);
	}

	const setPolygonHandleFeatureState = (feature,key,value) => {
		const handleId = feature.properties.id;

		mapboxMap.setFeatureState(
			{ source: 'annotationsHandles', id: handleId },
			{ [key]: value }
		);
	}

	const setPolygonFeatureState = (polygon,key,value) => {

		const polygonId = polygon.properties.id;

		mapboxMap.setFeatureState(
			{ source: 'annotations', id: polygonId },
			{ [key]: value }
		);

		if(key==='hover'){
			const handles = getHandlesByAnnotationId(polygonId);
			handles.forEach(feature => {
				setPolygonHandleFeatureState(feature,'side-hover',value);
			})
		}


	}

	const setCreationFeatureState = (feature,key,value) => {
		const featureId = feature.properties.id;

		mapboxMap.setFeatureState(
			{ source: 'creations', id: featureId },
			{ [key]: value }
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

		if (feature_id === undefined){
			throw "Missing 'feature_id' parameter.";
		}

		const sourceCollection = mapData?.sources[source_id].data.features;
    const sourceFeature = (sourceCollection || []).find(feature => feature.properties.id === feature_id);

		if (bool){
			console.log("TOGGLE FEATURE",bool,source_id,feature_id,sourceFeature);
		}

		switch(source_id){
			case 'annotationsHandles':
				const polygonFeature = getAnnotationPolygonByHandle(sourceFeature);
				setPolygonFeatureState(polygonFeature,'active',bool);
				setPolygonHandleFeatureState(sourceFeature,'active',bool);
			break;
			case 'creations':
				setCreationFeatureState(sourceFeature,'active',bool);
			break;
		}

  }

	//clean map data input
	useEffect(()=>{
		if (rawMapData === undefined) return;

		let newMapData = {...rawMapData};

    //clean sources
    for (const [sourceKey, source] of Object.entries(newMapData.sources)) {
      if (source.type === 'geojson'){
        if (source.data.type === 'FeatureCollection'){

					const sourceFeatures = source.data.features;

					//remove features that have no IDs
					const filterFeaturesWithIDs = features => {
            const noIDfeatures = (features || []).filter(feature => (feature?.id !== undefined));
            if (noIDfeatures.length){
              console.log("removing "+noIDfeatures.length+"/"+sourceFeatures.length+" source features that have no IDs",sourceKey,noIDfeatures);
              features = features.filter(x => !noIDfeatures.includes(x));
            }
            return features;
          }

          newMapData.sources[sourceKey].data.features = filterFeaturesWithIDs(sourceFeatures);

          //remove features that do not have geometry
          const filterFeaturesWithGeometry = features => {
            const noGeometryFeatures = (features || []).filter(feature => !feature?.geometry);
            if (noGeometryFeatures.length){
              console.log("removing "+noGeometryFeatures.length+"/"+sourceFeatures.length+" source features that have no geometry",sourceKey,noGeometryFeatures);
              features = features.filter(x => !noGeometryFeatures.includes(x));
            }
            return features;
          }

          newMapData.sources[sourceKey].data.features = filterFeaturesWithGeometry(sourceFeatures);

        }
      }
    }

    //add polygon handles automatically
		/*
    if (newMapData.sources['annotations'] && newMapData.sources['annotationsHandles'] ){
			const createAnnotationHandles = polygonFeatures => {
				let collection = [];
	      (polygonFeatures || []).forEach((polygonFeature,index) => {
	        const handleFeature = turf.centroid(polygonFeature);
					handleFeature.properties.id = index + 1;
	        handleFeature.properties.target_id = polygonFeature.properties.id;
					collection.push(handleFeature);
	      })
				return collection;
			}
			newMapData.sources['annotationsHandles'].data.features = createAnnotationHandles(newMapData.sources['annotations'].data.features);
		}
		*/


		if (newMapData.sources['annotations'] && newMapData.sources['annotationsHandles'] ){

			const allPolygons = newMapData.sources['annotations'].data.features || [];
			const allHandles = newMapData.sources['annotationsHandles'].data.features || [];

			const allPolygonIds = allPolygons.map(feature => feature.properties.id);
			const allHandleTargets = allHandles.map(feature => feature.properties.target_id);
			const noHandlePolygonIds = allPolygonIds.filter(x => !allHandleTargets.includes(x));

			//remove polygons that does not have handles
			const filterPolygonsWithHandles = (polygons,handles) => {

				const polygonIds = polygons.map(feature => feature.properties.id);
				const handleIds = handles.map(feature => feature.properties.target_id);
				const noHandlePolygonIds = polygonIds.filter(x => !handleIds.includes(x));
				const noHandlePolygons = polygons.filter(feature => noHandlePolygonIds.includes(feature.properties.id));

				if (noHandlePolygons.length){
					console.log("removing "+noHandlePolygons.length+"/"+polygons.length+" annotation polygon features that have no handles",noHandlePolygons);
					polygons = polygons.filter(x => !noHandlePolygons.includes(x));
				}

				return polygons;
			}

			newMapData.sources['annotations'].data.features = filterPolygonsWithHandles(allPolygons,allHandles);

			//remove handles that does not have polygons
			const filterHandlesWithPolygons = (handles,polygons) => {

				const polygonIds = polygons.map(feature => feature.properties.id);
				const handleIds = handles.map(feature => feature.properties.target_id);
				const noPolygonHandleIds = handleIds.filter(x => !polygonIds.includes(x));
				const noPolygonHandles = handles.filter(feature => noPolygonHandleIds.includes(feature.properties.id));

				if (noPolygonHandles.length){
					console.log("removing "+noPolygonHandles.length+"/"+handles.length+" annotation handle features that have no polygon",noPolygonHandles);
					handles = handles.filter(x => !noPolygonHandles.includes(x));
				}

				return handles;
			}

			newMapData.sources['annotationsHandles'].data.features = filterHandlesWithPolygons(allHandles,allPolygons);


		}

		console.log("NEWMAPDATA",newMapData);

		setMapData(newMapData);

	},[rawMapData])


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

		console.log("ACTIF FEAT ",activeFeatureId);

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
		setRawMapData:setRawMapData,
		mapboxMap:mapboxMap,
		setMapboxMap:setMapboxMap,
		fitToFeature:fitToFeature,
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
		setPolygonFeatureState:setPolygonFeatureState,
		setCreationFeatureState:setCreationFeatureState,
		setPolygonHandleFeatureState:setPolygonHandleFeatureState,
		getHandlesByAnnotationId:getHandlesByAnnotationId
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
