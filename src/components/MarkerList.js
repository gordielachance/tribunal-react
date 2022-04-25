import React, { useEffect,useState }  from "react";
import classNames from "classnames";
import * as turf from "@turf/turf";

import { Link } from "react-router-dom";
import { Icon,Menu } from 'semantic-ui-react';
import {getHumanDistance,sortFeaturesByDistance} from "../Constants";

const MarkerList = props => {

  const items = props.items || [];
  const [sortedItems,setSortedItems] = useState(items);

  const currentIndex = props.currentIndex || 0;

  useEffect(() => {

    let sorted = items;

    //sort markers
    switch(props.sortBy){
      case 'distance':
        if (props.center){
          console.log("SORT BY DISTANCE FROM",props.center);
          sorted = sortFeaturesByDistance(props.center,sorted);
        }

      break;
      default://date
      break;
    }

    setSortedItems(sorted);

  },[props.sortBy,props.center]);

  useEffect(() => {
    console.log("SORTED",sortedItems);
  },[sortedItems]);



  console.log("MARKERS SORT BY",props.sortBy);

  return(
    <>
    {
      sortedItems.length ?
      <ul id="marker-list">

        {
          sortedItems.map((feature,k) => {
            const active = currentIndex === k;
            const humanDistance = feature.properties.distance ? getHumanDistance(feature.properties.distance) : undefined;
            return (
              <li
              key={k}
              onClick={e=>{props.onFeatureClick(feature.properties.post_id)}}
              className={classNames({
                active:   active
              })}
              >
                <span>
                  {humanDistance}
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

export default MarkerList
