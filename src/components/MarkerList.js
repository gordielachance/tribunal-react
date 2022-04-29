import React, { useEffect,useState }  from "react";
import classNames from "classnames";
import * as turf from "@turf/turf";

import { Link } from "react-router-dom";
import { Icon,Menu } from 'semantic-ui-react';
import { FeatureCard } from "./FeatureCard";
import {setFeatureDistance,getHumanDistance} from "../Constants";

const MarkerList = props => {

  const [features,setFeatures] = useState(props.features);
  const [sortedFeatures,setSortedFeatures] = useState();

  //set features distance if a center is defined
  useEffect(()=>{

    if(!props.mapCenter) return;

    //clone array; we don't want to alter the original data
    let features = JSON.parse(JSON.stringify(props.features || []));

    //add a distance attribute
    if (props.mapCenter){
      //add 'distance' prop
      features.forEach(feature => {
        setFeatureDistance(feature,props.mapCenter);
      });
    }

    setFeatures(features);

  },[props.mapCenter])

  //sort features
  useEffect(() => {

    if (features === undefined) return;

    let sorted = features;

    //sort markers
    switch(props.sortBy){
      case 'distance':
        //sort by distance
        sorted = features.sort((a, b) => {
          return a.properties.distance - b.properties.distance;
        });
      break;
      default://date
      break;
    }

    setSortedFeatures(sorted);

  },[features,props.sortBy]);

  //TOUFIX should not be updated when center changes; distance should be computed in parent ?

  const getSortByText = feature => {

    //sort markers
    switch(props.sortBy){
      case 'distance':
        return feature.properties.distance ? getHumanDistance(feature.properties.distance) : undefined;
      break;
      default://date
        return feature.properties.timestamp
      break;
    }

  }

  return(
    <>
    {
      (sortedFeatures || []).length ?
      <ul
        id="marker-list"
        className={classNames({
          'map-content':true,
          mapMoving: props.mapMoving
        })}
        >

        {
          sortedFeatures.map((feature,k) => {

            const feature_id = feature.properties.unique_id;

            const active = (props.feature_id === feature_id);
            return (
              <li
              key={"feature-card-"+k}
              onClick={e=>{props.onFeatureClick(feature_id)}}
              className={classNames({
                active:   active
              })}
              >
                <FeatureCard feature={feature}/>
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

export default MarkerList
