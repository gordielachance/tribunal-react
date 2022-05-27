import React, { useEffect,useState,createRef }  from "react";
import classNames from "classnames";

import { CreationCard } from "./CreationCard";
import {setFeatureDistance,getHumanDistance,getFeaturesTags,filterFeatures} from "../Constants";
import { useMap } from '../MapContext';

const FeaturesList = props => {

  const {
    mapData,
    mapboxMap,
    setShowPopup,
    sortMarkerBy,
    getFilteredFeatures,
    setMapFeatureState,
    zoomOnFeatures,
    activeFeatureId,
    setActiveFeatureId
  } = useMap();

  const source = mapData?.sources[props.sourceId];

  const [mapCenter,setMapCenter] = useState();
  const [features,setFeatures] = useState();
  const [featuresRefs,setFeaturesRefs] = useState();

  const prepareFeatures = features => {

    //clone array; we don't want to alter the original data
    let newFeatures = JSON.parse(JSON.stringify(features || []));
    newFeatures = getFilteredFeatures(newFeatures);

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
    if (source?.data.features === undefined) return;
    const data = prepareFeatures(source?.data.features);
    setFeatures(data);

    const refs = data.map(feature => createRef()); //for LI scrolls
    setFeaturesRefs(refs);
  },[source?.data.features,mapCenter,sortMarkerBy])

  useEffect(()=>{
    if (features === undefined) return;
    const refs = features.map(feature => createRef()); //for LI scrolls
    setFeaturesRefs(refs);
  },[features])



  useEffect(()=>{

    if (mapboxMap===undefined) return;

    //on init
    setMapCenter([mapboxMap.getCenter().lng,mapboxMap.getCenter().lat]);

    //When the map is animated
    mapboxMap.on('moveend', (e) => {
      setMapCenter([mapboxMap.getCenter().lng,mapboxMap.getCenter().lat]);
    });

  },[mapboxMap])

  //scroll to the list item
  useEffect(()=>{
    if (activeFeatureId===undefined) return;

    //scroll to list item
    const scrollToFeature = feature_id => {

      console.log("SCROLL TO FEATURE",feature_id);

      //using a feature ID, get its index in the filtered features array.
      const getListIndex = feature_id => {
        let index = (features || []).findIndex(feature => feature.properties.id === feature_id);
        return (index !== -1) ? index : undefined;
      }

      const index = getListIndex(feature_id);
      if (index === undefined) return;

      const ref = featuresRefs[index];
      console.log("!!!SCROLL TO FEATURE",{id:feature_id,index:index},ref);
      ref.current.scrollIntoView({ behavior: 'smooth'});
    }

    scrollToFeature(activeFeatureId);

  },[activeFeatureId])

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

    //we've altered the features (by setting a distance, etc.) - so retrieve the original feature
    const sourceCollection = source?.data.features || [];
    const sourceFeature = sourceCollection.find(sourceFeature => sourceFeature.properties.id === feature.properties.id);

    //center/zoom on feature
    zoomOnFeatures(sourceFeature);

    //unset current feature
    setActiveFeatureId();
    setShowPopup();

    //wait until the map movements stops,
    //so mapbox can handle the feature (it only consider features within the viewport)
    mapboxMap.once('idle', () => {
      //set active feature
      setActiveFeatureId(feature.properties.id);
      setShowPopup(true);
    });

  }

  const toggleHoverFeature = (feature,bool) => {
    setMapFeatureState(feature,'hover',bool);
  }

  return(
    <>
    {
      (features || []).length ?
      <ul id="features-list" className="map-section features-selection">

        {
          features.map((feature,k) => {

            const sortValue = getSortByText(feature);
            const active = (activeFeatureId === feature.properties.id);

            return (
              <li
              ref={featuresRefs[k]}
              key={"feature-card-"+k}
              onMouseEnter={e=>toggleHoverFeature(feature,true)}
              onMouseLeave={e=>toggleHoverFeature(feature,false)}
              onClick={e=>{handleClick(feature)}}
              className={classNames({
                active:   active
              })}
              >
                <p className='sorted-value'>{sortValue}</p>
                <CreationCard feature={feature}/>
              </li>
            )
          })
        }
      </ul>
      :
      <span>Pas de marqueurs trouvés.</span>
    }

    </>

  )
}

export default FeaturesList
