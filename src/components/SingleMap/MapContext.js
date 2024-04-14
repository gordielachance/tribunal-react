////https://gist.github.com/jimode/c1d2d4c1ab33ba1b7be8be8c50d64555

import React, { useState,useEffect,createContext,useRef } from 'react';
import {DEBUG,taxonomiesMap,getPropertyNameFromTaxonomy} from "../../Constants";
import {getUniqueMapFeatures} from "./MapFunctions";
import * as turf from "@turf/turf";

import {
	isFeaturesSource,
	sortFeaturesByDistance,
	bboxToCircle,
} from "./MapFunctions";

import StrapiAPI from "../../strapiAPI/api";
import DatabaseAPI from "../../databaseAPI/api";

const MapContext = createContext();

export function MapProvider({children}){

	const mapContainerRef = useRef();
	const mapCluster = useRef();
	const mapboxMap = useRef();

	const [mapHasInit,setMapHasInit] = useState(false);

	const [mapId,setMapId] = useState();
	const initialMapData = useRef();
	const [mapData,setMapData] = useState();
	const [mapTerm,setMapTerm] = useState();

	const [featuresList,setFeaturesList] = useState();

	const [activeFeature,setActiveFeature] = useState();
	const prevActiveFeature = useRef();

	const [sortMarkerBy,setSortMarkerBy] = useState('distance');

	const [disabledTermIds,setDisabledTermIds] = useState([]);
	const [isolationFilter,setIsolationFilter] = useState();//TOUFIX STILL USED ?

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

		//console.info(`FILTER FEATURES FOR TERM '${term.slug}' OF TYPE '${term.taxonomy}'`)

		return (features || []).filter(feature=>{
			const postId = feature.properties.wp_id;
			const post = getMapPostById(postId);
			const postTermIds = post[propertyName] || [];
			return postTermIds.includes(term.term_id);
		})
	}

	const getMapTermById = id => {
		return (mapData.terms || []).find(item => id === item.term_id);
	}

	const getMapPostById = id => {
		return (mapData.posts || []).find(item => id === item.id);
	}

	const getMapFeatureById = id => {
		return (mapData.sources.points.data.features || []).find(item => id === item.properties.id);
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

		if (!term) return;

		if (bool){
			const filter = filterInTerm(term);
			setIsolationFilter(filter);
		}else{
			setIsolationFilter();
		}

		switch(term.taxonomy){
			case 'tdp_area':
				toggleShowArea(term.term_id);
			break;
		}

  }

	const toggleShowArea = (termId,bool) => {
		const area = getAreaByTermId(termId);
		if(area===undefined) return;
		setMapFeatureState('areas',area.properties.id,'hover',bool);
	}

	//hover features  matching this tag
	const toggleHoverTerm = (term,bool) => {

		if (!term?.term_id) return;

    const matches = filterFeaturesByTermId(mapFeatureCollection(),term.term_id);

    (matches || []).forEach(feature=>{
      setMapFeatureState('points',feature.properties.id,'hover',bool);
    })

		if (term.taxonomy === 'tdp_area'){
			toggleShowArea(term.term_id,bool);
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

	const filterPointSourceByDisabledTermIds = (disabledTermIds) => {
		if (!initialMapData.current) return;
		let newPointsData = initialMapData.current.sources.points.data;
		newPointsData = JSON.parse(JSON.stringify(newPointsData));//clone

		const slugProps = Object.values((taxonomiesMap || []));

		const taxonomyIgnoreIds = {};

		// get all disabled IDs sorted by taxonomy
		(disabledTermIds || []).forEach(termId => {
		  const term = getMapTermById(termId);
		  if (!term) return;
		  const propName = getPropertyNameFromTaxonomy(term.taxonomy);
		  if (!propName) return;

		  // update array
		  taxonomyIgnoreIds[propName] = (taxonomyIgnoreIds[propName] || []).concat(term.term_id);
		});

		//function responsible for ignoring a feature
		const shouldIgnoreFeature = feature => {

			const postId = feature.properties.wp_id;
			const post = getMapPostById(postId);

		  for (const propName in taxonomyIgnoreIds) {
		    if (post.hasOwnProperty(propName)) {
		      const postTermIds = post[propName];
		      const termIdsToIgnore = taxonomyIgnoreIds[propName];

					const match = (termIdsToIgnore || []).filter(id => {
						const exists = postTermIds.includes(id);
						if (exists){
							//console.info(`FILTER OUT FEATURE #${post.id} BECAUSE PROPERTY '${propName}' CONTAINS '${slug}'`)
						}
						return exists;
					})

		      if (match.length > 0){
						return true;
					}
		    }
		  }

		  return false;
		}

		const ignoredFeature = (newPointsData.features || [])
			.filter(feature => {
				return shouldIgnoreFeature(feature);
			})

		const ignoredFeatureIds = (ignoredFeature || [])
			.map(feature => feature.properties.id)

		const keepFeatures = (newPointsData.features || []).filter(feature => {
			return !ignoredFeatureIds.includes(feature.properties.id);
		})

		newPointsData.features = keepFeatures;

		mapboxMap.current.getSource('points').setData(newPointsData);
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

	const getRenderedFeatureByPostId = postId => {
		if (!postId) return;
		if (!mapboxMap.current) return null;

		const features = mapboxMap.current.queryRenderedFeatures({ layers: ['points'] });
		return (features || []).find(feature => {
			return (feature.properties.wp_id === postId);
		});

	}

	const getRenderedFeaturesByTermId = termId => {
		if (!termId) return;
		const term = getMapTermById(termId);
		const propName = getPropertyNameFromTaxonomy(term.taxonomy);
		if (!propName) return;

	  return (mapFeatureCollection() || [])
			.filter(feature => {
				const postId = feature.properties.wp_id;
				const post = getMapPostById(postId);
				return (post[propName] || []).includes(termId);
			});
	}

	//INIT

  //Get data based on map ID
  useEffect(()=>{

    let isSubscribed = true;

    const fetchData = async mapId => {
	    const data = await DatabaseAPI.getSingleItem('maps',mapId,{format:'frontend'});

			console.log("STRAPI REPLACE POINTS");
			data.sources.points.data = (await StrapiAPI.getFeatures({geojson:true})).data;

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


				initialMapData.current = data;
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

	//features global filter
  useEffect(()=>{
    const newPointsData = filterPointSourceByDisabledTermIds(disabledTermIds);
  },[disabledTermIds])

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

	const getTermsForFeatures = (taxonomy,features) => {
	  let termIds = [];

		const propName = getPropertyNameFromTaxonomy(taxonomy);
		if (!propName) return;

		//get term IDs by post
	  termIds = (features || []).map(feature => {
			const postId = feature.properties.wp_id;
			const post = getMapPostById(postId);
			return post[propName] ?? [];
	  });

		termIds = termIds.flat();//flatten
		termIds = [...new Set(termIds)];//unique

		//get terms
		const terms = (termIds || []).map(id => {
			return getMapTermById(id);
		});

		return terms;
	}

	const getRenderedFeatureIds = () => {
		if (!mapboxMap.current) return null;
		const features = mapboxMap.current.queryRenderedFeatures({ layers: ['points'] });
		const ids = (features || [])
			.map((feature) => feature.properties.id)
		return [...new Set(ids)];//make unique
	};

	const getAreaByTermId = term_id => {
		if (!term_id) return;
		if (!mapboxMap.current) return null;
		return (mapAreaCollection() || []).find(feature => feature.properties?.wp_id === term_id);
	}

	//Get the cluser ID based on a post ID
	const getClusterByFeatureId = async id => {
	  if (!mapboxMap.current) return null;

		if (!id){
			throw "Missing feature 'id' parameter .";
		}

	  const features = mapboxMap.current.queryRenderedFeatures({ layers: ['pointClusters'] });

	  for (const feature of features) {
	    const clusterId = feature.properties.cluster_id;

	    // Get the leaves for the current cluster
	    const ids = await getFeatureIdsByClusterId(clusterId);

	    // Check if the postId exists in the leaves
	    if (ids.includes(id)) {
	      return feature; // Found the cluster containing the postId
	    }
	  }

	  return null; // Post ID not found in any clusters
	};

	// Get the post IDs related to a cluster using a Promise
	const getFeatureIdsByClusterId = async clusterId => {

		if (!mapboxMap.current) return null;

	  return new Promise((resolve, reject) => {

	    mapboxMap.current.getSource("points").getClusterLeaves(clusterId, Infinity, 0, (error, leaves) => {
	      if (error) {
	        reject(error);
	        return;
	      }

	      // Extract individual point IDs from the leaves
	      const ids = leaves.map((leaf) => leaf.properties.id);

	      resolve(ids);
	    });
	  });
	};

	const updateFeaturesList = async (map) => {
	  if (!map) return;

	  const getClusterFeatureIds = async () => {
	    const features = map.queryRenderedFeatures({ layers: ['pointClusters'] });

	    const clusterIds = (features || []).map((feature) => feature.properties.cluster_id);

	    const clusterFeatureIds = await Promise.all(
	      clusterIds.map(async (clusterId) => {
					return await getFeatureIdsByClusterId(clusterId);
	      })
	    );

	    // Flatten the array of arrays
	    const ids = clusterFeatureIds.flat();
			return [...new Set(ids)];//make unique

	  };

	  const pointFeatureIds = getRenderedFeatureIds();
	  const clusterFeatureIds = await getClusterFeatureIds();

	  let featureIds = pointFeatureIds
			.concat(clusterFeatureIds)
			.sort((a, b) => a - b)//for debug purposes

		featureIds = [...new Set(featureIds)];//make unique

	  // Filter source data
		const features = mapFeatureCollection();
	  let data = features
			.filter((feature) => featureIds.includes(feature.properties.id));

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
		disabledTermIds,
	  setDisabledTermIds,
		toggleTermId,
		selectAllTerms,
		selectNoTerms,
		selectSoloTermId,
	  toggleIsolateTerm,
		toggleHoverTerm,
		mapFeatureCollection,
		featuresList,
		updateFeaturesList,
		mapAreaCollection,
		getMapTermById,
		getTermsForFeatures,
		openFilterSlugs,
		setOpenFilterSlugs,
		getRenderedFeatureByPostId,
		getRenderedFeaturesByTermId,
		getClusterByFeatureId,
		getMapUrl,
		getPointUrl,
		getPostUrl,
		getTermChildren,
		mapId,
		mapTerm,
		setMapId,
		getMapPostById,
		getMapFeatureById
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
