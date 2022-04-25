import React, { useEffect,useState }  from "react";
import classNames from "classnames";

import { Link } from "react-router-dom";
import { Icon,Menu } from 'semantic-ui-react';

import {getFeatureIndexByPostId} from "../Constants";
import MapSettings from "../components/MapSettings";
import MarkerList from "../components/MarkerList";

const MapSidebar = (props) => {

  const [isActive, setisActive] = useState(props.active);
  const [section,setSection] = useState('markers');

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
          sortBy={props.sortMarkerBy}
          onSortBy={props.onSortBy}
          disabledTags={props.markerTagsDisabled}
          onDisableTags={props.onDisableTags}
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
          disabledTags={props.markerTagsDisabled}
          sortBy={props.sortMarkerBy}
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
