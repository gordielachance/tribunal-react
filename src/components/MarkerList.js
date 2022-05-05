import React, { useEffect,useState }  from "react";
import classNames from "classnames";

import { FeatureCard } from "./FeatureCard";
import {setFeatureDistance,getHumanDistance} from "../Constants";
import { useApp } from '../AppContext';

const MarkerList = props => {
  const {map,selectedMarkerFeature} = useApp();
  const [features,setFeatures] = useState(props.features);
  const [sortedFeatures,setSortedFeatures] = useState();
  const [mapCenter,setMapCenter] = useState();

  useEffect(()=>{
    if (map===undefined) return;

    //When the map is animated
    map.on('moveend', (e) => {
      setMapCenter([map.getCenter().lng,map.getCenter().lat]);
    });

  },[map])

  //set features distance if a center is defined
  useEffect(()=>{

    console.log("MARKERS LIST - CENTER UPDATED",mapCenter);

    if(!mapCenter) return;

    //clone array; we don't want to alter the original data
    let features = JSON.parse(JSON.stringify(props.features || []));

    //add a distance attribute
    if (mapCenter){
      //add 'distance' prop
      features.forEach(feature => {
        setFeatureDistance(feature,mapCenter);
      });
    }

    setFeatures(features);

  },[mapCenter])

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
      <ul id="marker-list" className="map-section">

        {
          sortedFeatures.map((feature,k) => {

            const feature_id = feature.properties.unique_id;

            const active = (selectedMarkerFeature?.properties.unique_id === feature_id);
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
