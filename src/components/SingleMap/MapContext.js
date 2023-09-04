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

	const mapContainerRef = useRef();
	const mapCluster = useRef();
	const mapboxMap = useRef();

	const [mapHasInit,setMapHasInit] = useState(false);

	const [mapData,setMapData] = useState();

	const [featuresList,setFeaturesList] = useState();

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

	const setMapFeatureState = (sourceKey,featureId,key,value) => {
		mapboxMap.current.setFeatureState(
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
      setMapFeatureState('points',feature.id,'hover',bool);
    })

  }
	//hover features matching this format
	const toggleHoverFormat = (slug,bool) => {

    const matches = filterFeaturesByFormat(mapFeatureCollection(),slug);

    matches.forEach(feature=>{
      setMapFeatureState('points',feature.id,'hover',bool);
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
		setMapFeatureState('areas',areaId,'hover',bool);

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

		const hiddenLayers = mapboxMap.current.getStyle().layers.filter(layer => {
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
    if (mapboxMap.current === undefined) return;

		mapboxMap.current.setFilter('points',featuresFilter);

		if (isolationFilter){
			DEBUG && console.log("FEATURES ISOLATION FILTER",isolationFilter);
			mapboxMap.current.setFilter('points',isolationFilter);
		}else{
			DEBUG && console.log("FEATURES GLOBAL FILTER",featuresFilter);
		}

  },[featuresFilter,isolationFilter])

	useEffect(()=>{
		if (!mapHasInit) return;

		const allLayerIds = mapboxMap.current.getStyle().layers.map(layer=>layer.id);
		const disabledIds = (layersDisabled || []);

		allLayerIds.forEach(layerId => {
			const isVisible = !disabledIds.includes(layerId);
			const value = isVisible ? 'visible' : 'none';
		  mapboxMap.current.setLayoutProperty(layerId, 'visibility', value);
		})

  },[layersDisabled])

	useEffect(()=>{

		if (!mapHasInit) return;

		//hide old
		if (prevActiveFeature.current){
			setMapFeatureState('points',prevActiveFeature.current.properties.id,'active',false);
		}

		//show new
		if (activeFeature){
			DEBUG && console.log("SET ACTIVE FEATURE",activeFeature);
			setMapFeatureState('points',activeFeature.properties.id,'active',true);
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


	const getPointIds = () => {
		if (!mapboxMap.current) return null;
		const features = mapboxMap.current.queryRenderedFeatures({ layers: ['points'] });
		return (features || []).map((feature) => feature.properties.id);
	};

	const getPointByPostId = post_id => {
		if (!mapboxMap.current) return null;
		const features = mapboxMap.current.queryRenderedFeatures({ layers: ['points'] });
		return (features || []).find((feature) => feature.properties.post_id === post_id);
	}

	//Get the cluser ID based on a post ID
	const getClusterByPostId = async postId => {
	  if (!mapboxMap.current) return null;

		if (!postId){
			throw "Missing 'postId' parameter .";
		}

	  const features = mapboxMap.current.queryRenderedFeatures({ layers: ['pointClusters'] });

	  for (const feature of features) {
	    const clusterId = feature.properties.cluster_id;

	    // Get the leaves for the current cluster
	    const postIds = await getPostIdsByClusterId(clusterId); // Assuming you have this function

	    // Check if the postId exists in the leaves
	    if (postIds.includes(postId)) {
	      return feature; // Found the cluster containing the postId
	    }
	  }

	  return null; // Post ID not found in any clusters
	};

	// Get the post IDs related to a cluster using a Promise
	const getPostIdsByClusterId = async clusterId => {

		if (!mapboxMap.current) return null;

	  return new Promise((resolve, reject) => {

	    mapboxMap.current.getSource("points").getClusterLeaves(clusterId, Infinity, 0, (error, leaves) => {
	      if (error) {
	        reject(error);
	        return;
	      }

	      // Extract individual point IDs from the leaves
	      const ids = leaves.map((leaf) => leaf.properties.post_id);

	      resolve(ids);
	    });
	  });
	};

	const updateFeaturesList = async (map) => {
	  if (!map) return;

	  const getPostIdsFromClusters = async () => {
	    const features = map.queryRenderedFeatures({ layers: ['pointClusters'] });

	    const clusterIds = (features || []).map((feature) => feature.properties.cluster_id);

	    const clusterPostIds = await Promise.all(
	      clusterIds.map(async (clusterId) => {
					return await getPostIdsByClusterId(clusterId);
	      })
	    );

	    // Flatten the array of arrays
	    return clusterPostIds.flat();
	  };

	  let postIds = getPointIds();
	  const clusterPostIds = await getPostIdsFromClusters();
	  postIds = postIds.concat(clusterPostIds);

	  // Filter source data
	  let data = mapFeatureCollection().filter((feature) => postIds.includes(feature.properties.id));

	  DEBUG && console.info("UPDATED FEATURES LIST");
	  setFeaturesList(data);
	};

	const getMapUrl = () => {
		const id = mapData.post.term_id;
		const slug = mapData.post.slug;
	  return `/cartes/${id}/${slug}`;
	}

	const getPostUrl = (postId) => {
	  const mapUrl = getMapUrl();
	  let url = mapUrl + `/posts/${postId}`;
	  return url;
	}

	// NOTE: you *might* need to memoize this value
  // Learn more in http://kcd.im/optimize-context
	const value = {
		setMapData,
	  mapData,
	  mapContainerRef,
		mapboxMap,
		mapCluster,
	  mapHasInit,
	  setMapHasInit,
	  activeFeature,
	  setActiveFeature,
	  sortMarkerBy,
	  setSortMarkerBy,
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
		featuresList,
		updateFeaturesList,
		mapTags,
		mapCategories,
		mapAreaCollection,
		getCategoriesFromSlugs,
		getTagsFromSlugs,
		getFeaturesTags,
		getFeaturesCategories,
		getFeaturesFormats,
		openFilterSlugs,
		setOpenFilterSlugs,
		getPointByPostId,
		getClusterByPostId,
		getMapUrl,
		getPostUrl
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
