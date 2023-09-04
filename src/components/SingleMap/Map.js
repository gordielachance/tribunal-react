import React, { useEffect,useCallback }  from "react";
import mapboxgl from '!mapbox-gl'; // eslint-disable-line import/no-webpack-loader-syntax
import supercluster from 'supercluster';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';
import * as turf from "@turf/turf";
import { useNavigate,useParams } from 'react-router-dom';


import {MAPBOX_TOKEN,DEBUG,getFeaturePostUrl} from "../../Constants";
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
    mapCluster,
    setMapHasInit,
    setMapFeatureState,
    featuresFilter,
    mapFeatureCollection
  } = useMap();

  const initMap = map => {

    //init mapbox sources
    for (var sourceId in mapData.sources) {
      const sourceData = mapData.sources[sourceId];
      DEBUG && console.log("ADD SOURCE",sourceId,sourceData);
      map.addSource(sourceId,sourceData);
    }

    //init mapbox layers
    (mapData.layers || []).forEach(layer => {
      map.addLayer(layer);
      DEBUG && console.log("ADD LAYER",layer.id,layer);
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
      console.log("CLICKED FEAT",feature);
      navigate(getFeaturePostUrl(mapPostId,mapPostSlug,feature.source,feature.properties.id));
    });

    //zoom on cluster on click
    map.on('click', 'point-clusters', (e) => {
      const features = map.queryRenderedFeatures(e.point, { layers: ['point-clusters'] });
      if (features.length) {
        const clusterId = features[0].properties.cluster_id;
        const source = map.getSource('points'); // Replace 'your-source-id' with your source ID

        source.getClusterExpansionZoom(clusterId, (error, zoom) => {
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
      mapboxMap.current.easeTo({
        //center: [-75,43],
        center: urlFeature.geometry.coordinates
      })

    }

  },[mapHasInit,urlSourceId,urlFeatureId]);

  //main map init
  useEffect(()=>{
    if(mapData === undefined) return;
    if (!mapboxMap.current) {

      //update map center based on loaded feature
      const urlFeature = getUrlFeature();

      if (urlFeature){
        const featureCenter = urlFeature.geometry.coordinates;
        DEBUG && console.log("UPDATE MAP CENTER BASED ON FEATURE URL",featureCenter);
        mapData.map.center = featureCenter;
      }

      mapboxgl.accessToken = MAPBOX_TOKEN;
      mapboxMap.current = new mapboxgl.Map({
        ...mapData.map,
        container: mapContainerRef.current
      });

      mapCluster.current = new supercluster({
        radius: 40, // Adjust the clustering radius as needed
        maxZoom: 15, // Adjust the maximum zoom level
      });

      mapboxMap.current.on('load', () => initMap(mapboxMap.current) )
      mapboxMap.current.on('load', () => initMapFeatures(mapboxMap.current) )
      mapboxMap.current.once('idle',()=> setMapHasInit(true) )

    }
    console.log("INITIALIZING MAP WITH DATA",mapData.map);

    return () => mapboxMap.current.remove();

  }, [mapData]);

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
