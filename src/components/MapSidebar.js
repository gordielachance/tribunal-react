import React, { useRef, useEffect,useState }  from "react";
import classNames from "classnames";

import { Link } from "react-router-dom";
import { Icon,Label,Checkbox,Accordion,Button } from 'semantic-ui-react';
import * as turf from "@turf/turf";
import {getMarkerUrl,getFeatureByPostId,getFeatureIndexByPostId,getHumanDistance} from "../Constants";
import { MarkerPopup } from "../components/MarkerPopup";

const MarkerList = props => {

  const items = props.items || [];
  const currentIndex = props.currentIndex || 0;

  const handleClick = (e, titleProps) => {
    const { index } = titleProps;
    const newIndex = currentIndex === index ? -1 : index;
    const feature = items[newIndex];

    if (typeof props.onMarkerZoom === 'function'){
      props.onMarkerZoom(feature.properties.post_id);
    }

  }

  return(
    <>
    {
      items.length ?
      <ul id="marker-list">

        {
          (items || []).map((feature,k) => {
            const active = currentIndex === k;
            let distance = props.center ? turf.distance([props.center.lng,props.center.lat], feature.geometry) : undefined;//km
            distance = (distance === 0) ? undefined : getHumanDistance(distance);
            return (
              <li
              onClick={e=>{props.onFeatureClick(feature.properties.post_id)}}
              className={classNames({
                active:   active
              })}
              >
                <span>
                  {distance}
                </span>
                <span>
                  {feature.properties.title}
                </span>
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

const MapSidebar = (props) => {

  const [isActive, setisActive] = useState(props.active);
  const [orderByDistance,setOrderByDistance] = useState(true);
  const [accordionIndex,setAccordionIndex] = useState(0);

  const getFeatureTerms = (feature,taxonomy) => {
    let terms = feature.properties?.terms;

    if (taxonomy){
      terms = terms.filter(term=>{
        return (term.taxonomy === taxonomy)
      })
    }

    return terms;

  }

  const getFeaturesTerms = (features,taxonomy) => {

    let collection = [];

    (features || []).forEach(feature => {

      const terms = getFeatureTerms(feature);

      terms.forEach(term => {

        if ( taxonomy && (term.taxonomy !== taxonomy) ){
          return;//continue
        }

        const key = term.slug;

        //append term to collection
        if ( !collection.hasOwnProperty(key) ){
          collection[key] = {
            ...term,
            post_id:[]
          }
        }

        //append feature's 'post_id'
        collection[key] = {
          ...term,
          post_id:collection[key].post_id.concat(feature.properties.post_id)
        }
      })
    })

    //as array
    return Object.values(collection);

  }

  const layerList = getFeaturesTerms(props.features,'geoposts_layergroup');
  const [disabledLayers,setDisabledLayers] = useState([]);

  const toggleLayer = term => {

    const newDisabledLayers = [...disabledLayers];
    const index = newDisabledLayers.indexOf(term.slug);

    if (index > -1) {//exists in array
      newDisabledLayers.splice(index, 1);
    }else{
      newDisabledLayers.push(term.slug);
    }

    setDisabledLayers(newDisabledLayers);
  }

  const isLayerDisabled = term => {
    return disabledLayers.includes(term.slug);
  }

  const handleAccordionClick = (e, titleProps) => {
    const { index } = titleProps;
    const newIndex = accordionIndex === index ? -1 : index

    setAccordionIndex(newIndex)
  }

  const toggleActive = () => {
    setisActive(!isActive);
    setTimeout(() => {
      //console.log("sidebar toggled");
      //props.map.resize(); // fit to container
    }, 500);
  }

  const isFeatureDisplayedOnMap = feature => {

    const pt = turf.point(feature.geometry.coordinates);

    const bounds = props.bounds;
    const poly = turf.polygon([
      [
        [bounds.getNorthWest().lng, bounds.getNorthWest().lat],
        [bounds.getNorthEast().lng, bounds.getNorthEast().lat],
        [bounds.getSouthEast().lng, bounds.getSouthEast().lat],
        [bounds.getSouthWest().lng, bounds.getSouthWest().lat],
        [bounds.getNorthWest().lng, bounds.getNorthWest().lat]
      ]
    ]);

    //
    const bool = turf.booleanPointInPolygon(feature, poly);

    //console.log("PT IN POLY ?",bool,feature.properties.post_id,pt,poly);
    return bool;

  }

  const currentFeatureIndex = getFeatureIndexByPostId(props.features,props.activeFeatureId);

  useEffect(() => {
    if (typeof props.onDisableLayers !== 'function') return;
    props.onDisableLayers(disabledLayers);
  },[disabledLayers]);

  return (
    <div
    className={classNames({
      sidebar:  true,
      active:   isActive
    })}
    >
      <div className="sidebar-content">
        <Accordion>
          <Accordion.Title
            active={accordionIndex === 0}
            index={0}
            onClick={handleAccordionClick}
          >
          <Icon name='dropdown' />
          Marqueurs
          </Accordion.Title>
          <Accordion.Content active={accordionIndex === 0}>
            <Checkbox
            label='Trier par distance'
            checked={orderByDistance}
            onClick={e=>{setOrderByDistance(!orderByDistance)}}
            toggle/>
            <MarkerList
            center={props.center}
            items={props.features}
            currentIndex={currentFeatureIndex}
            onFeatureClick={props.onFeatureClick}
            />
          </Accordion.Content>
          <Accordion.Title
            active={accordionIndex === 1}
            index={1}
            onClick={handleAccordionClick}
          >
          <Icon name='dropdown' />
          Calques
          </Accordion.Title>
          <Accordion.Content active={accordionIndex === 1}>
            <ul id="layer-list">
            {
              (layerList || []).map((term,k) => {
                return (
                  <li
                  key={k}
                  >
                    <Checkbox
                    label={<label>{term.name}<Label>{term.post_id.length}</Label></label>}
                    onClick={(e)=>toggleLayer(term)}
                    checked={!isLayerDisabled(term)}
                    toggle/>
                  </li>
                )
              })
            }
            </ul>
          </Accordion.Content>
        </Accordion>

      </div>
      <div className="sidebar-toggle clickable" onClick={toggleActive} >
        <span>
        {
          isActive ? <Icon name='chevron left' /> : <Icon name='chevron right' />
        }

        </span>
      </div>
    </div>
  );
}

export default MapSidebar
