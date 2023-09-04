import React, { useEffect,useState,createRef,useRef }  from "react";
import classNames from "classnames";
import { useNavigate,useParams } from 'react-router-dom';
import {DEBUG} from "../../Constants";
import {setFeatureDistance,getHumanDistance} from "./MapFunctions";
import { useMap } from './MapContext';
import { FeatureCard } from "./FeatureCard";

const FeaturesList = props => {

  const {
    mapboxMap,
    mapHasInit,
    mapFeatureCollection,
    featuresList,
    sortMarkerBy,
    setMapFeatureState,
    activeFeature,
    updateFeaturesList,
    getPointByPostId,
    getClusterByPostId,
    getPostUrl,
    getMapUrl
  } = useMap();

  const navigate = useNavigate();
  const {mapPostId,mapPostSlug} = useParams();

  const [mapCenter,setMapCenter] = useState();
  const [sortedFeatures,setSortedFeatures] = useState();
  const scrollRefs = useRef([]);

  const sortFeatures = features => {

    //clone array; we don't want to alter the original data
    let newFeatures = JSON.parse(JSON.stringify(features || []));

    //compute distance
    if (mapCenter){
      //add 'distance' prop
      newFeatures.forEach(feature => {
        setFeatureDistance(feature,mapCenter);
      });
    }

    //sort
    switch (sortMarkerBy){
      case 'distance':
        //sort by distance
        newFeatures = newFeatures.sort((a, b) => {
          return a.properties.distance - b.properties.distance;
        });
      break;
      default://date
      break;
    }

    return newFeatures;

  }

  //listen to changes on the map and update features list
  useEffect(() => {
    // Define the listener function
    const updateList = () => {
      updateFeaturesList(mapboxMap.current);
    };

    if (mapboxMap.current) {
      mapboxMap.current.on('idle', updateList);
    }

    // Return the cleanup function to remove the listener
    return () => {
      if (mapboxMap.current) {
        mapboxMap.current.off('idle', updateList);
      }
    };
  }, [mapboxMap.current]);

  useEffect(()=>{

    if (featuresList === undefined) return;

    //sort
    const features = sortFeatures(featuresList);

    setSortedFeatures(features);

  },[featuresList,mapCenter,sortMarkerBy])


  useEffect(()=>{
    if (sortedFeatures === undefined) return;
    // Populate scrollable refs
    scrollRefs.current = [...Array(sortedFeatures.length).keys()].map(
      (_, i) => scrollRefs.current[i] ?? createRef()
    );

  },[sortedFeatures])

  useEffect(()=>{

    if (!mapHasInit) return;

    //on init
    setMapCenter([mapboxMap.current.getCenter().lng,mapboxMap.current.getCenter().lat]);

    //When the map is animated
    mapboxMap.current.on('moveend', (e) => {
      setMapCenter([mapboxMap.current.getCenter().lng,mapboxMap.current.getCenter().lat]);
    });

  },[mapHasInit])

  //scroll to the list item
  useEffect(()=>{
    if (activeFeature===undefined) return;

    //scroll to list item
    const scrollToFeature = feature_id => {

      //using a feature ID, get its index in the filtered features array.
      const getListIndex = feature_id => {
        let index = (sortedFeatures || []).findIndex(feature => feature.properties.id === feature_id);
        return (index !== -1) ? index : undefined;
      }

      const index = getListIndex(feature_id);
      if (index === undefined) return;

      const ref = scrollRefs.current[index];
      DEBUG && console.log("SCROLL TO FEATURE",{id:feature_id,index:index},ref);
      ref.current.scrollIntoView({ behavior: 'smooth'});
    }

    scrollToFeature(activeFeature);

  },[activeFeature])

  //TOUFIX should not be updated when center changes; distance should be computed in parent ?

  const getSortByText = feature => {

    //sort markers
    switch(sortMarkerBy){
      case 'distance':
        return feature.properties?.distance ? getHumanDistance(feature.properties.distance) : undefined;
      break;
      default://date
        return feature.properties.date_human
      break;
    }

  }

  const toggleClickPost = post_id => {
    navigate(getPostUrl(post_id));
  }

  const toggleHoverPost = async(post_id,bool) => {
    //hover on 'points' layer
    const point = getPointByPostId(post_id);

    //get feature on 'points' layer

    if (point){
      setMapFeatureState('points',point.id,'hover',bool);
    }else{
      //hover on 'pointClusters' layer
      const cluster = await getClusterByPostId(post_id);
      if (cluster){
        const clusterId = cluster.properties.cluster_id;
        //TOUFIX
      }
    }

  }

  return(
    <>
    {
      (sortedFeatures || []).length ?
      <ul id="features-list">

        {
          sortedFeatures.map((feature,k) => {

            const post_id = feature.properties.post_id;
            const sortValue = getSortByText(feature);
            let active = ( (activeFeature?.properties.id === feature.properties.id) && (activeFeature?.properties.source === feature.properties.source) );

            return <li
            key={k}
            onMouseEnter={e=>toggleHoverPost(post_id,true)}
            onMouseLeave={e=>toggleHoverPost(post_id,false)}
            onClick={e=>{toggleClickPost(post_id)}}
            className={classNames({
              active:   active
            })}
            >
            <p className='sorted-value'>{sortValue}</p>
            <FeatureCard feature={feature}/>
            </li>
            /*


            return (
              <li
              ref={scrollRefs.current[k]}
              key={"feature-card-"+k}
              onMouseEnter={e=>toggleHoverPost(feature,true)}
              onMouseLeave={e=>toggleHoverPost(feature,false)}
              onClick={e=>{toggleClickPost(feature)}}

              >
                <p className='sorted-value'>{sortValue}</p>

              </li>
            )
            */
          })
        }
      </ul>
      :
      <span>Pas de marqueurs trouvés. Veuillez repositionner la carte.</span>
    }

    </>

  )
}

export default FeaturesList
