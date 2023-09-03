import React, { useEffect,useCallback }  from "react";
import mapboxgl from '!mapbox-gl'; // eslint-disable-line import/no-webpack-loader-syntax
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';
import * as turf from "@turf/turf";
import { useNavigate,useParams } from 'react-router-dom';


import {MAPBOX_TOKEN,DEBUG,getFeatureUrl} from "../../Constants";
import {getUniqueMapFeatures} from "./MapFunctions";
import { useMap } from './MapContext';
import FeaturePopup from "./FeaturePopup";
import './Map.scss';

const Map = (props) => {

  const navigate = useNavigate();
  const {mapPostId,mapPostSlug,urlSourceId,urlFeatureId} = useParams();

  const {
    mapHasInit,
    setActiveFeature,
    activeFeature,
    mapContainerRef,
    mapData,
    mapboxMap,
    setMapboxMap,
    setMapHasInit,
    setMapFeatureState,
    featuresFilter,
    updateRenderedFeatures
  } = useMap();

  const initializeMap = data => {

    DEBUG && console.log("INIT MAPBOX MAP",data.map);

    const urlFeature = getUrlFeature();

    if (urlFeature){
      const featureCenter = urlFeature.geometry.coordinates;
      DEBUG && console.log("INIT MAPBOX MAP ON FEATURE CENTER",featureCenter);
      data.map.center = featureCenter;
    }

    mapboxgl.accessToken = MAPBOX_TOKEN;
    const map = new mapboxgl.Map({
      ...data.map,
      container: mapContainerRef.current
    });

    setMapboxMap(map);
  }

  const initMapListeners = map => {

    const initMapFeaturesListeners = () => {

      let hoveredFeature = undefined;

      //Update cursors IN
      map.on('mousemove',['points'], e => {
        // Change the cursor style as a UI indicator.
        map.getCanvas().style.cursor = 'pointer';

        //Toggle 'hover'
        hoveredFeature = e.features[0];//first found feature.
        if(hoveredFeature){
          setMapFeatureState(hoveredFeature,'hover',true);
        }

      });

      //Update cursors OUT
      map.on('mouseleave',['points'], e => {
        map.getCanvas().style.cursor = '';
        //Toggle 'hover'
        if(hoveredFeature){
          setMapFeatureState(hoveredFeature,'hover',false);
        }
      });

      //open (add) popup when clicking point
      map.on('click',['points'], e => {
        if (e.features.length === 0) return;
        const feature = e.features[0];
        navigate(getFeatureUrl(mapPostId,mapPostSlug,feature.properties.source,feature.properties.id));
      });

    }

    initMapFeaturesListeners();

  }

  const getUrlFeature = useCallback(() => {

    if (!mapData) return;
    if (urlSourceId === undefined) return;
    if (urlFeatureId === undefined) return;

    const sources = mapData?.sources || {};
    const source = sources[urlSourceId];
    const features = source?.data.features || [];

    return features.find(feature => feature.properties.id === parseInt(urlFeatureId));

  },[mapData,urlSourceId,urlFeatureId])

  //set active marker from URL
  useEffect(()=>{

    if (!mapHasInit) return;


    const urlFeature = getUrlFeature();
    setActiveFeature(urlFeature);

    if (urlFeature){

      //center on the marker since we need to have it in the viewport
      mapboxMap.easeTo({
        //center: [-75,43],
        center: urlFeature.geometry.coordinates
      })

    }

  },[mapHasInit,urlSourceId,urlFeatureId]);

  //on data init
  useEffect(() => {
    if (mapData === undefined) return;
    initializeMap(mapData);
  },[mapData]);

  //on map init
  useEffect(() => {

    if (mapboxMap !== undefined){

      if(mapData !== undefined){
        mapboxMap.on('load', () => {

          //init mapbox sources
          for (var sourceId in mapData.sources) {
            const sourceData = mapData.sources[sourceId];
            DEBUG && console.log("ADD SOURCE",sourceId,sourceData);
            mapboxMap.addSource(sourceId,sourceData);
          }

          //init mapbox layers
          (mapData.layers || []).forEach(layer => {
            mapboxMap.addLayer(layer);
            DEBUG && console.log("ADD LAYER",layer.id,layer);
          })

          //list all layers
          DEBUG && console.log("ALL MAP LAYERS INITIALIZED",mapboxMap.getStyle().layers.length);

          mapboxMap.resize(); // fit to container

          // Add search
          mapboxMap.addControl(
            new MapboxGeocoder({
              accessToken: MAPBOX_TOKEN,
              mapboxgl: mapboxgl
            })
          );

          // Add navigation control (the +/- zoom buttons)
          mapboxMap.addControl(new mapboxgl.NavigationControl(), 'top-right');

          initMapListeners(mapboxMap);

          mapboxMap.once('idle',(e)=>{
            setMapHasInit(true);
          })

        });
      }

      mapboxMap.on('moveend', (e) => {

        console.log({
          'center':[mapboxMap.getCenter().lng.toFixed(4),mapboxMap.getCenter().lat.toFixed(4)],
          'zoom':mapboxMap.getZoom().toFixed(2),
          'bounds':mapboxMap.getBounds(),
        })
      });

      //when a specific source has been loaded
      mapboxMap.once('sourcedata', (e) => {
        if (e.sourceId !== 'markers') return;
        if (!e.isSourceLoaded) return;
        console.log("SOURCE DATA LOADED",e.source);
        const sourceObject = mapboxMap.getSource('markers');
        console.log("RESOURCE YO",sourceObject);
        var features = mapboxMap.querySourceFeatures('markers');
        console.log("FEATURES YO",features);
      });

      mapboxMap.on('idle', updateRenderedFeatures);

    }

    // Clean up on unmount
    return () => {
      if (mapboxMap){
        mapboxMap.off('idle', updateRenderedFeatures);
        mapboxMap.remove();
      }
    }

  },[mapboxMap]);

  return (
    <div id="map-container">
      <FeaturePopup/>
      <div
      id="map"
      ref={mapContainerRef}
      />
    </div>
  );
}

export default Map
