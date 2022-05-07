import React, { useEffect,useState }  from "react";
import mapboxgl from 'mapbox-gl';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';

import {MAPBOX_TOKEN,DEBUG} from "./../Constants";

import MapMarkerPopup from "./MapMarkerPopup";
import MapDrawingPopup from "./MapDrawingPopup";

import './Map.scss';
import * as turf from "@turf/turf";
import { useApp } from '../AppContext';


const Map = (props) => {

  const {mapContainerRef,mapData,mapboxMap,setMapboxMap,setSelectedMarkerFeature,setPopupMarkerFeature,setPopupDrawingFeatureId,togglePolygon,togglePolygonHandle,popupDrawingFeatureId,getPolygonByHandleFeature} = useApp();

  const initializeMap = data => {

    console.log("INIT MAPBOX MAP",data);

    mapboxgl.accessToken = MAPBOX_TOKEN;
    const map = new mapboxgl.Map({
      ...data.map,
      center: [4.3779,50.7786],
      container: mapContainerRef.current
    });

    setMapboxMap(map);



  }

  const initMapListeners = map => {

    const initMapMarkersListeners = () => {

      const layerName = 'markers';
      let selectedFeatureId = undefined;

      //Update cursors IN
      map.on('mouseenter',layerName, e => {
        // Change the cursor style as a UI indicator.
        map.getCanvas().style.cursor = 'pointer';
      });

      //Update cursors OUT
      map.on('mouseleave',layerName, e => {
        map.getCanvas().style.cursor = '';
      });

      //set 'selected'
      map.on('click',layerName,e=>{

        if (e.features.length > 0) {

          //unset previous
          if (selectedFeatureId) {
            map.setFeatureState(
              { source: 'markers', id: selectedFeatureId },
              { selected: false }
            );
            selectedFeatureId = undefined;
          }

          //set current

          // Use the first found feature.
          const selectedFeature = e.features[0];


          if (selectedFeature){

            selectedFeatureId = selectedFeature.id;

            map.setFeatureState(
              { source: 'markers', id: selectedFeatureId },
              { selected: true }
            );

          }
        }


      })

      //open (add) popup when clicking marker
      map.on('click',layerName, e => {

        if (e.features.length === 0) return;

        //clicked marker
        const mapFeature = e.features[0];
        const sourceCollection = mapData?.sources.markers.data.features;
        const sourceFeature = (sourceCollection || []).find(feature => feature.properties.unique_id === mapFeature.id)

        setSelectedMarkerFeature(sourceFeature);
        setPopupMarkerFeature(sourceFeature);

      });
    }

    const initMapPolygonsListeners = () => {

      const handlesLayerName = 'polygonHandles';
      const polygonsLayerName = 'drawingPolygonsFill';


      //Update cursors IN
      map.on('mouseenter',handlesLayerName, e => {
        // Change the cursor style as a UI indicator.
        map.getCanvas().style.cursor = 'pointer';
      });

      //Update cursors OUT
      map.on('mouseleave',handlesLayerName, e => {
        map.getCanvas().style.cursor = '';
      });

      // When the user clicks a polygon handle
      map.on('click',handlesLayerName, (e) => {
        if (e.features.length > 0) {

          //Get clicked handle
          const mapPolygonHandle = e.features[0];
          const clickedPolygonHandleId = mapPolygonHandle.id;
          const newPolygonHandleId = mapPolygonHandle.id;
          const mapPolygon = getPolygonByHandleFeature(mapPolygonHandle);

          //Set 'selected' polygon + handle
          togglePolygonHandle(mapPolygonHandle,true);
          togglePolygon(mapPolygon,true);

          //Set popup
          setPopupDrawingFeatureId(mapPolygonHandle?.properties.unique_id);

        }
      });

      // When the user moves their mouse over a polygon, show its limits
      //!!!NOT MOBILE FRIENDLY

      let hoveredMapPolygon = undefined;

      map.on('mousemove',polygonsLayerName, (e) => {
        if (e.features.length > 0) {

          // Use the first found feature.
          hoveredMapPolygon = e.features[0];

          //Set 'selected' polygon
          togglePolygon(hoveredMapPolygon,true);
        }
      });

      // When the mouse leaves the polygon
      //!!!NOT MOBILE FRIENDLY
      map.on('mouseleave',polygonsLayerName, () => {

        //Unset 'selected' polygon + handle
        togglePolygon(hoveredMapPolygon,false);

        //Unset popup
        setPopupDrawingFeatureId();

      });

    }

    initMapMarkersListeners();
    initMapPolygonsListeners();


    map.on('idle', () => {
      console.log('A idle event occurred.');
    });

  }

  //At init
  useEffect(() => {
    if (mapData === undefined) return;
    initializeMap(mapData);
  },[mapData]);

  useEffect(() => {

    const map = mapboxMap;

    if (map){
      map.on('load', () => {

        if (mapData.sources.drawingPolygons){
          //TOUFIX TEMPORARY

            const toBboxes = () => {
              const source = JSON.parse(JSON.stringify(mapData.sources.drawingPolygons));

              mapData.sources.drawingPolygons.data.features.forEach(feature => {
                const bbox = turf.bbox(feature);
                //const pixelsBbox = bbox.map()
                const poly = turf.bboxPolygon(bbox);

                //feature.geometry = poly.geometry;

                //convert bbox to pixels
                /*
                const bboxCoordz = poly.geometry.coordinates[0];
                bboxCoordz.pop();//remove last item (loop)
                const bboxPixels = bboxCoordz.map(point=>map.project(point));
                */

                const getBboxDimensions = bbox => {
                  //convert bbox to pxiels
                  const diag = [
                    [bbox[0],bbox[1]],//lng+lat
                    [bbox[2],bbox[3]]//lng+lat
                  ]

                  const bboxPixels = diag.map(point=>map.project(point));
                  const width = bboxPixels[1].x - bboxPixels[0].x;
                  const height = bboxPixels[0].y - bboxPixels[1].y;
                  return {w:width,h:height};
                }

                if (feature.properties.media_id === 555) {
                  const dimensions = getBboxDimensions(bbox);
                  const longestSide = Math.max(dimensions.w,dimensions.h);
                  console.log("BBOX FEATURE",bbox,dimensions,longestSide);
                }




              })

            }

            const addPolygonHandles = () => {
              const source = JSON.parse(JSON.stringify(mapData.sources.drawingPolygons));
              console.log("SETUP DRAWING POLYGONS MARKERS",source);
              source.data.features = source.data.features.map(feature => {
                const center = turf.center(feature.geometry);
                return {
                  ...center,
                  properties:{
                    unique_id:feature.properties.unique_id + '-handle',
                    target_id:feature.properties.unique_id,//link to original polygon
                    target_group_id:feature.properties.group_id
                  }
                }
              })
              mapData.sources.polygonHandles = source;
              console.log("POLYGON HANDLES",mapData.sources.polygonHandles);
            }
            const addPolygonBboxes = () => {
              const source = JSON.parse(JSON.stringify(mapData.sources.drawingPolygons));
              console.log("SETUP POLYGONS BBOXES",source);
              source.data.features = source.data.features.map(feature => {
                const center = turf.center(feature.geometry);
                return {
                  ...center,
                  properties:{
                    unique_id:feature.properties.unique_id + '-bbox'
                  }
                }
              })
              mapData.sources.polygonsBbox = source;
              console.log("POLYGON BBOXES",mapData.sources.polygonsBbox);
            }
            toBboxes();
            addPolygonHandles();
            //addPolygonBboxes();

        }

        //init mapbox sources
        for (var key in mapData.sources) {
          const sourceData = mapData.sources[key];
          console.log("ADD SOURCE",key,sourceData);
          map.addSource(key,sourceData);
        }

        //init mapbox layers
        for (var key in mapData.layers) {
          //conform data for mapbox layers
          const layerData = {
            ...mapData.layers[key],
            id:key
          }
          console.log("ADD LAYER",key,layerData);
          map.addLayer(layerData);
        }

        //list all layers
        console.log("MAP LAYERS INITIALIZED",map.getStyle().layers);

        map.resize(); // fit to container

        // Add search
        map.addControl(
          new MapboxGeocoder({
            accessToken: MAPBOX_TOKEN,
            mapboxgl: mapboxgl
          })
        );

        // Add navigation control (the +/- zoom buttons)
        map.addControl(new mapboxgl.NavigationControl(), 'top-right');

        initMapListeners(map);

      });

      map.on('moveend', (e) => {

        console.log({
          'bounds':map.getBounds(),
          'center':[map.getCenter().lng.toFixed(4),map.getCenter().lat.toFixed(4)],
          'zoom':map.getZoom().toFixed(2)
        })
      });

      //when a specific source has been loaded
      map.once('sourcedata', (e) => {
        if (e.sourceId !== 'markers') return;
        if (!e.isSourceLoaded) return;
        console.log("SOURCE DATA LOADED",e.source);
        const sourceObject = map.getSource('markers');
        console.log("RESOURCE YO",sourceObject);
        var features = map.querySourceFeatures('markers');
        console.log("FEATURES YO",features);
      });
    }



    // Clean up on unmount
    return () => {
      if (mapboxMap){
        mapboxMap.remove();
      }
    }

  },[mapboxMap]);

  return (
    <div id="map-container">
      <MapDrawingPopup feature_id={popupDrawingFeatureId}/>
      <MapMarkerPopup/>
      <div
      id="map"
      ref={mapContainerRef}
      />
    </div>
  );
}

export default Map
