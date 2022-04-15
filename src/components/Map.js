import React, { useRef, useEffect,useState }  from "react";
import ReactDOM from 'react-dom';
import mapboxgl from 'mapbox-gl';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';
import axios from 'axios';
import { Loader,Dimmer,Container } from 'semantic-ui-react';

import {MAPBOX_TOKEN,WP_URL} from "./../Constants";
import { MarkerIcons } from "./MarkerIcons";
import { MarkerPopup } from "./MarkerPopup";
import './Map.scss';
import MarkerPost from "./MarkerPost";


const Map = (props) => {

  const mapContainerRef = useRef(null);
  const [map,setMap] = useState(undefined);
  const hasInitMap = useRef(false);
  const [sources,setSources] = useState(undefined);
  const [loading,setLoading] = useState(true);

  const [modalOpen,setModalOpen] = useState(false);
  const [modalPostId,setModalPostId] = useState(undefined);

  //sources before having been prepared
  const rawSources = {
    basemap: {
      'type': 'raster',
      'tiles': [
        'https://stamen-tiles-d.a.ssl.fastly.net/toner/{z}/{x}/{y}.png'
      ],
      'tileSize': 256,
      'paint' : {
        "raster-opacity" : 0.5
      }
    },
    markers:{
      "type":"geojson",
      "data":WP_URL + "/wp-json/geoposts/v1/geojson/markers"
    },
    rasters:{
      "type":"geojson",
      "data":WP_URL + "/wp-json/geoposts/v1/geojson/rasters"
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
    console.log("INIT MAP SOURCES");
    for (var key in sources) {
      const data = sources[key];
      map.addSource(key,data);
    }

  }

  const initMapMarkers = () => {
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

  const initMapLayers = () => {

    //basemap
    map.addLayer(mapLayers.basemap);

    //markers
    map.addLayer(mapLayers.markers);

    map.on('click', 'markers', (e) => {
      const feature = e.features[0];
      const post_id = feature.properties.id;
      setModalPostId(post_id);
      setModalOpen(true);
    });



    //list all layers
    console.log("MAP LAYERS INITIALIZED",map.getStyle().layers);

  }

  const initMapPopups = () => {

    // Create a popup, but don't add it to the map yet.
    var popup = new mapboxgl.Popup({
      closeButton: false,
      closeOnClick: false
    });

    const markerPopupPopupEnter = function (e) {
      // Change the cursor style as a UI indicator.
      map.getCanvas().style.cursor = 'pointer';

      var feature = e.features[0];
      var coordinates = feature.geometry.coordinates.slice();

      const popupEl = document.createElement('div');
      ReactDOM.render(
        <MarkerPopup
        title={feature.properties.title}
        />
        , popupEl
      );

      // Ensure that if the map is zoomed out such that multiple
      // copies of the feature are visible, the popup appears
      // over the copy being pointed to.
      while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
      coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
      }

      // Populate the popup and set its coordinates
      // based on the feature found.
      popup
      .setLngLat(coordinates)
      .setDOMContent(popupEl)
      .addTo(map);
    };

    const markerPopupPopupLeave = function (e) {
      map.getCanvas().style.cursor = '';
      popup.remove();
    };

    map.on('mouseenter','markers', markerPopupPopupEnter);
    map.on('mouseleave','markers', markerPopupPopupLeave);

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

      map.on('moveend', (e) => {
        console.log({
          'center':[map.getCenter().lng.toFixed(4),map.getCenter().lat.toFixed(4)],
          'zoom':map.getZoom().toFixed(2)
        })
      });
      setMap(map);
    });

    return map;

  }

  //At init
  useEffect(() => {
    loadSources();
    const map = initMap();
    // Clean up on unmount
    return () => map.remove();

  },[]);

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
    if (map===undefined) return;
    console.log("MAP INITIALIZED");

  }, [map]);

  //when map is initialized
  useEffect(() => {
    if (hasInitMap.current) return;
    if (sources === undefined) return;
    if (map === undefined) return;

    initMapSources();
    initMapMarkers();
    //initMapRasters();
    initMapLayers();
    initMapPopups();

    hasInitMap.current = true;

  }, [map,sources]);



  return (
    <Dimmer.Dimmable as={Container} dimmed={loading} id="map-container">
      <Dimmer active={loading} inverted>
        <Loader />
      </Dimmer>
      <MarkerPost
      open={modalOpen}
      post_id={modalPostId}
      onClose={()=>setModalOpen(false)}
      />
      <div id="map" ref={mapContainerRef} />
    </Dimmer.Dimmable>
  );
}

export default Map
