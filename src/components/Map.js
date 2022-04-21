import React, { useRef, useEffect,useState }  from "react";
import ReactDOM from 'react-dom';
import { useParams,useNavigate } from 'react-router-dom';
import mapboxgl from 'mapbox-gl';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';
import axios from 'axios';
import { Loader,Dimmer,Container } from 'semantic-ui-react';

import {MAPBOX_TOKEN,WP_URL,DEBUG} from "./../Constants";
import {getMarkerUrl,getFeatureByPostId,getDistanceToClosestFeature} from "../Constants";

import { MarkerIcons } from "./MarkerIcons";
import { MarkerPopup } from "./MarkerPopup";
import './Map.scss';
import MarkerPost from "./MarkerPost";
import MapSidebar from "./MapSidebar";
import * as turf from "@turf/turf";

const Map = (props) => {

  const params = useParams();
  const navigate = useNavigate();

  const mapContainerRef = useRef(null);
  const [map,setMap] = useState(undefined);
  const hasInitMap = useRef(false);
  const [sources,setSources] = useState(undefined);
  const [loading,setLoading] = useState(true);

  const currentFeatureId = params?.markerId;//id of the feature that has its details shown
  const [activeFeatureId,setActiveFeatureId] = useState(currentFeatureId);//id of the feature that has its popup open
  const [activeFeaturePopup,setActiveFeaturePopup] = useState();//current feature popup (so we can remove it)

  const [sidebarBounds,setSidebarBounds] = useState();
  const [sidebarCenter,setSidebarCenter] = useState();

  //sources before having been prepared
  const rawSources = {
    basemap: {
      type:         'raster',
      tiles: [
                    'https://stamen-tiles-d.a.ssl.fastly.net/toner/{z}/{x}/{y}.png'
      ],
      tileSize:     256,
      paint : {
                    "raster-opacity" : 0.5
      }
    },
    markers:{
      type:         "geojson",
      data:         WP_URL + "/wp-json/geoposts/v1/geojson/markers",
      generateId:   true // This ensures that all features have unique IDs
    },
    rasters:{
      type:         "geojson",
      data:         WP_URL + "/wp-json/geoposts/v1/geojson/rasters",
      generateId:   true // This ensures that all features have unique IDs
    }
  };

  const mapLayers = {
    basemap:{
      'id': 'basemap',
      'type': 'raster',
      'source': 'basemap',
      'minzoom': 0,
      'maxzoom': 22
    },
    markers:{
      'id': 'markers',
      'type': 'symbol',
      'source': 'markers',
      'layout': {
        'icon-image': 'marker-yellow',
        // get the title name from the source's "title" property
        'text-field': ['get', 'title'],
        'text-font': [
          'Open Sans Semibold',
          'Arial Unicode MS Bold'
        ],
        'text-offset': [0, 1.25],
        'text-anchor': 'top'
      }
    }

  }

  /*
  Get JSONs from url and replace it with the loaded content.
  So we can access de geoJSON data without the need of mapbox.
  */

  const fillGeoJsonSources = async (sources) => {



    console.log("FILLING GEOJSON SOURCES FROM REMOTE URLS...",sources);

    const promises = Object.keys(sources).map(function(key, index) {
      const source = sources[key];

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
        Object.entries(sources).map(

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

  const loadSources = async() => {

    //filter geoJson sources
    let geoJsonSources = {}
    for (const [key, source] of Object.entries(rawSources)) {
      if (source.type==='geojson'){
        geoJsonSources[key] = source;
      }
    }

    return fillGeoJsonSources(geoJsonSources)
    .then(function (filledGeoJsonSources) {

      //merge initial datas with the new datas
      const newSources = {...rawSources, ...filledGeoJsonSources };
      setSources(newSources);
    })

    .catch(errors => {
      // react on errors.
      console.error(errors);
    });

  }

  const addRaster = (feature) => {
    const sourceId = "source-raster-"+feature.properties.media_id;
    const layerId = "layer-raster-"+feature.properties.media_id;
    let coordinates = feature.geometry.coordinates[0];
    coordinates.pop();//remove last item of the polygon (the closing vertex)

    //add source for this image
    map.addSource(
      sourceId,
      {
        'type': 'image',
        'url': feature.properties.media_url,//'https://upload.wikimedia.org/wikipedia/en/a/a9/Example.jpg'
        'coordinates': coordinates
      }
   )

   //add image
   map.addLayer({
     "id": layerId,
     "source": sourceId,
     "type": "raster",
     "paint": {"raster-opacity": 0.85}
   })

  }

  const initMapSources = () => {
    //append map sources
    console.log("INIT MAP SOURCES",sources);
    for (var key in sources) {
      const data = sources[key];
      map.addSource(key,data);
    }

  }

  const initMapIcons = () => {
    //load SVG icons
    MarkerIcons.forEach(icon => {
        let customIcon = new Image(24, 24);
        customIcon.onload = () => map.addImage(icon.name, customIcon)
        customIcon.src = icon.src;
    });
  }

  const initMapRasters = () => {
    //rasters
    let rasterFeatures = sources.rasters.data.features;

    console.log(`INITIALIZING ${rasterFeatures.length} RASTERS`,rasterFeatures);

    for (var key in rasterFeatures) {
      const feature = rasterFeatures[key];
      addRaster(feature);
    }
  }

  const addFeaturePopup = feature => {

    if (feature === undefined){
      throw 'Popup requires a feature parameter.';
    }

    var coordinates = feature.geometry.coordinates.slice();

    //
    // Create a popup, but don't add it to the map yet.
    var popup = new mapboxgl.Popup(
      {
        closeButton: false,
        closeOnClick: false
      }
    );

    //get popup content
    const content = getMarkerPopupContent(feature);

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

  const initMapLayers = () => {

    //basemap
    map.addLayer(mapLayers.basemap);

    //markers
    map.addLayer(mapLayers.markers);

    //Update cursor on marker
    map.on('mouseenter','markers', e => {
      // Change the cursor style as a UI indicator.
      map.getCanvas().style.cursor = 'pointer';
    });

    //Reset cursor on marker
    map.on('mouseleave','markers', e => {
      map.getCanvas().style.cursor = '';
    });

    //open (add) popup when clicking marker
    map.on('click','markers', e => {
      var feature = e.features[0];
      setActiveFeatureId(feature.properties.post_id);
    });

    //list all layers
    console.log("MAP LAYERS INITIALIZED",map.getStyle().layers);

  }

  const getMarkerPopupContent = feature => {
    // create the popup
    const el = document.createElement('div');
    ReactDOM.render(
      <MarkerPopup
      title={feature.properties.title}
      description={feature.properties.excerpt}
      tags={feature.properties.tags}
      onClick={(e)=>{showFullMarker(feature)}}
      />
      , el
    );

    return el;
  }


  const initMapMarkers = () => {
    const features = sources.markers.data.features;

    // add markers to map
    for (const feature of features) {

      // create the handle
      /*
      const handle = document.createElement('div');
      handle.className = 'marker';
      */
      const handle = undefined;

      //create the marker
      const marker = new mapboxgl.Marker(handle);

      // create the popup
      const popupContent = getMarkerPopupContent(feature);
      const popup = new mapboxgl.Popup({ offset: 25 }) // add popups
      /*
      .setHTML(
      ` <h3>${feature.properties.title}</h3><p>${feature.properties.description}</p>`
      )
      */
      .setDOMContent(popupContent)

      //initialize
      marker
      .setLngLat(feature.geometry.coordinates)
      .setPopup(popup)
      .addTo(map)
      //.togglePopup();

      marker.getElement().addEventListener('click', () => marker.togglePopup());

    }
  }

  const initMap = () => {

    mapboxgl.accessToken = MAPBOX_TOKEN;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/gordielachance/ckkplfnd60xgg17o0ilwozq2o',
      center: [4.3779,50.7786],
      zoom: 10
    });

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

      setSidebarBounds(map.getBounds()); //on load
      setSidebarCenter(map.getCenter()); //on load

      setMap(map);
    });

    map.on('moveend', (e) => {
      setSidebarBounds(map.getBounds());
      setSidebarCenter(map.getCenter());
      console.log({
        'bounds':map.getBounds(),
        'center':[map.getCenter().lng.toFixed(4),map.getCenter().lat.toFixed(4)],
        'zoom':map.getZoom().toFixed(2)
      })
    });


  }

  //At init
  useEffect(() => {
    loadSources();
    const map = initMap();
    // Clean up on unmount
    return () => map.remove();
  },[]);

  //when map is initialized
  useEffect(() => {
    if (map===undefined) return;
    console.log("MAP INITIALIZED",map);
  }, [map]);

  useEffect(() => {
    if (sources === undefined) return;
    if (map === undefined) return;
    setLoading(false);
  },[sources,map])

  useEffect(() => {
    console.log("LOADING:",loading);
  },[loading])

  //when map is initialized
  useEffect(() => {
    if (hasInitMap.current) return;
    if (sources === undefined) return;
    if (map === undefined) return;

    initMapSources();
    initMapIcons();
    //initMapRasters();
    initMapLayers();
    //initMapMarkers();

    hasInitMap.current = true;

  }, [map,sources]);

  /*
  create a circle that extends to the closest marker,
  and zoom on it.
  */
  const fitToFeature = feature => {

    const center = feature.geometry.coordinates;
    const radius = getDistanceToClosestFeature(feature,sources.markers.data.features);
    const circle = turf.circle(center,radius);

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
      padding:100//px
    });
  }

  useEffect(()=>{
    if (activeFeatureId === undefined) return;



    const feature = getFeatureByPostId(sources.markers.data.features,activeFeatureId);

    console.log("ACTIVE FEATURE ID",activeFeatureId,feature,sources.markers.data.features);

    //remove current popup if any
    if (activeFeaturePopup){
      activeFeaturePopup.remove();
    }

    //open popup
    try {
      const popup = addFeaturePopup(feature);
      setActiveFeaturePopup(popup);
      console.log("ACTIVE FEATURE",feature);
    } catch (error) {
      console.error(error);
    }

  },[activeFeatureId])


  const showFullMarker = feature => {
    const url = getMarkerUrl(feature);
    console.log("MARKER URL",url);
    navigate(url);
  }

  const handleSidebarFeatureClick = post_id => {

    //get feature
    const feature = getFeatureByPostId(sources.markers.data.features,post_id);

    //set active
    setActiveFeatureId(post_id);

    //center/zoom on marker
    fitToFeature(feature);

  }

  const handleDisableLayers = slugs => {
    console.log("MAP DISABLED LAYERS",slugs);
  }

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
      bounds={sidebarBounds}
      center={sidebarCenter}
      features={sources?.markers.data.features}
      activeFeatureId={activeFeatureId}
      onFeatureClick={handleSidebarFeatureClick}
      onDisableLayers={handleDisableLayers}
      />
      <div id="map" ref={mapContainerRef} />
    </Dimmer.Dimmable>
  );
}

export default Map
