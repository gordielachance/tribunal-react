import React, { useEffect,useState }  from "react";
import classNames from "classnames";

import {getUniqueMapFeatures} from "../Constants";

import { Link } from "react-router-dom";
import { Icon,Menu } from 'semantic-ui-react';

import MapSettings from "../components/MapSettings";
import FeaturesList from "../components/FeaturesList";
import { useMap } from '../MapContext';

const MapSidebar = (props) => {

  const [isActive, setisActive] = useState(props.active);
  const [mapTransition,setMapTransition] = useState();
  const [section,setSection] = useState('features');
  const [sidebarFeatures,setSidebarFeatures] = useState();

  const {
    mapData,
    mapboxMap,
    activeFeatureId,
    getFeatureById,
    getFeatureSourceKey,
  } = useMap();

  const annotationsCount = (mapData?.sources.annotationsPolygons?.data.features || []).length;
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

    const populateSidebarFeatures = e => {
      //get visible features on map for use in the sidebar

      const getFeatures = () => {

        const getVisibleCreationFeatures = () => {
          let features = mapboxMap.queryRenderedFeatures({ layers: ['creations'] }) || [];
          return getUniqueMapFeatures(features);
        }

        const getVisibleAnnotationFeatures = () => {
          let features = mapboxMap.queryRenderedFeatures({ layers: ['annotationsFill'] }) || [];
          return getUniqueMapFeatures(features);
        }

    		const creationFeatures = getVisibleCreationFeatures();
    		const annotationFeatures = getVisibleAnnotationFeatures();

    		return creationFeatures.concat(annotationFeatures);
    	}

      const features = getFeatures();
      setSidebarFeatures(features);
    }

    mapboxMap.once('idle',populateSidebarFeatures);//on init
    mapboxMap.on('moveend',populateSidebarFeatures);


  },[mapboxMap])

  useEffect(()=>{
    console.log("SIDEBAR FEATURES",(sidebarFeatures || []).length);
  },[sidebarFeatures]);

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

                <Menu.Item
                  id="map-menu-features"
                  name='Features'
                  active={section === 'features'}
                  onClick={e=>setSection('features')}
                >
                <Icon name="circle"/>
                Liste
              </Menu.Item>

              <Menu.Item
                id="map-menu-settings"
                name='Filtres'
                active={section === 'settings'}
                onClick={e=>setSection('settings')}
              >
                <Icon name="setting"/>
                Filtres
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
              (section === 'features') &&
              <FeaturesList
              features={sidebarFeatures}
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
