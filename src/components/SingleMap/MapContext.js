////https://gist.github.com/jimode/c1d2d4c1ab33ba1b7be8be8c50d64555

import React, { useState,useEffect,createContext,useRef } from 'react';
import {DEBUG,WP_FORMATS,maybeDecodeJson} from "../../Constants";
import {getUniqueMapFeatures} from "./MapFunctions";
import * as turf from "@turf/turf";

import {
	isFeaturesSource,
	sortFeaturesByDistance,
	bboxToCircle,
} from "./MapFunctions";

const MapContext = createContext();

export function MapProvider({children}){
	const [mapboxMap,setMapboxMap] = useState();
	const [mapHasInit,setMapHasInit] = useState(false);
	const mapContainerRef = useRef();
	const [rawMapData,setRawMapData] = useState(); //map data before it is cleaned
	const [mapData,setMapData] = useState();

	const [mapRenderedFeatures,setMapRenderedFeatures] = useState();

	const [annotationsLayerIds,setAnnotationsLayerIds] = useState();

	const [activeFeature,setActiveFeature] = useState();
	const prevActiveFeature = useRef();

	const [sortMarkerBy,setSortMarkerBy] = useState('distance');

	const [termsFilter,setTermsFilter] = useState();
	const [formatsFilter,setFormatsFilter] = useState();
	const [areaFilter,setAreaFilter] = useState();
  const [featuresFilter,setFeaturesFilter] = useState();
	const [isolationFilter,setIsolationFilter] = useState();

  const [disabledTermIds,setDisabledTermIds] = useState([]);
	const [disabledAreaIds,setDisabledAreaIds] = useState([]);
	const [layersDisabled,setLayersDisabled] = useState([]);
  const [disabledFormats,setDisabledFormats] = useState([]);

	const getHandlesByAnnotationPolygonId = feature_id => {
		const sourceCollection = mapData?.sources.annotations.data.features || [];
    const handleFeatures = sourceCollection.filter(feature => feature.properties.id === feature_id);
		return handleFeatures;
	}

	const getAnnotationPolygonByHandle = handleFeature => {
		if (!handleFeature){
			throw "Missing 'handleFeature' parameter.";
		}
		const sourceCollection = mapData?.sources.annotationPolygons?.data.features;
		const polygonId = handleFeature.properties.id;
		return sourceCollection.find(feature => feature.properties.id === polygonId);
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

		const sourceKey = feature.properties.source;
		const featureId = feature.properties.id;

		if (sourceKey === undefined) return;
		if (featureId === undefined) return;

		mapboxMap.setFeatureState(
			{ source: sourceKey, id: featureId },
			{ [key]: value }
		);
	}

	const filterFeaturesByTermId = (features,termId) => {

		const term = getMapTermById(termId);
		if (!term) return false;

		const propertyName = getFeaturePropertyNameForTaxonomy(term.taxonomy);
		if (!propertyName) return false;

		return (features || []).filter(feature=>{
			const slugs = feature.properties[propertyName] || [];
			return slugs.includes(term.slug);
		})
	}

	/*
	//hover features  matching this tag
	const toggleHoverTermId = (termId,bool) => {

    const matches = filterFeaturesByTermId(mapFeatureCollection(),termId);

    (matches || []).forEach(feature=>{
      setMapFeatureState(feature,'hover',bool);
    })

  }
	//hover features matching this format
	const toggleHoverFormat = (slug,bool) => {

    const matches = filterFeaturesByFormat(mapFeatureCollection(),slug);

    matches.forEach(feature=>{
      setMapFeatureState(feature,'hover',bool);
    })

  }
	*/

	const getFeaturePropertyNameForTaxonomy = taxonomy => {
		switch(taxonomy){
			case 'post_tag':
				return 'tags';
			break;
			case 'category':
				return 'categories';
			break;
		}
	}

	const getMapTermById = id => {
		return (mapData.terms || []).find(item => id === item.term_id);
	}

	const getMapAreaById = areaId => {
		const sourceCollection = mapData?.sources.areas?.data.features || [];
	  return sourceCollection.find(feature => feature.properties.id === areaId);
	}

	const selectAllTerms = taxonomy => {
		let targetTerms = (mapData.terms || []);

		//restrict to this taxonomy
		targetTerms = targetTerms.filter(item=>item.taxonomy === taxonomy);

		const targetIds = targetTerms.map(item=>item.term_id);

		const newDisabledIds = disabledTermIds.filter(id => !targetIds.includes(id));

		setDisabledTermIds(newDisabledIds);

	}

	const selectNoTerms = taxonomy => {
		let targetTerms = (mapData.terms || []);

		//restrict to this taxonomy
		targetTerms = targetTerms.filter(item=>item.taxonomy === taxonomy);

		const targetIds = targetTerms.map(item=>item.term_id);

		let newDisabledIds = disabledTermIds.concat(targetIds);
		newDisabledIds = [...new Set(newDisabledIds)];

		setDisabledTermIds(newDisabledIds);

	}

	const selectSoloTermId = termId => {

		const term = getMapTermById(termId);
		if (!term) return false;

		let otherTerms = (mapData.terms || []).filter(item=>item.term_id !== term.term_id);

		//restrict to this taxonomy
		otherTerms = otherTerms.filter(item=>item.taxonomy === term.taxonomy);

		const otherIds = otherTerms.map(item=>item.term_id);
		setDisabledTermIds(otherIds);
	}

	const toggleTermId = termId => {
    const newDisabled = [...disabledTermIds];
    const index = newDisabled.indexOf(termId);

    if (index > -1) {//exists in array
      newDisabled.splice(index, 1);
    }else{
      newDisabled.push(termId);
    }

    setDisabledTermIds(newDisabled);

  }

  const toggleIsolateTermId = (termId,bool) => {

		const buildFilter = termId => {

			const term = getMapTermById(termId);
			if (!term) return false;

			const propertyName = getFeaturePropertyNameForTaxonomy(term.taxonomy);
			if (!propertyName) return;

			return ['in',term.slug,['get', propertyName]];

		}

		if (bool){
			const filter = buildFilter(termId);
			setIsolationFilter(filter);
		}else{
			setIsolationFilter();
		}
  }

	const toggleIsolateFormat = (slug,bool) => {

		const buildFilter = slug => {
			return ['in', ['get', 'format'], ['literal', slug]];
	  }

		if (bool){
			const filter = buildFilter(slug);
			setIsolationFilter(filter);
		}else{
			setIsolationFilter();
		}

  }

	const selectAllFormats = () => {
		setDisabledFormats();
	}

	const selectNoFormats = () => {
		setDisabledFormats(WP_FORMATS);
	}

	const filterFeaturesByFormat = (features,slug) => {
		return (features || []).filter(feature=>{
			const format = feature.properties?.format;
			return format === slug;
		})
	}

	const toggleIsolateArea = (feature,bool) =>{
		const areaId = feature.properties.id;
		if(areaId===undefined) return;

		//hover area
		setMapFeatureState(feature,'hover',bool);

		//area isolation filter
		const buildFilter = feature => {
			return ['within', feature];
	  }

		if (bool){
			const filter = buildFilter(feature);
			setIsolationFilter(filter);
		}else{
			setIsolationFilter();
		}

	}

	const toggleMapLayer = (layerId,bool) => {

		let newDisabled = [...(layersDisabled || [])];
    const index = newDisabled.indexOf(layerId);

		//default bool
		if (bool === undefined){
			bool = (index !== -1);
		}

		DEBUG && console.log("TOGGLE MAP LAYER",layerId,bool);

		if (!bool) {
			newDisabled.push(layerId);
			if (layerId === 'annotations'){
				newDisabled = newDisabled.concat(annotationsLayerIds);//also exclude raster layers
				newDisabled = newDisabled.concat(['annotationsFill','annotationsStroke']);
			}

    }else{
      newDisabled.splice(index, 1);
			if (layerId === 'annotations'){
				newDisabled = newDisabled.filter(x => !annotationsLayerIds.includes(x));//also include raster layers
				newDisabled = newDisabled.filter(x => !['annotationsFill','annotationsStroke'].includes(x));
			}
    }

		setLayersDisabled(newDisabled);
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
					  const handlesFeatures = mapData?.sources.annotationPolygons?.data.features || [];
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

	//clean map data input
	useEffect(()=>{
		if (rawMapData === undefined) return;

		DEBUG && console.log("RAW MAP DATA",{...rawMapData})

		let newMapData = {...rawMapData};

		const getFeatureSourceKeys = () => {
			const sources = newMapData.sources || {};
			return Object.keys(sources).filter(sourceKey => isFeaturesSource(sources[sourceKey]) );
		}

    //clean sources
		getFeatureSourceKeys().forEach(sourceKey => {

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

    if (newMapData.sources.annotations ){
			//add polygon handles automatically
			const buildAnnotationHandlesSource = polygonFeatures => {

				const buildAnnotationHandlesFeatures = polygonFeatures => {
					let collection = [];
		      (polygonFeatures || []).forEach((polygonFeature,index) => {
		        const handleFeature = turf.pointOnFeature(polygonFeature);

						handleFeature.properties = {
							id:polygonFeature.properties.id
						}

						collection.push(handleFeature);
		      })
					return collection;
				}

				return {
		      data:{
		        type:'FeatureCollection',
		        features:buildAnnotationHandlesFeatures(newMapData.sources.annotationPolygons.data.features)
		      },
		      promoteId:'id',
		      type:'geojson'
		    }
			}
			newMapData.sources.annotations = buildAnnotationHandlesSource(newMapData.sources.annotationPolygons.data.features);
		}

		/*
		if (newMapDatasources.annotations ){

			const allPolygons = newMapData.sources.annotationPolygons.data.features || [];
			const allHandles = newMapDatasources.annotationPolygons.data.features || [];

			//remove polygons that does not have handles

			const filterPolygonsWithHandles = (polygons,handles) => {

				const polygonIds = polygons.map(feature => feature.properties.id);
				const handleIds = handles.map(feature => feature.properties.id);
				const noHandlePolygonIds = polygonIds.filter(x => !handleIds.includes(x));
				const noHandlePolygons = polygons.filter(feature => noHandlePolygonIds.includes(feature.properties.id));

				if (noHandlePolygons.length){
					console.log("removing "+noHandlePolygons.length+"/"+polygons.length+" annotation polygon features that have no handles",noHandlePolygons);
					polygons = polygons.filter(x => !noHandlePolygons.includes(x));
				}

				return polygons;
			}

			newMapData.sources.annotationPolygons.data.features = filterPolygonsWithHandles(allPolygons,allHandles);

			//remove handles that does not have polygons
			const filterHandlesWithPolygons = (handles,polygons) => {

				const polygonIds = polygons.map(feature => feature.properties.id);
				const handleIds = handles.map(feature => feature.properties.id);
				const noPolygonHandleIds = handleIds.filter(x => !polygonIds.includes(x));
				const noPolygonHandles = handles.filter(feature => noPolygonHandleIds.includes(feature.properties.id));

				if (noPolygonHandles.length){
					console.log("removing "+noPolygonHandles.length+"/"+handles.length+" annotation handle features that have no polygon",noPolygonHandles);
					handles = handles.filter(x => !noPolygonHandles.includes(x));
				}

				return handles;
			}

			newMapDatasources.annotationPolygons.data.features = filterHandlesWithPolygons(allHandles,allPolygons);


		}
		*/

		//append source Ids

		getFeatureSourceKeys().forEach(sourceKey => {

			const setSourceIds = features => {
				features = (features || []);
				const newFeatures = [...features];
				newFeatures.forEach(feature =>{
					feature.properties.source = sourceKey;
				})
				return newFeatures;
			}

			newMapData.sources[sourceKey].data.features = setSourceIds(newMapData.sources[sourceKey].data.features);

		})

		if (newMapData.sources.annotations ){

			const copyPolygonProperties = handles => {
				return handles.map(handle => {
					const targetId = handle.properties.id;
					const polygonId = targetId;
					const polygon = newMapData.sources.annotationPolygons.data.features.find(feature => (feature.properties.id === polygonId));

					if (polygon){
						handle.properties = {
							...polygon.properties,
							...handle.properties
						}
					}

					return handle;
				})
			}

				newMapData.sources.annotations.data.features = copyPolygonProperties(newMapData.sources.annotations.data.features);
		}

		DEBUG && console.log("***MAP DATA***",newMapData);

		setMapData(newMapData);

	},[rawMapData])

	//build features formats filter
  useEffect(()=>{
		if (!mapHasInit) return;
		console.log("***MAP HAS BEEN FULLY INITIALIZED***");
  },[mapHasInit])

	//detect hidden layers
  useEffect(()=>{
		if (!mapHasInit) return;

		const hiddenLayers = mapboxMap.getStyle().layers.filter(layer => {
	    return (layer.layout?.visibility === 'none')
	  })

		const hiddenIds = hiddenLayers.map(layer => {
	    return layer.id;
	  })

		setLayersDisabled(hiddenIds);

  },[mapHasInit])

	//build features term filter
  useEffect(()=>{

		const disabledTerms = (disabledTermIds || []).map(matchId=>{
			return getMapTermById(matchId);
		});

    const buildFilter = terms => {

      if ( (terms || []).length === 0) return;

			const termFilters = (terms || []).map(term=>{
				const propertyName = getFeaturePropertyNameForTaxonomy(term.taxonomy);
				if (propertyName){
					return ['in',term.slug,['get', propertyName]];
				}
		 	})

      return ['any'].concat(termFilters);

    }

    let filter = buildFilter(disabledTerms);

    if (filter){//exclude all
      filter = ['!',filter];
    }

		DEBUG && console.info("SET TERMS FILTERS",filter);

    setTermsFilter(filter);
  },[disabledTermIds])

	//build features term filter
  useEffect(()=>{

		const buildFilter = areaIds => {

      if ( (areaIds || []).length === 0) return;

			const areaFilters = (areaIds || []).map(areaId=>{
				const feature = getMapAreaById(areaId);
				return ['within', feature];
		 	})

      return ['any'].concat(areaFilters);

    }

    let filter = buildFilter(disabledAreaIds);

    if (filter){//exclude all
      filter = ['!',filter];
    }

    setAreaFilter(filter);
  },[disabledAreaIds])

  //build features formats filter
  useEffect(()=>{

		console.info("DISABLED FORMATS",disabledFormats);

    const buildFilter = formats => {

      //no formats set
      if ( (formats || []).length === 0) return;

      return ['in', ['get', 'format'], ['literal', formats]];

    }

    let filter = buildFilter(disabledFormats);

    if (filter){//exclude all
      filter = ['!',filter];
    }

    setFormatsFilter(filter);
  },[disabledFormats])


	//set global features filters
  useEffect(()=>{

    const filters = [
      termsFilter,
      formatsFilter,
			areaFilter,
			isolationFilter
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
    setFeaturesFilter(filter);

  },[termsFilter,formatsFilter,areaFilter,isolationFilter])

  //set global marker filters
  useEffect(()=>{
    if (mapboxMap === undefined) return;
    DEBUG && console.log("RUN FEATURES FILTER",featuresFilter);

		const layers = ['features'];

		layers.forEach(layerId=>{
      mapboxMap.setFilter(layerId,featuresFilter);
    })

  },[featuresFilter])

	useEffect(()=>{
		if (!mapHasInit) return;

		const allLayerIds = mapboxMap.getStyle().layers.map(layer=>layer.id);
		const disabledIds = (layersDisabled || []);

		allLayerIds.forEach(layerId => {
			const isVisible = !disabledIds.includes(layerId);
			const value = isVisible ? 'visible' : 'none';
		  mapboxMap.setLayoutProperty(layerId, 'visibility', value);
		})

  },[layersDisabled])

	useEffect(()=>{

		if (!mapHasInit) return;

		//hide old
		if (prevActiveFeature.current){
			setMapFeatureState(prevActiveFeature.current,'active',false);
		}

		//show new
		if (activeFeature){
			DEBUG && console.log("SET ACTIVE FEATURE",activeFeature);
			setMapFeatureState(activeFeature,'active',true);
		}

		prevActiveFeature.current = activeFeature;

	},[activeFeature])

	useEffect(()=>{
		if (annotationsLayerIds === undefined) return;
		const layerIds = annotationsLayerIds || [];
		DEBUG && console.log("ALL MAP RASTERS INITIALIZED",layerIds.length);
	},[annotationsLayerIds])

	//filter features that have a minzoom property
	/*
	useEffect(()=>{
    if (maphasInit===undefined) return;

		const computeZoomFilter = () => {
			const currentZoom = Math.floor(mapboxMap.getZoom());
			//const zoomFilter = ["==", ["number",["get", "minzoom"]], 10];
			const zoomFilter = ["has",["get", "minzoom"]];
			setZoomFilter(zoomFilter);
		}

		computeZoomFilter();

		//update zoom filter
    mapboxMap.on('moveend', (e) => {
			computeZoomFilter();
    });


  },[maphasInit])

		*/

		const mapFeatureCollection = () => {
			return mapData.sources?.features.data.features || [];
		}

		const mapAreaCollection = () => {
			return mapData.sources?.areas.data.features || [];
		}

		const mapTags = () => {
			const terms = mapData.terms || [];
			const items = terms.filter(term=>term.taxonomy === 'post_tag');
			return items;
		}

		const mapCategories = () => {
			const terms = mapData.terms || [];
			const items = terms.filter(term=>term.taxonomy === 'category');
			return items;
		}

		const getCategoriesFromSlugs = slugs => {
			slugs = maybeDecodeJson(slugs);
			slugs = [...new Set(slugs||[])];
			return slugs.map(slug=>{
				return mapCategories().find(item => item.slug === slug);
			})
		}

		const getTagsFromSlugs = slugs => {

			slugs = maybeDecodeJson(slugs);
			slugs = [...new Set(slugs||[])];
			return slugs.map(slug=>{
				return mapTags().find(item => item.slug === slug);
			})
		}

		const getFeaturesTags = features => {
		  let slugs = [];

		  (features || []).forEach(feature => {
				const terms = maybeDecodeJson(feature.properties.tags) || [];
		    slugs = slugs.concat(terms);
		  });

			slugs = [...new Set(slugs)];
		  return getTagsFromSlugs(slugs);
		}

		const getFeaturesCategories = features => {
		  let slugs = [];

		  (features || []).forEach(feature => {
				const terms = maybeDecodeJson(feature.properties.categories) || [];
		    slugs = slugs.concat(terms);
		  });

			slugs = [...new Set(slugs)];
		  return getCategoriesFromSlugs(slugs);
		}

		const getFeaturesFormats = features => {
			let slugs = [];

		  (features || []).forEach(feature => {
		    slugs = slugs.concat(feature.properties.format);
		  });

			slugs = [...new Set(slugs)];
			return slugs;

		}

		const updateSidebarFeatures = e => {
	    //get visible features on map for use in the sidebar

	    const getVisibleFeatures = (layerIds) => {

	      //ensure layer exists or query will fail
	      if (mapboxMap === undefined) return;
	      layerIds = layerIds.filter(layerId => {
	        return ( mapboxMap.getLayer(layerId) )
	      })

	      let features = mapboxMap.queryRenderedFeatures({
	        layers: layerIds,
	        filter: featuresFilter
	      }) || [];
	      return getUniqueMapFeatures(features);
	    }

	    //TOUFIX URGENT OLD const features = getVisibleFeatures(['creations','annotations','events','partners']);

	    const features = mapboxMap.queryRenderedFeatures();

	    setMapRenderedFeatures(features);
	  }

	// NOTE: you *might* need to memoize this value
  // Learn more in http://kcd.im/optimize-context
	const value = {
	  mapContainerRef,
	  mapData,
	  setRawMapData,
	  mapboxMap,
	  setMapboxMap,
	  mapHasInit,
	  setMapHasInit,
	  getAnnotationPolygonByHandle,
	  activeFeature,
	  setActiveFeature,
	  sortMarkerBy,
	  setSortMarkerBy,
		setIsolationFilter,
	  setMapFeatureState,
	  getHandlesByAnnotationPolygonId,
	  filterFeaturesByTermId,
	  filterFeaturesByFormat,
		disabledTermIds,
	  setDisabledTermIds,
		toggleTermId,
		selectAllTerms,
		selectNoTerms,
		selectSoloTermId,
	  toggleIsolateTermId,
		disabledFormats,
	  setDisabledFormats,
		selectAllFormats,
		selectNoFormats,
		disabledAreaIds,
	  setDisabledAreaIds,
	  toggleIsolateFormat,
		toggleIsolateArea,
	  zoomOnFeatures,
	  featuresFilter,
	  layersDisabled,
	  toggleMapLayer,
	  annotationsLayerIds,
	  setAnnotationsLayerIds,
		mapFeatureCollection,
		mapRenderedFeatures,
		updateSidebarFeatures,
		mapTags,
		mapCategories,
		mapAreaCollection,
		getCategoriesFromSlugs,
		getTagsFromSlugs,
		getFeaturesTags,
		getFeaturesCategories,
		getFeaturesFormats
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
