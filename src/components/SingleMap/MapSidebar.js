import React, { useEffect,useState }  from "react";
import classNames from "classnames";
import { Link } from "react-router-dom";
import { Icon,Menu,Loader,Dimmer } from 'semantic-ui-react';

import {getUniqueMapFeatures} from "./MapFunctions";
import { useMap } from './MapContext';
import MapSettings from "./MapSettings";
import FeaturesList from "./FeaturesList";

const MapSidebar = (props) => {

  const [isActive, setisActive] = useState(true);
  const [section,setSection] = useState('features');
  const [sidebarFeatures,setSidebarFeatures] = useState();

  const [loading,setLoading] = useState(true);

  const {
    mapboxMap,
    mapHasInit,
    markersFilter,
  } = useMap();

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
          layers: ['annotations'],
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
    if (!mapHasInit) return;

    mapboxMap.once('idle',populateSidebarFeatures);//on init
    mapboxMap.on('moveend',populateSidebarFeatures);

  },[mapHasInit])

  //on sidebar features first init
  useEffect(()=>{
    if (!sidebarFeatures) return;
    setLoading(false);
  },[sidebarFeatures])

  //offset map to match sidebar
  useEffect(()=>{
    if (!mapHasInit) return;
    //https://docs.mapbox.com/mapbox-gl-js/example/offset-vanishing-point-with-padding/

    // 'id' is 'right' or 'left'. When run at start, this object looks like: '{left: 300}';
    // Use `map.easeTo()` with a padding option to adjust the map's center accounting for the position of sidebars.
    mapboxMap.easeTo({
      padding: {
        left:!isActive ? 0 : 300
      },
      duration: 1000 // In ms. This matches the CSS transition duration property.
    });
  },[isActive])

  //when filters are updated
  useEffect(()=>{
    if (mapboxMap === undefined) return;
    populateSidebarFeatures();
  },[markersFilter])

  return (
      <div
      className={classNames({
        sidebar:  true,
        active:   isActive,
        loading:  loading
      })}
      >
        <Dimmer.Dimmable dimmed={loading} id="sidebar-container">
          <Dimmer active={loading} inverted>
            <Loader />
          </Dimmer>
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
                  name='Légende'
                  active={section === 'settings'}
                  onClick={e=>setSection('settings')}
                >
                  <Icon name="setting"/>
                  Légende
                </Menu.Item>

              </Menu>
            </div>
            <div id="map-sections">
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
        </Dimmer.Dimmable>
        <div className="sidebar-toggle clickable" onClick={e=>{setisActive(!isActive)}} >
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
