import React, { useEffect }  from "react";
import mapboxgl from '!mapbox-gl'; // eslint-disable-line import/no-webpack-loader-syntax
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';

import {MAPBOX_TOKEN,DEBUG,getUniqueMapFeatures} from "./../Constants";

import FeaturePopup from "./FeaturePopup";

import './Map.scss';
import * as turf from "@turf/turf";
import { useMap } from '../MapContext';

const Map = (props) => {

  const {
    activeFeatureId,
    setActiveFeatureId,
    mapContainerRef,
    mapData,
    mapboxMap,
    setMapboxMap,
    setMapFeatureState,
    markersFilter,
    getHandlesByAnnotationPolygonId
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

      //!!!NOT MOBILE FRIENDLY
      map.on('click','annotationsFill',e=>{
        if (e.features.length > 0) {
          const polygon = e.features[0];
          const handles = getHandlesByAnnotationPolygonId(polygon.id);
          const firstHandle = handles[0];
          console.log("NNOT FILL CLICK",firstHandle);

          setActiveFeatureId(firstHandle.properties.id);
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

        //init mapbox sources
        for (var key in mapData.sources) {
          const sourceData = mapData.sources[key];
          console.log("ADD SOURCE",key,sourceData);
          map.addSource(key,sourceData);
        }

        //add raster layers
        const addRasterLayers = () => {
          /*
          set polygon minzoom properties
          */

          //get size of the polygon at the current zoom
          const getPolygonSize = polygon => {
            const bbox = turf.bbox(polygon);
            const bboxPolygon = turf.bboxPolygon(bbox);

            const p1 = [bbox[0],bbox[3]];
            const p2 = [bbox[2],bbox[1]];

            const p1Pixels = mapboxMap.project(p1);
            const p2Pixels = mapboxMap.project(p2);

            const pixelWidth = (p2Pixels.x - p1Pixels.x);
            const pixelHeight = (p2Pixels.y - p1Pixels.y);

            const zoomLevel = mapboxMap.getZoom();

            return {
              x:pixelWidth,
              y:pixelHeight,
              zoomLevel:zoomLevel
            }

          }

          const getPolygonSizeForZoomlevel = (polygon,zoomLevel) => {

            const polygonSize = getPolygonSize(polygon);

            const currentZoom = polygonSize.zoomLevel;
            const zoomCorrection = Math.pow(2, currentZoom) / Math.pow(2, zoomLevel);
            return {x:polygonSize.x/zoomCorrection,y:polygonSize.y/zoomCorrection,zoomLevel:zoomLevel};

          }

          //get the minimum zoom level for a polygon, based on a minimum size (in pixels) of the polygon's bounding box.
          const getPolygonMinimumZoom = polygon => {
            const polygonSize = getPolygonSize(polygon);
            const minPixels = 15;
            let targetZoom = undefined;
            for (let zoomLevel = 0; zoomLevel < 23; zoomLevel++) {
              const size = getPolygonSizeForZoomlevel(polygon,zoomLevel);
              if ( (size.x > minPixels) || (size.y > minPixels) ){
                targetZoom = zoomLevel;
                break;
              }

            }
            const size = getPolygonSizeForZoomlevel(polygon,targetZoom);
            return targetZoom;

          }


          //init mapbox annotation images
          const addRaster = (feature) => {

            const postId = feature.properties.post_id;


            const imageUrl = feature.properties.image_url;
            const imageBbox = feature.properties.image_bbox;

            const imagePolygon = turf.bboxPolygon(imageBbox);
            let coordinates = imagePolygon.geometry.coordinates[0];
            coordinates.pop();//remove last item of the polygon (the closing vertex)

            const sourceId = "annotation-raster-source-"+postId;
            const layerId = "annotation-raster-layer-"+postId;

            //add source for this image
            if (map.getSource(sourceId)) {
              throw `Source "${sourceId}" already exists.`
            }

            map.addSource(
              sourceId,
              {
                'type': 'image',
                'url': imageUrl,
                'coordinates': coordinates
              }
           )


           //add image
           if (map.getLayer(layerId)) {
             throw `Layer "${layerId}" already exists.`
           }

           const settings = {
             "id": layerId,
             "source": sourceId,
             "type": "raster",
             "minzoom":feature.properties.minzoom
           };


           map.addLayer(settings);

           return layerId;

          }

          mapData.sources?.annotationsPolygons.data.features.forEach((feature,index) => {

            //compute minimum zoom and store as a prop
            const minzoom = getPolygonMinimumZoom(feature);
            feature.properties.minzoom = minzoom;

            //set raster and store its ID in the polygon's properties
            try{
              const layerId = addRaster(feature);
              feature.properties.image_layer = layerId;
            }catch(e){
              console.log(e);
            }
          })
        }
        addRasterLayers();

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

  //toggle annotation rasters (layers) based on filtered polygons.
  useEffect(()=>{
    if (mapboxMap === undefined) return;

    mapboxMap.once('idle',(e)=>{

      const allPolygons = mapData.sources.annotationsPolygons.data.features || [];

      const visiblePolygons = mapboxMap.queryRenderedFeatures({
        layers: ['annotationsFill'],
        filter: markersFilter
      }) || [];
      const visiblePolygonIds = getUniqueMapFeatures(visiblePolygons).map(feature=>feature.id);

      allPolygons.forEach(feature => {

        const layerId = feature.properties.image_layer;

        if (!layerId) return;//continue

        const isVisible = visiblePolygonIds.includes(feature.properties.id);
        const visibilityValue = isVisible ? 'visible' : 'none';

        //console.log("LAYER VISIBLE ?",layerId,isVisible);

        mapboxMap.setLayoutProperty(layerId, 'visibility', visibilityValue);

      });

    })

  },[markersFilter])

  return (
    <div id="map-container">
      {
        activeFeatureId &&
        <FeaturePopup featureId={activeFeatureId}/>
      }
      <div
      id="map"
      ref={mapContainerRef}
      />
    </div>
  );
}

export default Map
