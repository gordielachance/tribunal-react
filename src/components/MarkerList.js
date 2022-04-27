import React, { useEffect,useState }  from "react";
import classNames from "classnames";
import * as turf from "@turf/turf";

import { Link } from "react-router-dom";
import { Icon,Menu } from 'semantic-ui-react';
import {getHumanDistance,setFeatureDistance,sortFeaturesByDistance,getFeatureId} from "../Constants";

const MarkerList = props => {
  const map = props.map;
  const [features,setFeatures] = useState(props.features);
  const [sortedFeatures,setSortedFeatures] = useState(features);

  //update from prop
  useEffect(() => {

    if (props.features === undefined) return;

    console.log("LIST FEATURES",props.features);

    //clone array; we don't want to alter the original data
    const features = JSON.parse(JSON.stringify(props.features));

    //add a distance attribute
    if (props.center){
      //add 'distance' prop
      features.forEach(feature => {
        setFeatureDistance(feature,props.center);
      });
    }

    setFeatures(features);

  },[props.features,props.center]);

  useEffect(() => {

    if (features === undefined) return;

    let sorted = features;

    //sort markers
    switch(props.sortBy){
      case 'distance':
        sorted = sortFeaturesByDistance(sorted,props.center);
      break;
      default://date
      break;
    }

    setSortedFeatures(sorted);

  },[features,props.sortBy]);

  //TOUFIX should not be updated when props.center changes; distance should be computed in parent ?

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
      <ul id="marker-list">

        {
          sortedFeatures.map((feature,k) => {

            const feature_id = getFeatureId(feature);

            const active = (props.feature_id === feature_id);
            return (
              <li
              key={k}
              onClick={e=>{props.onFeatureClick(feature_id)}}
              className={classNames({
                active:   active
              })}
              >
                <span>
                  {feature.properties.title}
                </span>
                <span className="sortByText">
                  {getSortByText(feature)}
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

export default MarkerList
