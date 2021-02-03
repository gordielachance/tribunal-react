import React, { useRef, useEffect,useState }  from "react";
import ReactDOM from 'react-dom';
import {MAPBOX_TOKEN,WP_URL} from "./../Constants";
import { MarkerIcons } from "./MarkerIcons";
import { MarkerPopup } from "./MarkerPopup";
import mapboxgl from 'mapbox-gl';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';
import axios from 'axios';
import './Map.scss';


export const Map = (props) => {

  const mapContainerRef = useRef(null);
  const [map,setMap] = useState(undefined);

  const mapSources = {
    markers:{
      "type":"geojson",
      "data":WP_URL + "/wp-json/geoposts/v1/geojson/markers"
    },
    rasters:{
      "type":"geojson",
      "data":WP_URL + "/wp-json/geoposts/v1/geojson/rasters"
    },
    basemap: {
      'type': 'raster',
      'tiles': [
        'https://stamen-tiles-d.a.ssl.fastly.net/toner/{z}/{x}/{y}.png'
      ],
      'tileSize': 256,
      'paint' : {
        "raster-opacity" : 0.5
      }
    }
  };

  const mapGeoJson = {};

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
  Get JSONs from 'data' url and replace it with the loaded content.
  So we can access de geoJSON data without the need of mapbox.
  */

  const fetchGeoJsons = async (sources) => {

    return new Promise((resolve, reject) => {

      let sourceLoadedCount = 0;

      for (var key in sources) {
        const source = sources[key];

        if (source.type!=='geojson') continue;

        axios.get(
          source.data, //URL
          {
            headers: {
              'Content-Type': 'application/json'
            }
        })
        .then(function (response) {
          mapGeoJson[key] = response.data; //fill geojson obj
          source.data = response.data; //replace URL by geojson data
          sourceLoadedCount = sourceLoadedCount + 1;

          if (sourceLoadedCount === Object.keys(sources).length){
            resolve(sources);
          }
        })
        .catch((error) => {// error
          reject(error);
        })
      };

    })
  }

  const initSources = async() => {
    return new Promise((resolve, reject) => {
      //load geoJSON data
      const geoJsonSources = Object.entries(mapSources).reduce((acc, [key, source]) =>{
        if (source.type==='geojson'){
          acc[key] = source;
        }
        return acc;
      }, {});

      fetchGeoJsons(geoJsonSources)
      .then(function (response) {
        console.log("GEOJSON LOADED",response);

        //now that the data has been populated, load all sources
        for (var key in mapSources) {
          const source = mapSources[key];
          map.addSource(key,source);
        }

        resolve();

      }).catch(function (error) {
        reject(error);
      });

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
        'url': feature.properties.media_url,
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

  const initMapLayers = () => {

    //load SVG icons
    MarkerIcons.forEach(icon => {
        let customIcon = new Image(24, 24);
        customIcon.onload = () => map.addImage(icon.name, customIcon)
        customIcon.src = icon.src;
    });

    initSources()
    .then(function (response) {
      //basemap
      map.addLayer(mapLayers.basemap);

      //rasters
      let rasterFeatures = mapGeoJson?.rasters?.features;

      for (var key in rasterFeatures) {
        const feature = rasterFeatures[key];
        addRaster(feature);

      }

      //markers
      map.addLayer(mapLayers.markers);

      //list all layers

      console.log("layers list:");
      console.log(map.getStyle().layers);


    })

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


  //At init
  useEffect(() => {

    mapboxgl.accessToken = MAPBOX_TOKEN;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/gordielachance/ckkplfnd60xgg17o0ilwozq2o',
      center: [4.3779,50.7786],
      zoom: 10
    });

    map.once('load', (e) => {

      console.log("MAPBOX LOADED!");

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


    // Clean up on unmount
    return () => map.remove();

  }, []);

  //when map is initialized
  useEffect(() => {

    if (!map) return;

    initMapLayers();
    initMapPopups();


  }, [map]);

  return (
    <>
      <div id="map" ref={mapContainerRef} />
    </>
  );
}
