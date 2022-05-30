import React, { useEffect,useState }  from "react";
import classNames from "classnames";

import {getUniqueMapFeatures} from "../Constants";

import { Link } from "react-router-dom";
import { Icon,Menu } from 'semantic-ui-react';

import MapSettings from "../components/MapSettings";
import FeaturesList from "../components/FeaturesList";
import { useMap } from '../MapContext';

const MapSidebar = (props) => {

  const [isActive, setisActive] = useState(false);
  const [mapTransition,setMapTransition] = useState();
  const [section,setSection] = useState('features');
  const [sidebarFeatures,setSidebarFeatures] = useState();

  const {
    mapData,
    mapboxMap,
    mapHasInit,
    activeFeatureId,
    getFeatureById,
    getFeatureSourceKey,
    markersFilter,
  } = useMap();

  const annotationsCount = (mapData?.sources.annotationsPolygons?.data.features || []).length;
  const creationsCount = (mapData?.sources.creations?.data.features || []).length;

  const toggleSidebar = (bool) => {

    if (bool === undefined){
      bool = !isActive;
    }

    setisActive(bool);

    //https://docs.mapbox.com/mapbox-gl-js/example/offset-vanishing-point-with-padding/
    const collapsed = !bool;
    // 'id' is 'right' or 'left'. When run at start, this object looks like: '{left: 300}';
    // Use `map.easeTo()` with a padding option to adjust the map's center accounting for the position of sidebars.
    mapboxMap.easeTo({
      padding: {
        left:collapsed ? 0 : 300
      },
      duration: 1000 // In ms. This matches the CSS transition duration property.
    });

  }

  const populateSidebarFeatures = e => {
    //get visible features on map for use in the sidebar

    const getFeatures = () => {

      const getVisibleCreationFeatures = () => {
        let features = mapboxMap.queryRenderedFeatures({
          layers: ['creations'],
          filter: markersFilter
        }) || [];
        return getUniqueMapFeatures(features);
      }

      const getVisibleAnnotationFeatures = () => {
        let features = mapboxMap.queryRenderedFeatures({
          layers: ['annotationsHandles'],
          filter: markersFilter
        }) || [];
        return getUniqueMapFeatures(features);
      }

      const creationFeatures = getVisibleCreationFeatures();
      const annotationFeatures = getVisibleAnnotationFeatures();

      return creationFeatures.concat(annotationFeatures);
    }

    const features = getFeatures();
    setSidebarFeatures(features);
  }

  useEffect(()=>{
    if (mapboxMap===undefined) return;

    toggleSidebar(true);

    //When the map is animated
    mapboxMap.on('movestart', (e) => {
      setMapTransition(true);
    });

    mapboxMap.on('moveend', (e) => {
      setMapTransition(false);
    });

    mapboxMap.once('idle',populateSidebarFeatures);//on init
    mapboxMap.on('moveend',populateSidebarFeatures);

  },[mapHasInit])

  //when filters are updated
  useEffect(()=>{
    if (mapboxMap === undefined) return;
    populateSidebarFeatures();
  },[markersFilter])

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
      <div className="sidebar-toggle clickable" onClick={e=>{toggleSidebar()}} >
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
