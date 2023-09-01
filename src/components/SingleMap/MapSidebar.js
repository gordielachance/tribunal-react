import React, { useEffect,useState }  from "react";
import classNames from "classnames";
import { Icon,Menu,Loader,Dimmer } from 'semantic-ui-react';

import { useApp } from '../../AppContext';
import { useMap } from './MapContext';
import MapSettings from "./MapSettings";
import FeaturesList from "./FeaturesList";
import {TdpLogoLink} from "./MapPost";
import PageMenu from "../PageMenu";
import './MapSidebar.scss';

import {DEBUG} from "../../Constants";


const MapSidebar = (props) => {

  const {mobileScreen} = useApp();

  const [isActive, setisActive] = useState();

  const [section,setSection] = useState('index');

  const [loading,setLoading] = useState(true);

  const {
    mapboxMap,
    mapHasInit,
    mapRenderedFeatures,
  } = useMap();

  //open sidebar on init ?
  useEffect(()=>{
    if (mobileScreen === undefined) return;
    if (isActive !== undefined) return; //ignore once have been defined
    setisActive(!mobileScreen);
  },[mobileScreen])

  //load features on init
  //on sidebar features first init
  useEffect(()=>{
    if (!mapRenderedFeatures) return;
    setLoading(false);
  },[mapRenderedFeatures]);

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


  return (
      <div
      className={classNames({
        sidebar:  true,
        active:   isActive,
        isLoading:  loading,
      })}
      >
        <Dimmer.Dimmable dimmed={loading} id="sidebar-container">
          <Dimmer active={loading} inverted>
            <Loader />
          </Dimmer>
          <div id="sidebar-header">
            <TdpLogoLink/>
            <PageMenu/>
          </div>
          <div id="sidebar-content">
            <div id="map-header">
              <h3>{props.title}</h3>

              <Menu id="map-menu" pointing secondary>
                <Menu.Item
                    id="map-menu-index"
                    name='Index'
                    active={section === 'index'}
                    onClick={e=>setSection('index')}
                  >
                  <Icon name="circle"/>
                  Index
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
            <div id="map-sections">
              {
                (section === 'settings') &&
                <MapSettings
                sortBy={props.sortMarkerBy}
                onSortBy={props.onSortBy}
                disabledFormats={props.disabledFormats}
                onDisableFormats={props.onDisableFormats}
                />
              }
              {
                (section === 'index') &&
                <FeaturesList
                disabledTags={props.disabledTerms}
                sortBy={props.sortMarkerBy}
                />
              }
            </div>
          </div>
        </Dimmer.Dimmable>
        <div className="sidebar-toggle clickable" onClick={e=>{setisActive(!isActive)}}>
          <span>
          {
            isActive ? <Icon name='chevron left' /> : <Icon name='chevron right'/>
          }
          </span>
        </div>
    </div>

  );
}

export default MapSidebar
