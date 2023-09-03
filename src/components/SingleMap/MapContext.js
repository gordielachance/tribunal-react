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

	const [activeFeature,setActiveFeature] = useState();
	const prevActiveFeature = useRef();

	const [sortMarkerBy,setSortMarkerBy] = useState('distance');

  const [featuresFilter,setFeaturesFilter] = useState();
	const [isolationFilter,setIsolationFilter] = useState();

  const [disabledTermIds,setDisabledTermIds] = useState([]);
	const [disabledAreaIds,setDisabledAreaIds] = useState([]);
	const [layersDisabled,setLayersDisabled] = useState([]);
  const [disabledFormatIds,setDisabledFormatIds] = useState([]);

  const [openFilterSlugs,setOpenFilterSlugs] = useState([]);

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
    }else{
      newDisabled.splice(index, 1);
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
					DEBUG && console.error("removing "+noGeometryFeatures.length+"/"+features.length+" source features that have no geometry",sourceKey,noGeometryFeatures);
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
					DEBUG && console.error("removing "+noIDfeatures.length+"/"+features.length+" source features that have no IDs",sourceKey,noIDfeatures);
					features = features.filter(x => !noIDfeatures.includes(x));
				}
				return features;
			}

			newMapData.sources[sourceKey].data.features = filterFeaturesWithIDs(newMapData.sources[sourceKey].data.features);

		})


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

		DEBUG && console.log("***MAP DATA***",newMapData);

		setMapData(newMapData);

	},[rawMapData])

	const mapFeatureCollection = () => {
		return mapData?.sources?.points.data.features || [];
	}

	const mapAreaCollection = () => {
		return mapData?.sources?.areas.data.features || [];
	}

	const mapTags = () => {
		const terms = mapData?.terms || [];
		const items = terms.filter(term=>term.taxonomy === 'post_tag');
		return items;
	}

	const mapCategories = () => {
		const terms = mapData?.terms || [];
		const items = terms.filter(term=>term.taxonomy === 'category');
		return items;
	}

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

		mapboxMap.setFilter('points',featuresFilter);

		/* TOUFIX / ISOLATION / BREAKS WITH FEATURES LIST

		if (isolationFilter){
			DEBUG && console.log("FEATURES ISOLATION FILTER",isolationFilter);
			mapboxMap.setFilter('points',isolationFilter);
		}else{
			DEBUG && console.log("FEATURES GLOBAL FILTER",featuresFilter);

		}
		*/



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

	const updateRenderedFeatures = () => {
		const newRenderedFeatures = mapboxMap.queryRenderedFeatures();
		setMapRenderedFeatures(newRenderedFeatures);
	};

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
	  activeFeature,
	  setActiveFeature,
	  sortMarkerBy,
	  setSortMarkerBy,
		setIsolationFilter,
	  setMapFeatureState,
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
		mapFeatureCollection,
		mapRenderedFeatures,
		updateRenderedFeatures,
		mapTags,
		mapCategories,
		mapAreaCollection,
		getCategoriesFromSlugs,
		getTagsFromSlugs,
		getFeaturesTags,
		getFeaturesCategories,
		getFeaturesFormats,
		openFilterSlugs,
		setOpenFilterSlugs
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
