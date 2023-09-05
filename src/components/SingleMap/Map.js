import React, { useEffect,useCallback }  from "react";
import mapboxgl from '!mapbox-gl'; // eslint-disable-line import/no-webpack-loader-syntax
import Supercluster from 'supercluster';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';
import * as turf from "@turf/turf";
import { useNavigate,useParams } from 'react-router-dom';


import {MAPBOX_TOKEN,DEBUG} from "../../Constants";
import {getUniqueMapFeatures} from "./MapFunctions";
import { useMap } from './MapContext';
import FeaturePopup from "./FeaturePopup";
import './Map.scss';

const Map = (props) => {

  const navigate = useNavigate();
  const {mapPostId,mapPostSlug,urlItemType,urlItemId} = useParams();

  const {
    mapHasInit,
    setActiveFeature,
    activeFeature,
    mapContainerRef,
    mapData,
    mapboxMap,
    mapCluster,
    setMapHasInit,
    setMapFeatureState,
    featuresFilter,
    mapFeatureCollection,
    getPointUrl
  } = useMap();

  const initMap = map => {

    //init mapbox sources
    for (var sourceId in mapData.sources) {
      const sourceData = mapData.sources[sourceId];
      //DEBUG && console.log("ADD SOURCE",sourceId,sourceData);
      map.addSource(sourceId,sourceData);
    }

    //init mapbox layers
    (mapData.layers || []).forEach(layer => {
      map.addLayer(layer);
      //DEBUG && console.log("ADD LAYER",layer.id,layer);
    })

    // fit to container
    map.resize();

    // Add search
    map.addControl(
      new MapboxGeocoder({
        accessToken: MAPBOX_TOKEN,
        mapboxgl: mapboxgl
      })
    );

    // Add navigation control (the +/- zoom buttons)
    map.addControl(new mapboxgl.NavigationControl(), 'top-right');

  }

  const initMapFeatures = map => {

    let hoveredFeature = undefined;

    //Update cursors IN
    map.on('mousemove',['points'], e => {
      // Change the cursor style as a UI indicator.
      map.getCanvas().style.cursor = 'pointer';

      //Toggle 'hover'
      hoveredFeature = e.features[0];//first found feature.
      if(hoveredFeature){
        setMapFeatureState('points',hoveredFeature.id,'hover',true);
      }

    });

    //Update cursors OUT
    map.on('mouseleave',['points'], e => {
      map.getCanvas().style.cursor = '';
      //Toggle 'hover'
      if(hoveredFeature){
        setMapFeatureState('points',hoveredFeature.id,'hover',false);
      }
    });

    //open (add) popup when clicking point
    map.on('click',['points'], e => {
      if (e.features.length === 0) return;
      const feature = e.features[0];
      navigate(getPointUrl(feature.properties.id));
    });

    //zoom on cluster on click
    map.on('click', 'pointClusters', (e) => {
      const features = map.queryRenderedFeatures(e.point, { layers: ['pointClusters'] });
      if (features.length) {
        const clusterId = features[0].properties.cluster_id;
        const clusterSource = map.getSource('points');

        //zoom on cluster
        clusterSource.getClusterExpansionZoom(clusterId, (error, zoom) => {
          if (error) return;

          // Get the center coordinates of the clicked cluster
          const coordinates = features[0].geometry.coordinates;

          // Change the map's center and zoom to zoom in on the cluster
          map.easeTo({
            center: coordinates,
            zoom: zoom + 1, // You can adjust this value for the desired zoom level
          });
        });
      }
    });

  }

  //set active feature from current URL
  useEffect(()=>{

    if (!mapHasInit) return;

    const getUrlFeature = (type,id) => {
      id = parseInt(id);
      switch(type){
        case 'points':
          return mapFeatureCollection()
            .find(feature => feature.properties.id === id);
        break;
        case 'posts':
          return mapFeatureCollection()
            .find(feature => feature.properties.post_id === id);
        break;
      }
    }

    const urlFeature = getUrlFeature(urlItemType,urlItemId)

    setActiveFeature(urlFeature);

  },[mapHasInit,urlItemType,urlItemId]);

  //main map init
  useEffect(()=>{
    if(mapData === undefined) return;
    if (!mapboxMap.current) {

      //update map center based on loaded feature
      if (activeFeature){
        const featureCenter = activeFeature.geometry.coordinates;
        DEBUG && console.log("UPDATE MAP CENTER BASED ON FEATURE URL",featureCenter);
        mapData.map.center = featureCenter;
      }

      mapboxgl.accessToken = MAPBOX_TOKEN;
      mapboxMap.current = new mapboxgl.Map({
        ...mapData.map,
        container: mapContainerRef.current
      });

      // Initialize supercluster
      mapCluster.current = new Supercluster({
        radius: 40, // Adjust the clustering radius as needed
        maxZoom: 15, // Adjust the maximum zoom level
      })

      mapboxMap.current.on('load', () => initMap(mapboxMap.current) )
      mapboxMap.current.on('load', () => initMapFeatures(mapboxMap.current) )
      mapboxMap.current.once('idle',()=> setMapHasInit(true) )


    }
    console.log("INITIALIZING MAP WITH DATA",mapData.map);

    return () => mapboxMap.current.remove();

  }, [mapData]);

  //center on the active feature
  useEffect(()=>{
    if (!mapboxMap.current) return;
    if (activeFeature === undefined) return;

    mapboxMap.current.easeTo({
      //center: [-75,43],
      center: activeFeature.geometry.coordinates
    })

  },[activeFeature])

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
