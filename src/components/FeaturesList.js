import React, { useEffect,useState,useRef,createRef }  from "react";
import classNames from "classnames";

import { CreationCard } from "./CreationCard";
import {setFeatureDistance,getHumanDistance,getFeaturesTags} from "../Constants";
import { useApp } from '../AppContext';
import { useMap } from '../MapContext';

const FeaturesList = props => {

  const {
    mapData,
    mapboxMap,
    activeFeatureId,
    fitToFeature,
    setActiveFeatureId,
    setShowPopup,
    sortMarkerBy,
    markerTagsDisabled,
    markerFormatsDisabled,
    getHandleIdByAnnotationId,
    setCreationFeatureState,
    setPolygonFeatureState,
    getHandlesByAnnotationId
  } = useMap();

  const source = mapData?.sources[props.sourceId];

  const [mapCenter,setMapCenter] = useState();
  const [features,setFeatures] = useState();
  const [featuresRefs,setFeaturesRefs] = useState();

  const filterFeaturesByDisabledTags = (features,disabledTags) => {

    if (disabledTags.length !== 0){

      const allTags = getFeaturesTags(features);
      const enabledTags = allTags.filter(x => !disabledTags.includes(x));

      features = features.filter(feature =>{
        const featureTags = feature.properties.tag_slugs;
        const hasTags = featureTags.filter(x => enabledTags.includes(x));
        return (hasTags.length > 0)
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

  //scroll to list item

  const scrollToFeature = feature_id => {

    //using a feature ID, get its index in the filtered features array.
    const getListIndex = feature_id => {
      let index = (features || []).findIndex(feature => feature.properties.id === feature_id);
      return (index !== -1) ? index : undefined;
    }

    const index = getListIndex(feature_id);
    if (index === undefined) return;

    console.log("RFZ",featuresRefs);

    const ref = featuresRefs[index];
    console.log("!!!SCROLL TO FEATURE",{id:feature_id,index:index},ref);
    ref.current.scrollIntoView({ behavior: 'smooth'});
  }

  useEffect(()=>{

    if (mapboxMap===undefined) return;

    //on init
    setMapCenter([mapboxMap.getCenter().lng,mapboxMap.getCenter().lat]);

    //When the map is animated
    mapboxMap.on('moveend', (e) => {
      setMapCenter([mapboxMap.getCenter().lng,mapboxMap.getCenter().lat]);
    });

  },[mapboxMap])

  //scroll to the list item (if context is 'map')
  useEffect(()=>{
    const context = activeFeatureId?.context;
    const featureId = activeFeatureId?.id;
    if (featureId===undefined) return;
    if (context !== 'map') return;

    const featureSource = activeFeatureId?.source;

    const scrollAnnotation = ( (featureSource === 'annotationsHandles') && (props.sourceId === 'annotations') );
    const scrollCreation = ( (featureSource === 'creations') && (props.sourceId === 'creations') );

    if (!scrollAnnotation && !scrollCreation) return;

    scrollToFeature(featureId);
    //

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

  const gotoFeature = (source_id,feature_id) => {

    //center/zoom on feature
    fitToFeature(source_id,feature_id);

    //wait until the map movements stops,
    //so mapbox can handle the feature (it only consider features within the viewport)
    mapboxMap.once('idle', () => {

      switch(props.sourceId){

        case 'annotations':

          //target first available handle
          const handles = getHandlesByAnnotationId(feature_id);
          const firstHandle = handles[0] ?? undefined;
          feature_id = firstHandle?.properties.id;
          source_id = 'annotationsHandles';

          console.log("!!!ANNOTATION FIRST HANDLE:",feature_id,handles);
        break;
      }

      if (feature_id){
        setActiveFeatureId({
          source:source_id,
          id:feature_id,
          context:'sidebar'
        });
        setShowPopup(true);
      }

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
      (features || []).length ?
      <ul id="features-list" className="map-section">

        {
          features.map((feature,k) => {

            const sortValue = getSortByText(feature);

            const feature_id = feature.properties.id;
            const active = (activeFeatureId?.id === feature_id);

            const toggleHover = bool => {
              switch(props.sourceId){
                case 'creations':
                  setCreationFeatureState(feature,'hover',bool);
                break;
                case 'annotations':
                  setPolygonFeatureState(feature,'hover',bool);
                break;
              }
            }

            const handleClick = e => {
              gotoFeature(props.sourceId,feature_id);
            }

            return (
              <li
              ref={featuresRefs[k]}
              key={"feature-card-"+k}
              onMouseEnter={e=>toggleHover(true)}
              onMouseLeave={e=>toggleHover(false)}
              onClick={handleClick}
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
