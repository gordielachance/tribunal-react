import React, { useEffect }  from "react";
import mapboxgl from '!mapbox-gl'; // eslint-disable-line import/no-webpack-loader-syntax
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';

import {MAPBOX_TOKEN,DEBUG} from "./../Constants";

import FeaturePopup from "./FeaturePopup";

import './Map.scss';
import * as turf from "@turf/turf";
import { useMap } from '../MapContext';

const Map = (props) => {

  const {
    setActiveFeatureId,
    mapContainerRef,
    mapData,
    mapboxMap,
    setMapboxMap,
    showPopup,
    setShowPopup,
    setMapFeatureState
  } = useMap();

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

      let hoveredFeature = undefined;

      //Update cursors IN
      map.on('mousemove','creations', e => {
        // Change the cursor style as a UI indicator.
        map.getCanvas().style.cursor = 'pointer';

        //Toggle 'hover'
        hoveredFeature = e.features[0];//first found feature.
        if(hoveredFeature){
          setMapFeatureState(hoveredFeature,'hover',true);
        }

      });

      //Update cursors OUT
      map.on('mouseleave','creations', e => {
        map.getCanvas().style.cursor = '';
        //Toggle 'hover'
        if(hoveredFeature){
          setMapFeatureState(hoveredFeature,'hover',false);
        }
      });

      //open (add) popup when clicking marker
      map.on('click','creations', e => {

        if (e.features.length === 0) return;

        const feature = e.features[0];
        setActiveFeatureId(feature.properties.id);

        //show popup
        setShowPopup(true);

      });
    }

    const initMapPolygonsListeners = () => {

      let hoveredHandle = undefined;


      //Update cursors IN

      map.on('mousemove','annotationsHandles', e => {
        // Change the cursor style as a UI indicator.
        map.getCanvas().style.cursor = 'pointer';

        //Toggle 'hover'
        hoveredHandle = e.features[0];//first found feature.
        if(hoveredHandle){
          setMapFeatureState(hoveredHandle,'hover',true);
        }

      });

      //Update cursors OUT
      map.on('mouseleave','annotationsHandles', e => {
        map.getCanvas().style.cursor = '';
        if(hoveredHandle){
          setMapFeatureState(hoveredHandle,'hover',false);
        }
      });


      // When the user clicks a polygon handle
      map.on('click','annotationsHandles',e=>{


        if (e.features.length > 0) {

          const feature = e.features[0];
          setActiveFeatureId(feature.properties.id);

          //show popup
          setShowPopup(true);

        }
      });

      // When the user moves their mouse over a polygon, show its limits
      //!!!NOT MOBILE FRIENDLY

      let hoveredMapPolygon = undefined;

      map.on('mousemove','annotationsFill', (e) => {
        if (e.features.length > 0) {

          // Use the first found feature.
          hoveredMapPolygon = e.features[0];

          //Set 'active' polygon
          setMapFeatureState(hoveredMapPolygon,'hover',true);
        }
      });

      // When the mouse leaves the polygon
      //!!!NOT MOBILE FRIENDLY
      map.on('mouseleave','annotationsFill', () => {

        //Unset 'active' polygon
        setMapFeatureState(hoveredMapPolygon,'hover',false);

        //Unset popup
        //setPopupDrawingFeatureId();

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

        if (mapData.sources.annotations){
          //TOUFIX TEMPORARY

            const toBboxes = () => {

              mapData.sources.annotationsPolygons.data.features.forEach(feature => {
                const bbox = turf.bbox(feature);
                //const pixelsBbox = bbox.map()

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

            const addPolygonBboxes = () => {
              const source = JSON.parse(JSON.stringify(mapData.sources.annotations));
              console.log("SETUP POLYGONS BBOXES",source);
              source.data.features = source.data.features.map(feature => {
                const center = turf.center(feature.geometry);
                return {
                  ...center,
                  properties:{
                    id:feature.properties.id + '-bbox'
                  }
                }
              })
              mapData.sources.annotationsBbox = source;
              console.log("POLYGON BBOXES",mapData.sources.annotationsBbox);
            }
            toBboxes();
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
      {
        showPopup &&
        <FeaturePopup/>
      }
      <div
      id="map"
      ref={mapContainerRef}
      />
    </div>
  );
}

export default Map
