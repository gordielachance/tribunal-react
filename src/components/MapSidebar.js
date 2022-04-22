import React, { useEffect,useState }  from "react";
import classNames from "classnames";

import { Link } from "react-router-dom";
import { Icon,Menu } from 'semantic-ui-react';
import * as turf from "@turf/turf";
import {getFeatureIndexByPostId,getHumanDistance} from "../Constants";
import MapSettings from "../components/MapSettings";

const MarkerList = props => {

  const items = (props.items || []);
  const currentIndex = props.currentIndex || 0;

  return(
    <>
    {
      items.length ?
      <ul id="marker-list">

        {
          items.map((feature,k) => {
            const active = currentIndex === k;
            let distance = props.center ? turf.distance([props.center.lng,props.center.lat], feature.geometry) : undefined;//km
            distance = (distance === 0) ? undefined : getHumanDistance(distance);
            return (
              <li
              key={k}
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
  const [section,setSection] = useState('markers');
  const [sortBy,setSortBy] = useState('date');

  const toggleActive = () => {
    setisActive(!isActive);
    setTimeout(() => {
      //console.log("sidebar toggled");
      //props.map.resize(); // fit to container
    }, 500);
  }

  const currentFeatureIndex = getFeatureIndexByPostId(props.features,props.activeFeatureId);

  const renderSection = section => {
    switch(section){
      case 'settings':
        return (
          <MapSettings
          features={props.features}
          sortBy={sortBy}
          />
        )
      break;
      default://markers
        return(
          <MarkerList
          center={props.center}
          items={props.features}
          currentIndex={currentFeatureIndex}
          onFeatureClick={props.onFeatureClick}
          sortBy={sortBy}
          />
        )
    }
  }

  return (
    <div
    className={classNames({
      sidebar:  true,
      active:   isActive
    })}
    >

      <div id="sidebar-container">

        <div id="sidebar-header">
          <div id="logo">
            <img src="https://www.tribunaldesprejuges.org/wordpress/wp-content/themes/tribunaldesprejuges/_inc/images/logo-tdp.png"/>
          </div>

          <Link to="/">Retour au menu</Link>
        </div>
        <div id="sidebar-content">
          <div id="map-header">
            <h3>NOM DE LA CARTE</h3>

            <Menu pointing secondary>
              <Menu.Item
                name='Marqueurs'
                active={section === 'markers'}
                onClick={e=>setSection('markers')}
              />
              <Menu.Item
                name='Options'
                active={section === 'settings'}
                onClick={e=>setSection('settings')}
              />
            </Menu>
          </div>

          {
            renderSection(section)
          }
          </div>
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
