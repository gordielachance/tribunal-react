import React, { useEffect,useState,useRef,createRef }  from "react";
import classNames from "classnames";

import { CreationCard } from "./CreationCard";
import {setFeatureDistance,getHumanDistance} from "../Constants";
import { useMap } from '../MapContext';

const FeaturesList = props => {
  const {
    mapData,
    mapboxMap,
    activeFeatureId,
    fitToFeature,
    setActiveFeatureId,
    setShowPopup,
    getHandleIdByAnnotationId,
    sortMarkerBy,
    markerTagsDisabled,
    markerFormatsDisabled
  } = useMap();

  const source = mapData?.sources[props.sourceId];

  const [mapCenter,setMapCenter] = useState();

  const filterFeaturesByDisabledTags = (features,disabledTags) => {
    if (disabledTags.length !== 0){
      features = features.filter(feature =>{
        const featureTags = feature.properties.tag_slugs;
        const featureDisabledTags = featureTags.filter(x => disabledTags.includes(x));
        const hasDisabledTags = (featureDisabledTags.length > 0);
        console.log("HAS DISABLED TAGS ?",hasDisabledTags,featureDisabledTags,featureTags);
        return !hasDisabledTags;
      })
    }

    return features;

  }

  const filterFeaturesByDisabledFormats = (features,disabledFormats) => {
    if (disabledFormats.length !== 0){
      console.log("FILTER FEATURES BY DISABLED FORMATS",disabledFormats);
      features = features.filter(feature =>{
        const featureFormat = feature.properties.format;
        return !disabledFormats.includes(featureFormat);
      })
    }

    return features;

  }

  const prepareFeatures = features => {

    //clone array; we don't want to alter the original data
    let newFeatures = JSON.parse(JSON.stringify(features || []));

    //filters
    newFeatures = filterFeaturesByDisabledTags(newFeatures,markerTagsDisabled);
    newFeatures = filterFeaturesByDisabledFormats(newFeatures,markerFormatsDisabled);

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

  const features = prepareFeatures(source?.data.features);
  const featuresRefs = features.map(feature => createRef()); //for LI scrolls

  //scroll to list item
  const scrollToFeature = feature_id => {

    //using a feature ID, get its index in the filtered features array.
    const getListIndex = feature_id => {
      let index = features.findIndex(feature => feature.properties.id === feature_id);
      return (index !== -1) ? index : undefined;
    }

    const index = getListIndex(feature_id);
    if (index === undefined) return;

    const ref = featuresRefs[index];
    console.log("SCROLL TO FEATURE",feature_id,index,ref);
    ref.current.scrollIntoView({ behavior: 'smooth'});
  }

  useEffect(()=>{

    if (mapboxMap===undefined) return;

    //When the map is animated
    mapboxMap.on('moveend', (e) => {
      setMapCenter([mapboxMap.getCenter().lng,mapboxMap.getCenter().lat]);
    });

  },[mapboxMap])

  //scroll to the list item (if context is 'map')
  useEffect(()=>{
    const context = activeFeatureId?.context;
    const sourceId = activeFeatureId?.source;
    const featureId = activeFeatureId?.id;

    if (context !== 'map') return;
    if (sourceId!==props.sourceId) return;
    if (featureId===undefined) return;

    scrollToFeature(featureId);

  },[activeFeatureId])

  //TOUFIX should not be updated when center changes; distance should be computed in parent ?

  const getSortByText = feature => {

    //sort markers
    switch(sortMarkerBy){
      case 'distance':
        return feature.properties.distance ? getHumanDistance(feature.properties.distance) : undefined;
      break;
      default://date
        return feature.properties.timestamp
      break;
    }

  }

  const gotoFeature = (source_id,feature_id) => {

    //center/zoom on feature
    fitToFeature(source_id,feature_id);

    //wait until the map movements stops,
    //so mapbox can handle the feature (it only consider features within the viewport)
    mapboxMap.once('idle', () => {

      //for annotations; get the first available handle.
      if (source_id === 'annotations'){
        source_id = 'annotationsHandles';
        feature_id = getHandleIdByAnnotationId(feature_id);
      }

      setActiveFeatureId({
        source:source_id,
        id:feature_id,
        context:'sidebar'
      });
      setShowPopup(true);

    });

    /*
    mapboxMap.easeTo({
      center:sourceFeature.geometry.coordinates,
      zoom:14,
      duration: 3000,
    })
    */

  }

  return(
    <>
    {
      features.length ?
      <ul id="marker-list" className="map-section">

        {
          features.map((feature,k) => {

            const feature_id = feature.properties.id;
            const active = ( (activeFeatureId?.id === feature_id) && (activeFeatureId?.source === props.sourceId) );

            const handleClick = e => {
              gotoFeature(props.sourceId,feature_id);
            }

            return (
              <li
              ref={featuresRefs[k]}
              key={"feature-card-"+k}
              onClick={handleClick}
              className={classNames({
                active:   active
              })}
              >
                <CreationCard feature={feature}/>
              </li>
            )
          })
        }
      </ul>
      :
      <span>Pas de marqueurs</span>
    }

    </>

  )
}

export default FeaturesList
