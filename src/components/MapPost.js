import React, { useEffect,useState,useCallback }  from "react";
import { useParams,useNavigate } from 'react-router-dom';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';
import { Loader,Dimmer,Container } from 'semantic-ui-react';

import {DEBUG} from "./../Constants";
import {getFeatureById,getDistanceFromOriginToClosestFeature} from "../Constants";

import './Map.scss';
import MarkerPost from "./MarkerPost";
import MapSidebar from "./MapSidebar";
import * as turf from "@turf/turf";
import { useApp } from '../AppContext';
import Map from "./Map";

const MapPost = (props) => {

  const navigate = useNavigate();

  const {mapPostName,markerPostId} = useParams();
  const {mapboxMap,mapData,setMapData,setSelectedMarkerFeature,setPopupMarkerFeature} = useApp();

  const [loading,setLoading] = useState(true);

  const [sortMarkerBy,setSortMarkerBy] = useState('date');
  const [markerTagsDisabled,setMarkerTagsDisabled] = useState([]);
  const [tagsFilter,setTagsFilter] = useState();
  const [markerFormatsDisabled,setMarkerFormatsDisabled] = useState([]);
  const [formatsFilter,setFormatsFilter] = useState();
  const [markersFilter,setMarkersFilter] = useState();

  /*
  create a circle that extends to the closest marker,
  and zoom on it.
  */
  const fitToFeature = useCallback((feature) => {

    //get minimum zoom to see clearly this marker

    /*
    //distance from feature to the nearest point
    const distanceToNearest = getDistanceFromFeatureToClosest(feature_id,mapData.sources.markers.data.features);
    console.log("NEAREST MARKER DIST",distanceToNearest);
    return;
    */


    const origin = feature.geometry.coordinates;
    const radius = getDistanceFromOriginToClosestFeature(origin,mapData.sources.markers.data.features);
    const circle = turf.circle(origin,radius);

    //for debug purposes
    if (DEBUG){

      if (mapboxMap.getLayer("zoomCircleLayer")) {
        mapboxMap.removeLayer("zoomCircleLayer");
      }

      if (mapboxMap.getSource("zoomCircleSource")) {
        mapboxMap.removeSource("zoomCircleSource");
      }

      mapboxMap.addSource("zoomCircleSource", {
      	type: "geojson",
      	data: circle
      });

      mapboxMap.addLayer({
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

    mapboxMap.fitBounds(bbox, {
      maxZoom:14,
      padding:100//px
    });

  }, [mapboxMap,mapData?.sources.markers.data.features]);

  const setSelectedMarker = feature => {
    setSelectedMarkerFeature(feature);
    setPopupMarkerFeature(feature);
  }

  const handleSidebarFeatureClick = feature_id => {

    const feature = getFeatureById(mapData?.sources.markers.data.features,feature_id);

    //center/zoom on marker
    fitToFeature(feature);

    //wait until the map movements stops,
    //so mapbox can handle the feature (it only consider features within the viewport)
    mapboxMap.once('idle', () => {
      setSelectedMarker(feature);
    });

    /*
    mapboxMap.easeTo({
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

  const prepareMapData = data => {

    //set unique IDs for features in geojson sources
    const setFeatureIds = (features,prefix) => {
      for (var index in features) {
        const feature = features[index];
        const id = `${prefix}-${index}`;

        features[index] = {
          ...feature,
          properties:{
            ...feature.properties,
            unique_id:id
          }
        }
      }
      console.info("...POPULATED UNIQUE IDs FOR FEATURES IN SOURCE",prefix,features);
    }

    for (var key in data.sources) {

      const source = data.sources[key];

      if (source.type === 'geojson'){

        data.sources[key] = {
          ...data.sources[key],
          promoteId:'unique_id' //property to use for mapbox features IDs.
          //generateId:   true
        }

        setFeatureIds(source.data.features,key);
      }

    }
    return data;
  }

  //marker in URL
  useEffect(()=>{
    const sourceCollection = mapData?.sources.markers.data.features;
    const sourceFeature = (sourceCollection || []).find(feature => feature.properties.post_id === markerPostId);

    console.log("POPULATE MARKER FROM URL",sourceFeature);

    setSelectedMarker(sourceFeature);

  },[markerPostId])

  //initialize map data
  useEffect(()=>{

    if (props.mapData === undefined) return;
    const data = prepareMapData(props.mapData);
    setMapData(data);

  },[props.mapData]);



  //build features tags filter
  useEffect(()=>{
    const buildFilter = tags => {

      //no tags set
      if ( (tags || []).length === 0) return;

      //expression for each tag
      const tagFilters = tags.map(tag=>['in',tag,['get', 'tag_slugs']]) //URGENT TOU FIX

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
    if (mapboxMap === undefined) return;
    console.log("RUN GLOBAL FILTER",markersFilter);
    mapboxMap.setFilter("markers",markersFilter);
  },[markersFilter])

  useEffect(()=>{
    if (mapboxMap === undefined) return;
    setLoading(false);
  },[mapboxMap]);

  return (
    <Dimmer.Dimmable as={Container} dimmed={loading} id="map-post-container">
      <Dimmer active={loading} inverted>
        <Loader />
      </Dimmer>
      <MarkerPost
      post_id={markerPostId}
      onClose={()=>navigate(`/carte/${mapPostName}`)}
      />
      <MapSidebar
      title={props.title}
      active={true}
      features={mapData?.sources.markers.data.features}
      onFeatureClick={handleSidebarFeatureClick}
      sortMarkerBy={sortMarkerBy}
      onSortBy={handleSortBy}
      markerTagsDisabled={markerTagsDisabled}
      onDisableTags={slugs=>setMarkerTagsDisabled(slugs)}
      markerFormatsDisabled={markerFormatsDisabled}
      onDisableFormats={slugs=>setMarkerFormatsDisabled(slugs)}
      hasMarkersFilters={(markersFilter!==undefined)}
      />
      <Map/>
    </Dimmer.Dimmable>
  );
}

export default MapPost
