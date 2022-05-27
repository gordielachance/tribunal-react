////https://gist.github.com/jimode/c1d2d4c1ab33ba1b7be8be8c50d64555

import React, { useState,useEffect,useCallback,createContext,useRef } from 'react';
import {
	DEBUG,
	isFeaturesSource,
	sortFeaturesByDistance,
	bboxToCircle,
	getFeaturesTags
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

	const [sortMarkerBy,setSortMarkerBy] = useState('distance');
  const [markerTagsDisabled,setMarkerTagsDisabled] = useState([]);
  const [tagsFilter,setTagsFilter] = useState();
  const [markerFormatsDisabled,setMarkerFormatsDisabled] = useState([]);
  const [formatsFilter,setFormatsFilter] = useState();
  const [markersFilter,setMarkersFilter] = useState();

	const getHandlesByAnnotationPolygonId = feature_id => {
		const sourceCollection = mapData?.sources.annotationsHandles.data.features || [];
		const realId = parseInt(feature_id.replace("annotationsPolygons-", ""));

    const handleFeatures = sourceCollection.filter(feature => feature.properties.target_id === realId);
		return handleFeatures;
	}

	const getAnnotationPolygonByHandle = handleFeature => {
		if (!handleFeature){
			throw "Missing 'handleFeature' parameter.";
		}
		const sourceCollection = mapData?.sources.annotationsPolygons?.data.features;

		const polygonId = 'annotationsPolygons-' + handleFeature.properties.target_id;
		return sourceCollection.find(feature => feature.properties.id === polygonId);
	}

	const getFeatureById = id => {

		if (!id){
			throw "Missing 'id' parameter.";
		}

		const sources = mapData?.sources || {};
		const featureSourceKeys = Object.keys(sources).filter(sourceKey => isFeaturesSource(sources[sourceKey]) );

		let allFeatures = [];

		featureSourceKeys.forEach(sourceKey => {
			const source = sources[sourceKey];
			const sourceFeatures = source.data.features || [];
			allFeatures = allFeatures.concat(sourceFeatures);
		})

		return allFeatures.find(feature => feature.properties.id === id);

	}

	//find the ID of the source for a feature
	const getFeatureSourceKey = feature => {

		if (!feature){
			throw "Missing 'feature' parameter .";
		}

		const sources = mapData?.sources || {};
		const featureSourceKeys = Object.keys(sources).filter(sourceKey => isFeaturesSource(sources[sourceKey]) );

		return featureSourceKeys.find(sourceKey => {
			const source = sources[sourceKey];
			const sourceFeatures = source.data.features || [];
			return sourceFeatures.find(sourceFeature => sourceFeature.properties.id === feature.properties.id);
		})
	}

	const setMapFeatureState = (feature,key,value) => {

		if (!feature) return;

		const sourceKey = getFeatureSourceKey(feature);
		const featureId = feature.properties.id;

		if (sourceKey === undefined) return;
		if (featureId === undefined) return;

		mapboxMap.setFeatureState(
			{ source: sourceKey, id: featureId },
			{ [key]: value }
		);

		switch(sourceKey){
			case 'annotationsPolygons':

				const polygonSideEffects = (feature,key,value) => {
					const polygonId = feature.properties.id;
					const handles = getHandlesByAnnotationPolygonId(polygonId);

					//for hovered annotations, toggle handles too.
					if(key === 'hover'){
						handles.forEach(handle => {
							mapboxMap.setFeatureState(
								{ source: 'annotationsHandles', id: handle.properties.id },
								{ 'side-hover': value }
							);
						})
					}

					if (key === 'active'){
						const firstHandle = handles[0];

						console.log("FIRST HANDLE YO",firstHandle);

						mapboxMap.setFeatureState(
							{ source: 'annotationsHandles', id: firstHandle.properties.id },
							{ [key]: value }
						);
					}

				}

				polygonSideEffects(feature,key,value);

			break;
			case 'annotationsHandles':

				const handleSideEffects = (feature,key,value) => {
					const polygon = getAnnotationPolygonByHandle(feature);

					mapboxMap.setFeatureState(
						{ source: 'annotationsPolygons', id: polygon.properties.id },
						{ [key]: value }
					);
				}

				handleSideEffects(feature,key,value);

			break;
		}


	}

	const filterFeaturesByTag = (features,slug) => {
		return (features || []).filter(feature=>{
			const tags = feature.properties.tag_slugs || [];
			return tags.includes(slug);
		})
	}

	//hover features  matching this tag
  const toggleHoverTag = (slug,bool) => {

		const creationFeatures = mapData?.sources.creations?.data.features || [];
	  const annotationFeatures = mapData?.sources.annotationsPolygons?.data.features || [];
	  const allFeatures = creationFeatures.concat(annotationFeatures);

    const matches = filterFeaturesByTag(allFeatures,slug);

    matches.forEach(feature=>{
      setMapFeatureState(feature,'hover',bool);
    })

  }


	const filterFeaturesByFormat = (features,slug) => {
		return (features || []).filter(feature=>{
			const format = feature.properties?.format;
			return format === slug;
		})
	}

	//hover features matching this format
	const toggleHoverFormat = (slug,bool) => {

		const creationFeatures = mapData?.sources.creations?.data.features || [];
	  const annotationFeatures = mapData?.sources.annotationsPolygons?.data.features || [];
	  const allFeatures = creationFeatures.concat(annotationFeatures);

    const matches = filterFeaturesByFormat(allFeatures,slug);

    matches.forEach(feature=>{
      setMapFeatureState(feature,'hover',bool);
    })

  }

	const zoomOnFeatures = features => {

		//get the area to zoom to; given a set (or a single) feature.
		const getZoomCircle = features => {

			let selectionBbox = undefined;
			let selectionPolygon = undefined;

			//force array
			if ( !Array.isArray(features) ){
				features = [features];
			}

			//multiple features
			if ( features.length > 1 ){
				console.log("MARK MULTIPLE-FEATURE SELECTION",features);
				const collection = {
			    "type": "FeatureCollection",
			    "features":features
				};
				selectionBbox = turf.bbox(collection);
				selectionPolygon = turf.bboxPolygon(selectionBbox);
				selectionPolygon = bboxToCircle(selectionBbox);
			}else{
				const feature = features[0];
				const type = feature.geometry?.type;

				switch(type){
					case 'Point':

						//TOUFIX URGENT ONLY VISIBLE FEATURES
						const creationFeatures = mapData?.sources.creations?.data.features || [];
					  const handlesFeatures = mapData?.sources.annotationsHandles?.data.features || [];
					  const allPoints = creationFeatures.concat(handlesFeatures);

						//get this feature within the new array

						const sortedByDistance = sortFeaturesByDistance(feature.geometry,allPoints)
						.filter(obj=>obj.distance!==0) //remove current point
						.map(obj=>obj.feature)

						//get closest feature
						const closestFeature = sortedByDistance[0];

						//get radius (distance between the closest features)
						var radius = turf.distance(feature.geometry,closestFeature.geometry);

						const collection = {
					    "type": "FeatureCollection",
					    "features":[feature,closestFeature]
						};
						selectionBbox = turf.bbox(collection);
						selectionPolygon = turf.circle(feature.geometry, radius);

					break;
					case 'Polygon':

						selectionBbox = turf.bbox(feature);
						selectionPolygon = bboxToCircle(selectionBbox);

					break;
				}

			}

			return selectionPolygon;

		}

		const zoomCircle = getZoomCircle(features);

		const showSelectionPolygon = selectionPolygon => {
			try {
				mapboxMap.removeLayer("selectionBox");
				mapboxMap.removeSource("selectionFeatures");
			}
			catch(err) {
				//alert("Error!");
			}

			mapboxMap.addSource('selectionFeatures',{
				'type': 'geojson',
				'data': selectionPolygon
			})

			mapboxMap.addLayer({
				'id': 'selectionBox',
				'type': 'fill',
				'source': 'selectionFeatures', // reference the data source
				'layout': {},
				'paint': {
					'fill-color': '#FF0000', // blue color fill
					'fill-opacity': 0.1
				}
			});
		}

		if (DEBUG){
			showSelectionPolygon(zoomCircle);
		}

		//https://docs.mapbox.com/mapbox-gl-js/api/map/#map#fitbounds
		mapboxMap.fitBounds(
			turf.bbox(zoomCircle),
			{
				padding:50,
				maxZoom:16
			}
		);

	}

	//returns features after they have been filtered by disabled tags / formats.
	const getFilteredFeatures = useCallback((features) => {
	  const filterFeaturesByDisabledTags = (features,disabledTags) => {

	    if (disabledTags.length !== 0){

	      const allTags = getFeaturesTags(features);
	      const enabledTags = allTags.filter(x => !disabledTags.includes(x));

	      features = features.filter(feature =>{
	        const featureTags = feature.properties.tag_slugs;
	        const hasDisabledTags = featureTags.filter(x => disabledTags.includes(x));
	        return (hasDisabledTags.length === 0)
	      })
	    }

	    return features;

	  }
	  const filterFeaturesByDisabledFormats = (features,disabledFormats) => {
	    if (disabledFormats.length !== 0){
	      features = features.filter(feature =>{
	        const featureFormat = feature.properties.format;
	        return !disabledFormats.includes(featureFormat);
	      })
	    }

	    return features;

	  }

	  //filters
	  features = filterFeaturesByDisabledTags(features,markerTagsDisabled);
	  features = filterFeaturesByDisabledFormats(features,markerFormatsDisabled);
	  return features;

	}, [markerTagsDisabled,markerFormatsDisabled]);

	//clean map data input
	useEffect(()=>{
		if (rawMapData === undefined) return;

		let newMapData = {...rawMapData};

		const sources = newMapData.sources || {};
		const featureSourceKeys = Object.keys(sources).filter(sourceKey => isFeaturesSource(sources[sourceKey]) );

    //clean sources
		featureSourceKeys.forEach(sourceKey => {

			//remove features that do not have geometry
			const filterFeaturesWithGeometry = features => {
				features = (features || []);
				const noGeometryFeatures = features.filter(feature => !feature?.geometry);
				if (noGeometryFeatures.length){
					console.log("removing "+noGeometryFeatures.length+"/"+features.length+" source features that have no geometry",sourceKey,noGeometryFeatures);
					features = features.filter(x => !noGeometryFeatures.includes(x));
				}
				return features;
			}

			newMapData.sources[sourceKey].data.features = filterFeaturesWithGeometry(newMapData.sources[sourceKey].data.features);

			//remove features that have no IDs
			const filterFeaturesWithIDs = features => {
				features = (features || []);
				const noIDfeatures = features.filter(feature => (feature?.id !== undefined));
				if (noIDfeatures.length){
					console.log("removing "+noIDfeatures.length+"/"+features.length+" source features that have no IDs",sourceKey,noIDfeatures);
					features = features.filter(x => !noIDfeatures.includes(x));
				}
				return features;
			}

			newMapData.sources[sourceKey].data.features = filterFeaturesWithIDs(newMapData.sources[sourceKey].data.features);


		})


    //add polygon handles automatically

    if (newMapData.sources['annotationsPolygons'] && newMapData.sources['annotationsHandles'] ){

			const createAnnotationHandles = polygonFeatures => {
				let collection = [];
	      (polygonFeatures || []).forEach((polygonFeature,index) => {
	        const handleFeature = turf.pointOnFeature(polygonFeature);
					handleFeature.properties.id = index + 1;
	        handleFeature.properties.target_id = polygonFeature.properties.id;
					handleFeature.properties.tag_slugs = polygonFeature.properties.tag_slugs;
					collection.push(handleFeature);
	      })
				return collection;
			}
			newMapData.sources['annotationsHandles'].data.features = createAnnotationHandles(newMapData.sources['annotationsPolygons'].data.features);
		}


		if (newMapData.sources['annotationsPolygons'] && newMapData.sources['annotationsHandles'] ){

			const allPolygons = newMapData.sources['annotationsPolygons'].data.features || [];
			const allHandles = newMapData.sources['annotationsHandles'].data.features || [];

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

			newMapData.sources['annotationsPolygons'].data.features = filterPolygonsWithHandles(allPolygons,allHandles);

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

		//set really unique IDs for each feature

		featureSourceKeys.forEach(sourceKey => {

			const setSourcePrefixes = features => {
				features = (features || []);
				const newFeatures = [...features];
				newFeatures.forEach(feature =>{
					feature.properties.id = sourceKey + "-" + feature.properties.id;
				})
				return newFeatures;
			}

			newMapData.sources[sourceKey].data.features = setSourcePrefixes(newMapData.sources[sourceKey].data.features);


		})



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
	    console.log("RUN GLOBAL FILTER",markersFilter,mapboxMap);
	    mapboxMap.setFilter("creations",markersFilter);
	    mapboxMap.setFilter("annotationsHandles",markersFilter);
			mapboxMap.setFilter("annotationsFill",markersFilter);
			mapboxMap.setFilter("annotationsStroke",markersFilter);

	  },[markersFilter])

		//toggle annotation rasters (layers) based on filtered polygons.
	  useEffect(()=>{
	    if (mapboxMap === undefined) return;

			const allPolygons = mapData.sources['annotationsPolygons'].data.features || [];
			const visiblePolygons = getFilteredFeatures(allPolygons);

			allPolygons.forEach(feature => {

				const layerId = feature.properties.image_layer;

				if (!mapboxMap.getLayer(layerId)) {
				    return;//continue
				}

				const isVisible = visiblePolygons.includes(feature);
				const visibilityValue = isVisible ? 'visible' : 'none';

				mapboxMap.setLayoutProperty(layerId, 'visibility', visibilityValue);

		  });


	  },[markersFilter])

	useEffect(()=>{


		console.log("ACTIF FEAT ID",activeFeatureId);

		//hide old
		if (prevActiveFeatureId.current){
			const prevFeature = getFeatureById(prevActiveFeatureId.current);
			setMapFeatureState(prevFeature,'active',false);
		}

		//show new
		if (activeFeatureId !== undefined){
			const activeFeature = getFeatureById(activeFeatureId);
			console.log("ACTIF FEAT",activeFeature);
			setMapFeatureState(activeFeature,'active',true);
		}

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
		setMapFeatureState:setMapFeatureState,
		getHandlesByAnnotationPolygonId:getHandlesByAnnotationPolygonId,
		filterFeaturesByTag:filterFeaturesByTag,
		filterFeaturesByFormat:filterFeaturesByFormat,
		toggleHoverTag:toggleHoverTag,
		toggleHoverFormat:toggleHoverFormat,
		zoomOnFeatures:zoomOnFeatures,
		getFeatureSourceKey:getFeatureSourceKey,
		getFeatureById:getFeatureById,
		getFilteredFeatures:getFilteredFeatures
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
