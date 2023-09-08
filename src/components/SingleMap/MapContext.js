////https://gist.github.com/jimode/c1d2d4c1ab33ba1b7be8be8c50d64555

import React, { useState,useEffect,createContext,useRef } from 'react';
import {DEBUG,maybeDecodeJson,getPropertyNameFromTaxonomy} from "../../Constants";
import {getUniqueMapFeatures} from "./MapFunctions";
import * as turf from "@turf/turf";

import {
	isFeaturesSource,
	sortFeaturesByDistance,
	bboxToCircle,
} from "./MapFunctions";

import DatabaseAPI from "../../databaseAPI/api";

const MapContext = createContext();

export function MapProvider({children}){

	const mapContainerRef = useRef();
	const mapCluster = useRef();
	const mapboxMap = useRef();

	const [mapHasInit,setMapHasInit] = useState(false);

	const [mapId,setMapId] = useState();
	const [mapData,setMapData] = useState();
	const [mapTerm,setMapTerm] = useState();

	const [featuresList,setFeaturesList] = useState();

	const [activeFeature,setActiveFeature] = useState();
	const prevActiveFeature = useRef();

	const [sortMarkerBy,setSortMarkerBy] = useState('distance');

  const [featuresFilter,setFeaturesFilter] = useState();
	const [isolationFilter,setIsolationFilter] = useState();

  const [disabledTermIds,setDisabledTermIds] = useState([]);
	const [disabledAreaIds,setDisabledAreaIds] = useState([]);
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

		const propertyName = getPropertyNameFromTaxonomy(term.taxonomy);
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

	const getMapTermById = id => {
		return (mapData.terms || []).find(item => id === item.term_id);
	}

	const getMapPostById = id => {
		return (mapData.posts || []).find(item => id === item.id);
	}

	//we need a taxonomy to filter items since a lot of them have parentId = 0
	const getTermChildren = (parentId, taxonomy, recursive = false) => {
	  if (taxonomy === undefined) {
	    throw "Missing 'taxonomy' parameter.";
	  }

	  const children = (mapData.terms || [])
	    .filter((term) => term.taxonomy === taxonomy)
	    .filter((term) => term.parent === parentId);

	  if (recursive) {
	    const childrenTerms = children.map((child) =>
	      getTermChildren(child.term_id, taxonomy, true)
	    );

	    // Concatenate and flatten the recursive results into a single array
	    return children.concat(...childrenTerms);
	  }

	  return children;
	};

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

		const term = getMapTermById(termId);
		if (!term) return;

		//also get children
		const childrenIds = (getTermChildren(term.term_id,term.taxonomy,true) || [])
			.map(term => term.term_id);

	  const termIds = [term.term_id].concat(childrenIds);

		let newIds = [];

		const bool = (disabledTermIds || []).includes(term.term_id);

		if (!bool){
      newIds = [...disabledTermIds, ...termIds];
    }else{
      newIds = disabledTermIds.filter(id => !termIds.includes(id));
    }

		setDisabledTermIds(newIds);

	};

  const toggleIsolateTerm = (term,bool) => {
		if (bool){
			const filter = filterInTerm(term);
			setIsolationFilter(filter);
		}else{
			setIsolationFilter();
		}

		switch(term.taxonomy){
			case 'tdp_area':
				toggleIsolateArea(term,bool);
			break;
		}

  }

	const filterFeaturesByFormat = (features,slug) => {
		return (features || []).filter(feature=>{
			const format = feature.properties?.format;
			return format === slug;
		})
	}

	const toggleIsolateArea = (term,bool) =>{

		//get area feature
		const feature = mapAreaCollection().find(feature => feature.properties.term_id === term.term_id);
		if (!feature) return;

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

	const filterInTerm = term => {
		if (!term) return;

		const propertyName = getPropertyNameFromTaxonomy(term.taxonomy);
		if (!propertyName) return;

		return ['in',term.slug,['get', propertyName]];

	}

	const filterExcludeTermIds = termIds => {

		if ( (termIds || []).length === 0) return;

		const filters = termIds.map(itemId=>{
			const term = getMapTermById(itemId);
			return filterInTerm(term)
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

	const getTerms = taxonomy => {
		const terms = mapData?.terms || [];
		const items = terms.filter(term=>term.taxonomy === taxonomy);
		return items;
	}

	const getFeaturesByFormat = format => {
		if (!format) return;
	  return (mapFeatureCollection() || []).filter(feature => feature.properties.format === format);
	}

	const getFeaturesByTerm = (taxonomy,slug) => {
		if (!slug) return;
		const propName = getPropertyNameFromTaxonomy(taxonomy);
		if (!propName) return;
	  return (mapFeatureCollection() || []).filter(feature => feature.properties[propName].includes(slug) );
	}

	const getFeaturesByAreaId = areaId => {
		if (areaId === undefined) return;
		return (mapFeatureCollection() || []).filter(feature => feature.properties.areas.includes(areaId) );
	}

	//INIT

  //Get data based on map ID
  useEffect(()=>{

    let isSubscribed = true;

    const fetchData = async mapId => {
	    const data = await DatabaseAPI.getSingleItem('maps',mapId,{mapbox:true});
			if (isSubscribed) {

        /*
        Keep this for dev purpose

        //add areas as an array in the point properties
      	const assignAreasToPoints = data => {
          const areas = data.sources.areas?.data.features || [];
          const features = data.sources.points?.data.features || [];

          areas.forEach(area=>{
            features.forEach(feature=>{
              const within = turf.booleanPointInPolygon(feature, area);
              if (within){
                feature.properties.areas = (feature.properties.areas || []).concat(area.properties.slug);
              }
            })
          })
        }

        //remove no features areas
      	const removeEmptyAreaTerms = data => {
          const features = data.sources.points?.data.features || [];
          const areaFeatures = features.filter(feature=>(feature.properties.areas || []).length > 0);

          let areaSlugs = areaFeatures.map(feature=>feature.properties.areas).flat();
      		areaSlugs = [...new Set(areaSlugs)];//make unique

          //remove unused areas
          data.terms = data.terms
            .filter(term=>{
              if (term.taxonomy === 'tdp_area'){
                return areaSlugs.includes(term.slug);
              }else{
                return true;
              }
            })

        }

        assignAreasToPoints(data);
        removeEmptyAreaTerms(data);

        */

        setMapData(data);
	    }
		}

		if (mapId){
			fetchData(mapId);
		}

		//clean up fn
		return () => isSubscribed = false;

  },[mapId])

	useEffect(()=>{
		if (mapData === undefined) return;

		const term = getMapTermById(mapId);
		setMapTerm(term);

		console.log("MAP DATA LOADED FOR POST",mapId,mapData);

	},[mapData])

	//Map ready
  useEffect(()=>{
		if (!mapHasInit) return;
		console.log("***MAP HAS BEEN FULLY INITIALIZED***");

  },[mapHasInit])

	//when filters are updated, clear and set clusters source
  //(it does not work with layer filters, so we have to edit its source)

  useEffect(()=>{
    if (!mapHasInit) return;
		if (!mapCluster.current) return;

    const updateClusters = filter => {

      // Filter your data based on filterCriteria
			let newData = JSON.parse(JSON.stringify(mapData.sources.points.data));

			const randomIndex = Math.floor(Math.random() * newData.features.length);
			newData.features.splice(randomIndex);

			console.log();
			console.log("UPDATE DATA FOR CLUSTERS",filter,newData);

      mapboxMap.current.getSource('points').setData(newData);
    }

		updateClusters(featuresFilter);

  },[mapHasInit,featuresFilter])

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

	const getTermsFromSlugs = (taxonomy,slugs) => {
		slugs = maybeDecodeJson(slugs);
		slugs = [...new Set(slugs||[])];
		return slugs.map(slug=>{
			return getTerms(taxonomy).find(item => item.slug === slug);
		})
	}

	const filterTermsByFeatures = (taxonomy,features) => {
	  let slugs = [];

		const propName = getPropertyNameFromTaxonomy(taxonomy);
		if (!propName) return;

	  (features || []).forEach(feature => {
			const terms = maybeDecodeJson(feature.properties[propName]) || [];
	    slugs = slugs.concat(terms);
	  });

		slugs = [...new Set(slugs)];
	  return getTermsFromSlugs(taxonomy,slugs);
	}

	const getRenderedPointIds = () => {
		if (!mapboxMap.current) return null;
		const features = mapboxMap.current.queryRenderedFeatures({ layers: ['points'] });
		return (features || [])
			.map((feature) => feature.properties.post_id)
			.filter(id=>(id!==undefined))
	};

	const getPointByPostId = post_id => {
		if (!mapboxMap.current) return null;
		return (getRenderedPointIds() || []).find((feature) => feature.properties.post_id === post_id);
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
	    const postIds = await getPostIdsByClusterId(clusterId);

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

	  const getClustersPostIds = async () => {
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

	  const pointPostIds = getRenderedPointIds();
	  const clusterPostIds = await getClustersPostIds();
	  let postIds = pointPostIds
			.concat(clusterPostIds)
			.sort((a, b) => a - b)//for debug purposes

		postIds = [...new Set(postIds)];//make unique

	  // Filter source data
		const features = mapFeatureCollection();
	  let data = features
			.filter((feature) => postIds.includes(feature.properties.post_id));

	  DEBUG && console.info("UPDATED FEATURES LIST",data.length);
	  setFeaturesList(data);
	};

	const getMapUrl = () => {
		const id = mapTerm.term_id;
		const slug = mapTerm.slug;
	  return `/cartes/${id}/${slug}`;
	}

	const getPointUrl = (featureId) => {
	  const mapUrl = getMapUrl();
	  let url = mapUrl + `/points/${featureId}`;
	  return url;
	}

	const getPostUrl = post => {
	  const mapUrl = getMapUrl();
		//const url = mapUrl + `/posts/${post.id}/${post.slug}`;
	  const url = mapUrl + `/posts/${post.id}`;
	  return url;
	}

	// NOTE: you *might* need to memoize this value
  // Learn more in http://kcd.im/optimize-context
	const value = {
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
	  toggleIsolateTerm,
		disabledFormatIds,
	  setDisabledFormatIds,
		disabledAreaIds,
	  setDisabledAreaIds,
	  featuresFilter,
		mapFeatureCollection,
		featuresList,
		updateFeaturesList,
		mapAreaCollection,
		getTermsFromSlugs,
		filterTermsByFeatures,
		openFilterSlugs,
		setOpenFilterSlugs,
		getPointByPostId,
		getClusterByPostId,
		getMapUrl,
		getPointUrl,
		getPostUrl,
		getFeaturesByTerm,
		getFeaturesByAreaId,
		getTermChildren,
		mapId,
		mapTerm,
		setMapId,
		getMapPostById
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
