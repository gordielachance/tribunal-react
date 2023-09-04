import * as turf from "@turf/turf";
import {DEBUG} from "../../Constants";

//in meters
export const setFeatureDistance = (feature,origin) => {

  const getDistance = (feature,origin) => {

    if (!feature.geometry?.type) return;

    feature = turf.centroid(feature);

    const meters = turf.distance(feature.geometry,origin) * 1000;
    return meters.toFixed(2);
  }

  feature.properties.distance = getDistance(feature,origin);
}

export const getDistanceFromFeatureToClosest = (feature_id,features) => {

  const feature = (features || []).find(feature => feature.properties.id === feature_id);

  if (feature === undefined){
    throw 'Missing feature parameter.';
  }

  return getDistanceFromOriginToClosestFeature(feature,features);
}

export const sortFeaturesByDistance = (origin,features) => {

  if (origin === undefined){
    throw "Missing 'origin' parameter.";
  }

  if (features === undefined){
    throw "Missing 'features' parameter.";
  }

  return features.map(feature=>{

    const featureCenter = turf.centroid(feature);

    const distance = turf.distance(origin,featureCenter);//km

    return {
      distance:distance,
      feature:feature
    }
  }).sort((a, b) => {
    return a.distance - b.distance;
  });
}

export const getClosestFeature = (feature,features)=>{
  if (features === undefined){
    throw 'Missing features parameter.';
  }

  const origin = feature.geometry.coordinates;

  //clone set, we don't want to alter the original data
  const distanceFeatures =  JSON.parse(JSON.stringify(features || []));

  //remove the current feature from the set (using its UNIQUE id)
  const featureIndex = feature.properties.id;
  const collectionIndex = distanceFeatures.findIndex(feature=>feature.properties.id === featureIndex);
  distanceFeatures.splice(collectionIndex, 1);

  //add 'distance' prop
  distanceFeatures.forEach(feature => {
    setFeatureDistance(feature,origin);
  });

  //sort by distance
  const sorted = [...distanceFeatures].sort((a, b) => {
    return a.properties.distance - b.properties.distance;
  });

  //return the original feature
  const closestFeature = sorted[0];
  const preSortedIndex = distanceFeatures.indexOf(closestFeature);
  const initialFeature = features[preSortedIndex];

  return initialFeature;
}

//in km
//https://gist.github.com/jbranigan/f334f471f954d78880806451eee25bba
export const getDistanceFromOriginToClosestFeature = (feature,features) => {
  const match = getClosestFeature(feature,features);
  return match?.properties.distance;
}

export const getHumanDistance = meters => {
  meters = parseInt(meters);//force integer
  if (meters === 0) return;

  const km = meters / 1000;
  if (km > 1){
    return km.toFixed(1) + ' km';
  }else{
    return meters.toFixed() + ' m';
  }

}

export function getFormatText(slug){

  let text;

  switch(slug){
    case false:
      text='autre';
    break;
    case 'gallery':
      text='gallerie';
    break;
    case 'link':
      text='lien';
    break;
    case 'quote':
      text='citation';
    break;
    case 'video':
      text='vidéo';
    break;
    case 'audio':
      text='audio';
    break;
    case 'standard':
      //nothing
    break;
    default:
      text = slug;
    break;
  }

  if (!text) return;

  return text.charAt(0).toUpperCase() + text.slice(1);

}

export function getFormatIcon(slug){
  switch(slug){
    case 'gallery':
      return 'images outline';
    break;
    case 'link':
      return 'linkify';
    break;
    case 'image':
      return 'image outline';
    break;
    case 'quote':
      return 'quote left';
    break;
    case 'video':
      return 'video';
    break;
    case 'audio':
      return 'volume down';
    break;
    default:
      return 'bars';
    break;
  }
}

// Because features come from tiled vector data,
// feature geometries may be split
// or duplicated across tile boundaries.
// As a result, features may appear
// multiple times in query results.
//https://docs.mapbox.com/mapbox-gl-js/example/query-similar-features/
export function getUniqueMapFeatures(features){
  const uniqueIds = new Set();
  const uniqueFeatures = [];
  for (const feature of features) {
    const id = feature.id;
    if (!uniqueIds.has(id)) {
      uniqueIds.add(id);
      uniqueFeatures.push(feature);
    }
  }
  return uniqueFeatures;
}

//checks if a source contains features
export const isFeaturesSource = source => {
  return (source.data?.type === 'FeatureCollection');
}

export const getFeaturesFormats = features => {
  let arr = [];

  (features || []).forEach(feature => {
    const format = feature.properties.format;
    arr.push(format);
  });
  arr = [...new Set(arr)];

  //move standard at the end
  const standardFormatIndex = arr.findIndex(format => format.slug === 'standard');

  if (standardFormatIndex !== -1) {
    arr.push(arr.splice(standardFormatIndex, 1)[0]);
  }

  return arr;

}

export const bboxToCircle = bbox => {

  //bbox to polygon
  const polygon = turf.bboxPolygon(bbox);

  //polygon center
  const polygonCenter = turf.centroid(polygon);

  //from the bbox; get the distance to the farest corner
  const diag = [[bbox[0],bbox[1]],[bbox[2],bbox[3]]];
  const diagDistances = diag.map(point => turf.distance(polygonCenter,point) ).sort((a, b) => {
    return b - a;
  });

  const radius = diagDistances[0];
  return turf.circle(polygonCenter, radius);
}
