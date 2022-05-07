import React, { useEffect,useState }  from "react";
import classNames from "classnames";

import { Link } from "react-router-dom";
import { Icon,Menu } from 'semantic-ui-react';

import MapSettings from "../components/MapSettings";
import MarkerList from "../components/MarkerList";
import { useApp } from '../AppContext';

const MapSidebar = (props) => {

  const [isActive, setisActive] = useState(props.active);
  const [mapTransition,setMapTransition] = useState();
  const [section,setSection] = useState('markers');
  const {mapboxMap} = useApp();

  const toggleSidebar = () => {
    setisActive(!isActive);
    setTimeout(() => {
      //console.log("sidebar toggled");
      //mapboxMap.resize(); // fit to container
    }, 500);
  }

  useEffect(()=>{
    if (mapboxMap===undefined) return;

    //When the map is animated
    mapboxMap.on('movestart', (e) => {
      setMapTransition(true);
    });

    mapboxMap.on('moveend', (e) => {
      setMapTransition(false);
    });


  },[mapboxMap])

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
            <Link to="/">
              <img src="https://www.tribunaldesprejuges.org/wordpress/wp-content/themes/tribunaldesprejuges/_inc/images/logo-tdp.png"/>
            </Link>
          </div>
          <Link to="/cartes">Retour aux cartes</Link>
        </div>
        <div id="sidebar-content">
          <div id="map-header">
            <h3>{props.title}</h3>

            <Menu pointing secondary>
              <Menu.Item
                name='Marqueurs'
                active={section === 'markers'}
                onClick={e=>setSection('markers')}
              />
              <Menu.Item
                name='Filtres'
                active={section === 'settings'}
                onClick={e=>setSection('settings')}
              />
            </Menu>
          </div>
          <div
          id="map-sections"
          className={classNames({
            mapTransition: mapTransition
          })}>
            {
              (section === 'settings') &&
              <MapSettings
              features={props.features}
              sortBy={props.sortMarkerBy}
              onSortBy={props.onSortBy}
              disabledTags={props.markerTagsDisabled}
              onDisableTags={props.onDisableTags}
              disabledFormats={props.markerFormatsDisabled}
              onDisableFormats={props.onDisableFormats}
              />
            }
            {
              (section === 'markers') &&
              <MarkerList
              features={props.features}
              onFeatureClick={props.onFeatureClick}
              disabledTags={props.markerTagsDisabled}
              sortBy={props.sortMarkerBy}
              />
            }
        </div>
      </div>
      </div>
      <div className="sidebar-toggle clickable" onClick={toggleSidebar} >
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
