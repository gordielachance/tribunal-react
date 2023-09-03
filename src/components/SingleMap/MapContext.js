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

  const [featuresFilter,setFeaturesFilter] = useState();
	const [isolationFilter,setIsolationFilter] = useState();

  const [disabledTermIds,setDisabledTermIds] = useState([]);
	const [disabledAreaIds,setDisabledAreaIds] = useState([]);
	const [layersDisabled,setLayersDisabled] = useState([]);
  const [disabledFormatIds,setDisabledFormatIds] = useState([]);

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

		//restrict to this taxonomy
		let excludeTerms = (mapData.terms || []).filter(item=>item.taxonomy === term.taxonomy);

		const excludeIds = excludeTerms.map(item=>item.term_id);

		let newDisabledIds = (disabledTermIds || []).filter(item=>item.taxonomy !== term.taxonomy);//keep other taxonomies
		newDisabledIds = newDisabledIds.concat(excludeIds);//add current taxonomy
		newDisabledIds = newDisabledIds.filter(item=>item !== term.term_id);//exculde current

		newDisabledIds = [...new Set(newDisabledIds)];

		setDisabledTermIds(newDisabledIds);
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

		if (bool){
			const filter = filterInTermId(termId);
			setIsolationFilter(filter);
		}else{
			setIsolationFilter();
		}
  }

	const selectAllAreas = () => {
		setDisabledAreaIds();
	}

	const selectNoAreas = () => {
		let targetFeatures = mapAreaCollection();

		const targetIds = targetFeatures.map(item=>item.properties.id);

		let newDisabledIds = disabledTermIds.concat(targetIds);
		newDisabledIds = [...new Set(newDisabledIds)];

		setDisabledAreaIds(newDisabledIds);
	}

	const toggleIsolateFormat = (slug,bool) => {

		if (bool){
			const filter = filterInFormat(slug);
			setIsolationFilter(filter);
		}else{
			setIsolationFilter();
		}

  }

	const selectAllFormats = () => {
		setDisabledFormatIds();
	}

	const selectNoFormats = () => {
		setDisabledFormatIds(WP_FORMATS);
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


		if (bool){
			const filter = filterWithinArea(feature);
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

	const filterInTermId = termId => {
		const term = getMapTermById(termId);
		if (!term) return false;

		const propertyName = getFeaturePropertyNameForTaxonomy(term.taxonomy);
		if (!propertyName) return;

		return ['in',term.slug,['get', propertyName]];

	}

	const filterExcludeTermIds = termIds => {

		if ( (termIds || []).length === 0) return;

		const filters = termIds.map(itemId=>{
			return filterInTermId(itemId)
		})

		let filter = ['any'].concat(filters);
		filter = ['!',filter];//exclude all
		return filter;

	}

	const filterInFormat = slug => {
		return ['in', ['get', 'format'], ['literal', slug]];
	}

	const filterExcludeFormats = slugs => {
		if ( (slugs || []).length === 0) return;

		const filters = slugs.map(slug=>{
			return filterInFormat(slug)
		})

		let filter = ['any'].concat(filters);
		filter = ['!',filter];//exclude all
		return filter;
	}

	const filterWithinAreaId = areaId => {
		const feature = getMapAreaById(areaId);
		return filterWithinArea(feature);
	}

	const filterWithinArea = feature => {
		return ['within', feature];
	}

	const filterExcludeAreaIds = areaIds => {
		if ( (areaIds || []).length === 0) return;

		const filters = areaIds.map(itemId=>{
			return filterWithinAreaId(itemId)
		})

		let filter = ['any'].concat(filters);
		filter = ['!',filter];//exclude all
		return filter;

	}

	const filterFeatures = (disabledTermIds,disabledAreaIds,disabledFormatIds) => {

		let filters = [
			filterExcludeTermIds(disabledTermIds),
			filterExcludeAreaIds(disabledAreaIds),
			filterExcludeFormats(disabledFormatIds),
		]

		filters = filters.filter(function(filter) {
			return filter !== undefined;
		});

		//no filters
		if ( (filters || []).length === 0) return;
		return ['all'].concat(filters);
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

	//INIT
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

	//features global filter
  useEffect(()=>{
    const filter = filterFeatures(disabledTermIds,disabledAreaIds,disabledFormatIds);
    setFeaturesFilter(filter);
  },[disabledTermIds,disabledAreaIds,disabledFormatIds])

  //set global feature filters
  useEffect(()=>{
    if (mapboxMap === undefined) return;

		if (isolationFilter){
			DEBUG && console.log("FEATURES ISOLATION FILTER",isolationFilter);
			mapboxMap.setFilter('points',isolationFilter);
		}else{
			DEBUG && console.log("FEATURES GLOBAL FILTER",featuresFilter);
			mapboxMap.setFilter('points',featuresFilter);
		}


  },[featuresFilter,isolationFilter])

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
		disabledFormatIds,
	  setDisabledFormatIds,
		selectAllFormats,
		selectNoFormats,
		disabledAreaIds,
	  setDisabledAreaIds,
		selectAllAreas,
		selectNoAreas,
	  toggleIsolateFormat,
		toggleIsolateArea,
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
