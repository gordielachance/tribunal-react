import React, { useEffect,useState }  from "react";
import classNames from "classnames";

import { Link } from "react-router-dom";
import { Icon,Menu } from 'semantic-ui-react';

import MapSettings from "../components/MapSettings";
import FeaturesList from "../components/FeaturesList";
import { useMap } from '../MapContext';

const MapSidebar = (props) => {

  const [isActive, setisActive] = useState(props.active);
  const [mapTransition,setMapTransition] = useState();
  const [section,setSection] = useState('creations');
  const {mapData,mapboxMap,activeFeatureId} = useMap();
  const annotationsCount = (mapData?.sources.annotations?.data.features || []).length;
  const creationsCount = (mapData?.sources.creations?.data.features || []).length;

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

  //switch section when a feature is clicked
  useEffect(()=>{
    const sourceId = activeFeatureId?.source;

    switch(sourceId){
      case 'creations':
        setSection('creations');
      break;
      case 'annotationsHandles':
        setSection('annotations');
      break;
    }

  },[activeFeatureId?.source])

  return (
    <div
    className={classNames({
      sidebar:  true,
      active:   isActive
    })}
    >

      <div id="sidebar-container">
        <div id="sidebar-header">

          <Link to="/cartes">Retour aux cartes</Link>
        </div>
        <div id="sidebar-content">
          <div id="map-header">
            <h3>{props.title}</h3>

            <Menu id="map-menu" pointing secondary>
              {
                (creationsCount > 0) &&
                <Menu.Item
                  id="map-menu-creations"
                  name='Créations'
                  active={section === 'creations'}
                  onClick={e=>setSection('creations')}
                >
                  <Icon name="circle"/>
                  Créations
                </Menu.Item>
              }
              {
                (annotationsCount > 0) &&
                <Menu.Item
                  id="map-menu-annotations"
                  name='Annotations'
                  active={section === 'annotations'}
                  onClick={e=>setSection('annotations')}
                >
                <Icon name="circle"/>
                Annotations
              </Menu.Item>
              }

              <Menu.Item
                id="map-menu-settings"
                name='Filtres'
                active={section === 'settings'}
                onClick={e=>setSection('settings')}
              >
                <Icon name="setting"/>
              </Menu.Item>

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
              sortBy={props.sortMarkerBy}
              onSortBy={props.onSortBy}
              disabledFormats={props.markerFormatsDisabled}
              onDisableFormats={props.onDisableFormats}
              />
            }
            {
              (section === 'creations') &&
              <FeaturesList
              sourceId='creations'
              disabledTags={props.markerTagsDisabled}
              sortBy={props.sortMarkerBy}
              />
            }
            {
              (section === 'annotations') &&
              <FeaturesList
              sourceId='annotations'
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
