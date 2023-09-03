import React, { useEffect,useState,createRef,useRef }  from "react";
import classNames from "classnames";
import { useNavigate,useParams } from 'react-router-dom';
import {DEBUG,getMapUrl,getFeatureUrl} from "../../Constants";
import {setFeatureDistance,getHumanDistance} from "./MapFunctions";
import { useMap } from './MapContext';
import { FeatureCard } from "./FeatureCard";

const FeaturesList = props => {

  const {
    mapboxMap,
    mapHasInit,
    mapFeatureCollection,
    mapRenderedFeatures,
    sortMarkerBy,
    setMapFeatureState,
    activeFeature
  } = useMap();

  const navigate = useNavigate();
  const {mapPostId,mapPostSlug} = useParams();

  const [mapCenter,setMapCenter] = useState();
  const [featureList,setFeatureList] = useState();
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

  useEffect(()=>{

    if (mapRenderedFeatures === undefined) return;

    //get IDs of rendered points
    const renderedPointIds = (mapRenderedFeatures || [])
    .filter(feature => {
      const isPoint = feature.properties.source === "points";
      const postId = feature.properties.post_id;
      return (isPoint && postId);
    })
    .map(feature => feature.properties.id);

    //filter source data
    let sourceFeatures = mapFeatureCollection()
    .filter(feature => renderedPointIds.includes(feature.properties.id))

    //sort
    sourceFeatures = sortFeatures(sourceFeatures);

    setFeatureList(sourceFeatures);

  },[mapRenderedFeatures,mapCenter,sortMarkerBy])


  useEffect(()=>{
    if (featureList === undefined) return;
    // Populate scrollable refs
    scrollRefs.current = [...Array(featureList.length).keys()].map(
      (_, i) => scrollRefs.current[i] ?? createRef()
    );

  },[featureList])

  useEffect(()=>{

    if (!mapHasInit) return;

    //on init
    setMapCenter([mapboxMap.getCenter().lng,mapboxMap.getCenter().lat]);

    //When the map is animated
    mapboxMap.on('moveend', (e) => {
      setMapCenter([mapboxMap.getCenter().lng,mapboxMap.getCenter().lat]);
    });

  },[mapHasInit])

  //scroll to the list item
  useEffect(()=>{
    if (activeFeature===undefined) return;

    //scroll to list item
    const scrollToFeature = feature_id => {

      //using a feature ID, get its index in the filtered features array.
      const getListIndex = feature_id => {
        let index = (featureList || []).findIndex(feature => feature.properties.id === feature_id);
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

  const handleClick = feature => {

    if ( activeFeature && (feature.properties.id === activeFeature.properties.id) ){//unset active
      const url = getMapUrl(mapPostId,mapPostSlug);
      navigate(url);
    }else{//set active
      switch(feature.source){
        case 'creations':
          navigate(getFeatureUrl(mapPostId,mapPostSlug,feature.properties.source,feature.properties.id) + '/full');
        break;
        default:
          navigate(getFeatureUrl(mapPostId,mapPostSlug,feature.properties.source,feature.properties.id));
      }
    }
  }

  const toggleHoverFeature = (feature,bool) => {
    setMapFeatureState(feature,'hover',bool);
  }

  return(
    <>
    {
      (featureList || []).length ?
      <ul id="features-list">

        {
          featureList.map((feature,k) => {

            const sortValue = getSortByText(feature);
            let active = ( (activeFeature?.properties.id === feature.properties.id) && (activeFeature?.properties.source === feature.properties.source) );

            return <li
            key={k}
            onMouseEnter={e=>toggleHoverFeature(feature,true)}
            onMouseLeave={e=>toggleHoverFeature(feature,false)}
            onClick={e=>{handleClick(feature)}}
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
              onMouseEnter={e=>toggleHoverFeature(feature,true)}
              onMouseLeave={e=>toggleHoverFeature(feature,false)}
              onClick={e=>{handleClick(feature)}}

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
