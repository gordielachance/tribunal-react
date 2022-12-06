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
    getHandlesByAnnotationPolygonId,
    setAnnotationsLayerIds
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
      map.on('mousemove',['creations','annotationsHandles','events','partners'], e => {
        // Change the cursor style as a UI indicator.
        map.getCanvas().style.cursor = 'pointer';

        //Toggle 'hover'
        hoveredFeature = e.features[0];//first found feature.
        if(hoveredFeature){
          setMapFeatureState(hoveredFeature,'hover',true);
        }

      });

      //Update cursors OUT
      map.on('mouseleave',['creations','annotationsHandles','events','partners'], e => {
        map.getCanvas().style.cursor = '';
        //Toggle 'hover'
        if(hoveredFeature){
          setMapFeatureState(hoveredFeature,'hover',false);
        }
      });

      //open (add) popup when clicking marker
      map.on('click',['creations','annotationsHandles','events','partners'], e => {
        if (e.features.length === 0) return;
        const feature = e.features[0];
        navigate(getFeatureUrl(mapPostId,mapPostSlug,feature.properties.source,feature.properties.id));
      });

    }

    const initMapPolygonsListeners = () => {

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

          navigate(getFeatureUrl(mapPostId,mapPostSlug,firstHandle.properties.source,firstHandle.properties.id));
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

    initMapPolygonsListeners();
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

          //add raster layers
          const getRastersDatas = () => {
            /*
            set polygon minzoom properties
            */

            //get size of the polygon at the current zoom
            const getPolygonSize = polygon => {
              const bbox = turf.bbox(polygon);

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
              const minPixels = 15;
              let targetZoom = undefined;
              for (let zoomLevel = 0; zoomLevel < 23; zoomLevel++) {
                const size = getPolygonSizeForZoomlevel(polygon,zoomLevel);
                if ( (size.x > minPixels) || (size.y > minPixels) ){
                  targetZoom = zoomLevel;
                  break;
                }

              }
              return targetZoom;
            }


            //init mapbox annotation images
            const getSingleRasterDatas = (feature) => {

              const postId = feature.properties.post_id;
              const imageUrl = feature.properties.image_url;
              const imageBbox = feature.properties.image_bbox;

              //compute minimum zoom and store as a prop
              const minzoom = getPolygonMinimumZoom(feature);
              feature.properties.minzoom = minzoom;

              const imagePolygon = turf.bboxPolygon(imageBbox);
              let coordinates = imagePolygon.geometry.coordinates[0];
              coordinates.pop();//remove last item of the polygon (the closing vertex)

              const sourceId = "annotation-source-"+postId;
              const layerId = "annotation-layer-"+postId;

              return {
                polygon_id:feature.properties.id,
                source:{
                  id:sourceId,
                  type: 'image',
                  url: imageUrl,
                  coordinates: coordinates
                },
                layer:{
                  id: layerId,
                  source: sourceId,
                  type: "raster",
                  //"minzoom":minzoom
                }
              }

            }

            const polygonFeatures = (mapData.sources?.annotationPolygons?.data.features || []);

            const sourceIds = [];

            return polygonFeatures.map(feature => {
              const datas = getSingleRasterDatas(feature);
              feature.properties.image_layer = datas.layer.id;
              return datas;
            })

            .filter(data => {  //Ignore duplicates

              const sourceId = data.source.id;

              if ( sourceIds.includes(sourceId) ){
                DEBUG && console.log(`Source "${sourceId}" already exists.`);
                return false;
              }

              sourceIds.push(data.source.id);
              return true;

            })



          }
          const rastersDatas = getRastersDatas();
          const rastersLayers = rastersDatas.map(rasterData => rasterData.layer);
          const rastersLayerIds = rastersLayers.map(rasterLayer => rasterLayer.id);
          setAnnotationsLayerIds(rastersLayerIds); //keep a track of the whole set of layer Ids; we'll need this to toggle all the rasters.

          //add raster sources to collection
          rastersDatas.forEach(data => {
            const sourceData = {...data.source};delete sourceData.id;//remove ID since to avoid bug
            mapData.sources[data.source.id] = sourceData;
          })

          //init mapbox sources
          for (var sourceId in mapData.sources) {
            const sourceData = mapData.sources[sourceId];
            DEBUG && console.log("ADD SOURCE",sourceId,sourceData);
            mapboxMap.addSource(sourceId,sourceData);
          }


          let allLayers = [];

          //conform input data
          for (var key in mapData.layers) {
            //conform data for mapbox layers
            const layerData = {
              ...mapData.layers[key],
              id:key
            }
            allLayers.push(layerData);
          }

          //get basemap layer (we need to inject the rasters between the basemap and the other layers)
          const baseMapLayer = allLayers.find(layer => layer.id === 'basemap');

          //add rasters at the beginning of the array
          allLayers = [...rastersLayers,...allLayers];

          //move basemap at the very beginning of the array (should show BELOW the rasters)
          allLayers = allLayers.filter(item => item !== baseMapLayer);
          allLayers.unshift(baseMapLayer);

          //init mapbox layers
          allLayers.forEach(layer => {
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

      const allPolygons = mapData.sources.annotationPolygons.data.features || [];

      const visiblePolygons = mapboxMap.queryRenderedFeatures({
        layers: ['annotationsFill'],
        filter: featuresFilter
      }) || [];

      const visiblePolygonIds = getUniqueMapFeatures(visiblePolygons).map(feature=>feature.id);

      const toggleAnnotationByLayerId = (layerId,bool) => {

        if (!layerId) return;//continue

        if (bool === undefined){
          bool = !(mapboxMap.getLayoutProperty(layerId, 'visibility') !== 'none');
        }

        const visibilityValue = bool ? 'visible' : 'none';
        mapboxMap.setLayoutProperty(layerId, 'visibility', visibilityValue);
      }

      allPolygons.forEach(feature => {
        const layerId = feature.properties.image_layer;
        const isVisible = visiblePolygonIds.includes(feature.properties.id);
        toggleAnnotationByLayerId(layerId,isVisible);
      });

    })

  },[featuresFilter])

  return (
    <div id="map-container">
      {
        activeFeature &&
        <FeaturePopup
        feature={activeFeature}/>
      }
      <div
      id="map"
      ref={mapContainerRef}
      />
    </div>
  );
}

export default Map
