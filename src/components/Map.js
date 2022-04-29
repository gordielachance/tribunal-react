import React, { useRef,useEffect,useState,useCallback }  from "react";
import ReactDOM from 'react-dom';
import { useParams,useNavigate } from 'react-router-dom';
import mapboxgl from 'mapbox-gl';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';
import axios from 'axios';
import { Loader,Dimmer,Container } from 'semantic-ui-react';
import classNames from "classnames";

import {MAPBOX_TOKEN,WP_URL,DEBUG} from "./../Constants";
import {getMarkerUrl,getFeatureById,getDistanceFromOriginToClosestFeature,getDistanceFromFeatureToClosest} from "../Constants";

import { MarkerIcons } from "./MarkerIcons";
import { FeaturePopup } from "./FeatureCard";
import './Map.scss';
import MarkerPost from "./MarkerPost";
import MapSidebar from "./MapSidebar";
import * as turf from "@turf/turf";

const Map = (props) => {

  const params = useParams();
  const navigate = useNavigate();

  const mapContainerRef = useRef(null);
  const [map,setMap] = useState(undefined);
  const [loading,setLoading] = useState(true);

  const currentFeatureId = params?.markerId;//id of the feature that has its details shown
  const [activeFeatureId,setActiveFeatureId] = useState();//id of the active feature
  const [activePopupId,setActivePopupId] = useState();//id of the active feature
  const previousPopupId = useRef();

  const previousFeatureId = useRef();

  const markerPopup = useRef();//current feature popup (so we can remove it)

  const [mapCenter,setMapCenter] = useState();
  const [mapMoving,setMapMoving] = useState(false);
  const [sortMarkerBy,setSortMarkerBy] = useState('date');
  const [markerTagsDisabled,setMarkerTagsDisabled] = useState([]);
  const [tagsFilter,setTagsFilter] = useState();
  const [markerFormatsDisabled,setMarkerFormatsDisabled] = useState([]);
  const [formatsFilter,setFormatsFilter] = useState();
  const [markersFilter,setMarkersFilter] = useState();

  const rawMapData = {
    map:{
      style: 'mapbox://styles/gordielachance/ckkplfnd60xgg17o0ilwozq2o',
      center: [4.3779,50.7786],
      zoom: 10
    },
    sources:{

      basemap: {
        type:'raster',
        tiles: [
          'https://stamen-tiles-d.a.ssl.fastly.net/toner/{z}/{x}/{y}.png'
        ],
        tileSize:256,

      },

      handDrawn: {
        type:'raster',
        tiles: [
          'http://tribunaldesprejuges.org/wordpress/wp-content/uploads/tdp_tiles/GS/{z}/{x}/{y}.png'
        ],
        tileSize:256,

      },

      markers:{
        type:"geojson",
        data:WP_URL + "/wp-json/geoposts/v1/geojson/markers",
        promoteId:'unique_id' //property to use for mapbox features IDs.
        //generateId:   true
      }
    },
    layers:{
      basemap:{
        type: 'raster',
        source: 'basemap',
        minzoom: 0,
        maxzoom: 22,
        paint : {
          "raster-opacity" : 0.1
        }
      },
      handDrawn:{
        type: 'raster',
        source: 'handDrawn',
        minzoom: 0,
        maxzoom: 22,
      },
      markers:{
        type: 'circle',
        source: 'markers',
        paint: {
          'circle-color':'#f3d511',
          'circle-radius':10,
          'circle-stroke-width': 2,
          'circle-stroke-color': [
            'case',
            ['boolean', ['feature-state', 'active'], false],
            '#000000',
            '#c6ad09',//fallback
          ]
        }
      }
    }
  }

  const [dataMap,setDataMap] = useState();

  const addFeaturePopup = feature => {

    if (feature === undefined){
      throw 'Popup requires a feature parameter.';
    }

    var coordinates = feature.geometry.coordinates.slice();

    //
    // Create a popup, but don't add it to the map yet.
    var popup = new mapboxgl.Popup(
      {
        //closeButton: false,
        closeOnClick: false
      }
    );

    popup.on('close', function(e) {
      setActivePopupId(undefined);
    })

    //get popup content
    const content = getFeaturePopupContent(feature);

    // Ensure that if the map is zoomed out such that multiple
    // copies of the feature are visible, the popup appears
    // over the copy being pointed to.
    /*
    while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
    coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
    }
    */

    // Populate the popup and set its coordinates
    // based on the feature found.
    return popup
    .setLngLat(coordinates)
    .setDOMContent(content)
    .addTo(map);
  }

  const initMapListeners = map => {

    //Update cursor on marker
    map.on('mouseenter','markers', e => {
      // Change the cursor style as a UI indicator.
      map.getCanvas().style.cursor = 'pointer';
    });

    //Reset cursor on marker
    map.on('mouseleave','markers', e => {
      map.getCanvas().style.cursor = '';
    });

    /*
    const handleMarkerClick = useCallback((e) => {

    },[])
    */


    //open (add) popup when clicking marker
    map.on('click','markers', e => {

      if (e.features.length === 0) return;

      //clicked marker
      const feature = e.features[0];
      activateFeature(feature.id);

    });

    map.on('idle', () => {
      console.log('A idle event occurred.');
    });

  }

  const getFeaturePopupContent = feature => {
    // create the popup
    const el = document.createElement('div');
    ReactDOM.render(
      <FeaturePopup
      feature={feature}
      onClick={e=>{showFullMarker(feature)}}
      onClose={e=>setActiveFeatureId()}
      />
      , el
    );

    return el;
  }

  const initData = async(inputData) => {
    //it is not currently possible to query ALL the features of a geoJSON source; and we need them for calculations.
    //so, we need to preload them :/
    //https://github.com/mapbox/mapbox-gl-js/issues/9720
    const swapGeoJsonSources = async sources => {

      /*
      //update geojson sources:
      /update data from url > json
      */

      const updateGeoJsonSources = async geoJsonSources => {

        console.log("FILLING GEOJSON SOURCES FROM REMOTE URLS...",geoJsonSources);

        const promises = Object.keys(geoJsonSources).map(function(key, index) {
          const source = geoJsonSources[key];

          return axios.get(
            source.data, //URL
            {
            headers: {
              'Content-Type': 'application/json'
            }
          })
        })

        return axios
        .all(promises)
        .then(responses => {

          //return a copy of the initial object and replace the 'data' prop with our responses
          const filledSources = Object.fromEntries(
            Object.entries(geoJsonSources).map(

              ([k, v], i) => [
                k,
                {
                  ...v,
                  data:responses[i].data
                }

              ]
            )
          );
          return filledSources;

        })
        .catch(errors => {
          // react on errors.
          console.error(errors);
        });

      }

      //filter geoJson sources
      let geoJsonSources = {}
      for (const [key, source] of Object.entries(sources)) {
        if (source.type==='geojson'){
          geoJsonSources[key] = source;
        }
      }

      return updateGeoJsonSources(geoJsonSources)

      //merge initial datas with the new datas
      .then(function (filledGeoJsonSources) {
        return {...sources, ...filledGeoJsonSources };
      })
      .catch(errors => {
        // react on errors.
        console.error(errors);
      });
    }

    const fetchedSources = await swapGeoJsonSources(inputData.sources);

    const outputData = {
      ...inputData,
      sources:fetchedSources
    }

    //TOUFIX URGENT DEMO CONTENT
    /*
    outputData.sources.markers.data = {
      "type":"FeatureCollection",
      "features":[
        {
          "properties":{
            "post_id":925,
            "post_type":"geoposts_marker",
            "layerkeys":[

            ],
            "classes":[
              "geoposts-layer",
              "geoposts_marker",
              "geoposts-post-925",
              "geoposts-popup-on-hover"
            ],
            "icon_id":0,
            "title":"Jette - G\u00e9ographie des pr\u00e9jug\u00e9s",
            "name":"jette-geographie-des-prejuges",
            "format":false,
            "excerpt":"Cr\u00e9ation de carte subjective de la commune de Jette avec un groupe de jeunes de l&rsquo;\u00e9cole Saint-Pierre de Jette.",
            "timestamp":1613600421,
            "tag_slugs":[

            ],
            "layer_slugs":[

            ],
            "thumbnail":"http:\/\/tribunaldp.local\/wordpress\/wp-content\/uploads\/2021\/02\/JETTE_version-DEZOOM_200dpi_5.jpg",
            "has_more":true
          },
          "style":{
            "opacity":1
          },
          "type":"Feature",
          "geometry":{
            "type":"Point",
            "coordinates":[
              4.3263281726710003,
              50.877655625861998
            ]
          }
        },
        {
          "properties":{
            "title":"NO POST ID",
            "name":"cartes-subjectives",
            "format":false,
            "excerpt":"Cr\u00e9ation de carte subjective de la commune de Neder-over-Heembeek avec un groupe de jeunes de la Cit\u00e9 Versailles.",
            "timestamp":1613595450
          },
          "type":"Feature",
          "geometry":{
            "type":"Point",
            "coordinates":[
              4.3777731241898996,
              50.896284446804003
            ]
          }
        }
      ]
    }
    */

    const setFeatureIds = (features,prefix) => {
      for (var index in features) {
        const feature = features[index];
        const id = `${prefix}-feature-${index}`;

        features[index] = {
          ...feature,
          properties:{
            ...feature.properties,
            unique_id:id
          }
        }
      }
    }

    //Set unique features IDs (that is what we use to select features in the code)
    setFeatureIds(outputData.sources.markers.data.features,'markers');

    return outputData;
  }

  const initMap = async (dataMap) => {

    mapboxgl.accessToken = MAPBOX_TOKEN;
    const map = new mapboxgl.Map({
      ...dataMap.map,
      container: mapContainerRef.current
    });

    map.on('load', () => {
      //init mapbox sources
      for (var key in dataMap.sources) {
        const data = dataMap.sources[key];
        console.log("ADD SOURCE",key,data);
        map.addSource(key,data);
      }

      //init mapbox layers
      for (var key in dataMap.layers) {
        //conform data for mapbox layers
        const data = {
          ...dataMap.layers[key],
          id:key
        }
        console.log("ADD LAYER",key,data);
        map.addLayer(data);
      }

      //list all layers
      console.log("MAP LAYERS INITIALIZED",map.getStyle().layers);

      setMap(map);
      setLoading(false);
    })

    map.once('load', (e) => {

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

      setMapCenter([map.getCenter().lng,map.getCenter().lat]); //on load

      initMapListeners(map);

    });

    map.on('movestart', (e) => {
      setMapMoving(true);
    });

    map.on('moveend', (e) => {
      setMapMoving(false);
    });


    map.on('moveend', (e) => {
      setMapCenter([map.getCenter().lng,map.getCenter().lat]); //on load
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

  /*
  create a circle that extends to the closest marker,
  and zoom on it.
  */
  const fitToFeature = useCallback((feature) => {

    //get minimum zoom to see clearly this marker

    /*
    //distance from feature to the nearest point
    const distanceToNearest = getDistanceFromFeatureToClosest(feature_id,dataMap.sources.markers.data.features);
    console.log("NEAREST MARKER DIST",distanceToNearest);
    return;
    */


    const origin = feature.geometry.coordinates;
    const radius = getDistanceFromOriginToClosestFeature(origin,dataMap.sources.markers.data.features);
    const circle = turf.circle(origin,radius);

    //for debug purposes
    if (DEBUG){

      if (map.getLayer("zoomCircleLayer")) {
        map.removeLayer("zoomCircleLayer");
      }

      if (map.getSource("zoomCircleSource")) {
        map.removeSource("zoomCircleSource");
      }

      map.addSource("zoomCircleSource", {
      	type: "geojson",
      	data: circle
      });

      map.addLayer({
        id: 'zoomCircleLayer',
        type: 'fill',
        source: 'zoomCircleSource',
        paint: {
          "fill-color": "blue",
          "fill-opacity": 0.6
        }
      });
    }

    //compute a bouding box for this circle
    const bbox = turf.bbox(circle);

    map.fitBounds(bbox, {
      maxZoom:14,
      padding:100//px
    });
  }, [map,dataMap?.sources.markers.data.features]);

  const showFullMarker = feature => {
    const url = getMarkerUrl(feature);
    console.log("MARKER URL",url);
    navigate(url);
  }

  //set feature as 'active' + display its popup.
  //!!! the features MUST exists in the viewport (because we'll update its state, etc.)
  const activateFeature = feature_id => {
    setActiveFeatureId(feature_id);
    setActivePopupId(feature_id);

    const feature = getFeatureById(dataMap?.sources.markers.data.features,feature_id);
    console.log("FEATURE ACTIVATED",feature);


  }

  const handleSidebarFeatureClick = feature_id => {

    const feature = getFeatureById(dataMap?.sources.markers.data.features,feature_id);

    //center/zoom on marker
    fitToFeature(feature);

    //wait until the map movements stops,
    //so mapbox can handle the feature (it only consider features within the viewport)
    map.once('idle', () => {
      activateFeature(feature_id);
    });

    /*
    map.easeTo({
      center:feature.geometry.coordinates,
      zoom:14,
      duration: 3000,
    })
    */

  }

  const handleSortBy = key => {
    console.log("SORT BY",key);
    setSortMarkerBy(key);
  }

  //At init
  useEffect(() => {

    //we cannot use await directly within useEffect; so use a function wrapper + handle cancelling.
    //https://devtrium.com/posts/async-functions-useeffect
    let isSubscribed = true;

    const prepareMapData = async () => {
      const data = await initData(rawMapData);

      // set state with the result if `isSubscribed` is true
      if (isSubscribed) {
        setDataMap(data);
      }
    }

    prepareMapData()
    .catch(console.error);

    // cancel any future `setData`
    return () => isSubscribed = false;

  },[]);

  //When dataMap is loaded
  useEffect(() => {
    if (dataMap === undefined) return;
    initMap(dataMap);

    // Clean up on unmount
    return () => {
      if (map){
        map.remove();
      }
    }
  },[dataMap]);

  //visually toggle active marker on map

  //when we activate a marker
  useEffect(()=>{
    if (map === undefined) return;
    if (activeFeatureId === undefined) return;

    //get feature on map
    const features = map.querySourceFeatures('markers');
    const feature = (features || []).find(feature => feature.id === activeFeatureId);

    //set its 'active' state
    const setFeatureActive = feature => {

      //unset previous
      if (previousFeatureId.current !== undefined) {
        map.setFeatureState(
          { source: 'markers', id: previousFeatureId.current },
          { active: false }
        );
      }
      //set current
      if (feature?.id !== undefined){
        previousFeatureId.current = feature.id
        map.setFeatureState(
          { source: 'markers', id: feature.id },
          { active: true }
        );
      }
    }
    setFeatureActive(feature);

  },[activeFeatureId])

  //when we want to open a popup
  useEffect(()=>{
    if (map === undefined) return;

    //remove previous popup
    if ( (activePopupId === undefined) || (activePopupId !== previousPopupId.current) ){
      //remove current popup if any
      if (markerPopup.current){
        markerPopup.current.remove();
        markerPopup.current = undefined;
      }
    }

    //set new popup
    if (activePopupId !== undefined){
      //get feature on map
      const features = map.querySourceFeatures('markers');
      const feature = (features || []).find(feature => feature.id === activeFeatureId);

      //set its popup
      markerPopup.current = addFeaturePopup(feature);
      previousPopupId.current = activePopupId;//keep track of the last opened popup
    }



  },[activePopupId])


  //build features tags filter
  useEffect(()=>{
    const buildFilter = tags => {

      //no tags set
      if ( (tags || []).length === 0) return;

      //expression for each tag
      const tagFilters = tags.map(tag=>['in',tag,['get', 'layer_slugs']])

      return ['any'].concat(tagFilters);

    }

    let filter = buildFilter(markerTagsDisabled);

    if (filter){//exclude all
      filter = ['!',filter];
    }

    setTagsFilter(filter);
  },[markerTagsDisabled])

  //build features formats filter
  useEffect(()=>{
    const buildFilter = formats => {

      //no formats set
      if ( (formats || []).length === 0) return;

      return ['in', ['get', 'format'], ['literal', formats]];

    }

    let filter = buildFilter(markerFormatsDisabled);

    if (filter){//exclude all
      filter = ['!',filter];
    }

    setFormatsFilter(filter);
  },[markerFormatsDisabled])

  //set global marker filters
  useEffect(()=>{

    const filters = [
      tagsFilter,
      formatsFilter
    ]

    const buildFilter = filters => {

      filters = filters.filter(function(filter) {
        return filter !== undefined;
      });

      //no filters
      if ( (filters || []).length === 0) return;
      return ['all'].concat(filters);
    }

    const filter = buildFilter(filters);
    setMarkersFilter(filter);

  },[tagsFilter,formatsFilter])

  //set global marker filters
  useEffect(()=>{
    if (map === undefined) return;
    console.log("RUN GLOBAL FILTER",markersFilter);
    map.setFilter("markers",markersFilter);
  },[markersFilter])

  return (
    <Dimmer.Dimmable as={Container} dimmed={loading} id="map-container">
      <Dimmer active={loading} inverted>
        <Loader />
      </Dimmer>
      <MarkerPost
      post_id={currentFeatureId}
      onClose={()=>navigate(props.url)}
      />
      <MapSidebar
      active={true}
      mapMoving={mapMoving}
      mapCenter={mapCenter}
      features={dataMap?.sources.markers.data.features}
      feature_id={activeFeatureId}
      onFeatureClick={handleSidebarFeatureClick}
      sortMarkerBy={sortMarkerBy}
      onSortBy={handleSortBy}
      markerTagsDisabled={markerTagsDisabled}
      onDisableTags={slugs=>setMarkerTagsDisabled(slugs)}
      markerFormatsDisabled={markerFormatsDisabled}
      onDisableFormats={slugs=>setMarkerFormatsDisabled(slugs)}
      hasMarkersFilters={(markersFilter!==undefined)}
      />
      <div
      id="map"
      ref={mapContainerRef}
      className={classNames({
        mapMoving: mapMoving
      })}
      />
    </Dimmer.Dimmable>
  );
}

export default Map
