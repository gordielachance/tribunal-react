import * as turf from "@turf/turf";

export const APP_VERSION = '113';//when updated, the local data will be cleared
const IS_LOCAL = (process.env.NODE_ENV !== 'production');
export const DEBUG = IS_LOCAL;

export const MAPBOX_TOKEN = 'pk.eyJ1IjoiZ29yZGllbGFjaGFuY2UiLCJhIjoiY2tmZ3N0Y2t2MG5oMjJ5bGRtYmF0Y2NscCJ9.sLVLQMjYhX9FBM_3AeuxtA';
export const WP_URL = 'http://tribunaldp.local'//'http://www.tribunaldesprejuges.org';//'http://tribunaldp';



export const getMarkerUrl = feature => {
  return `/markers/${feature.properties.post_id}/${feature.properties.name}`;
}

export const getFeatureById = (features,id) => {
  return (features || []).find(feature => feature.properties.unique_id === id)
}

export const setFeatureDistance = (feature,origin) => {
  feature.properties.distance = turf.distance(feature.geometry,origin);//in km
}

export const getDistanceFromFeatureToClosest = (feature_id,features) => {

  const feature = getFeatureById(features,feature_id);

  if (feature === undefined){
    throw 'Missing feature parameter.';
  }

  //remove the current feature from the set
  features = Array.prototype.slice.call(features);
  const index = features.indexOf(feature);
  features.splice(index, 1);

  const origin = feature.geometry;
  return getDistanceFromOriginToClosestFeature(origin,features);
}

//in km
//https://gist.github.com/jbranigan/f334f471f954d78880806451eee25bba
export const getDistanceFromOriginToClosestFeature = (origin,features) => {

  if (features === undefined){
    throw 'Missing features parameter.';
  }

  //clone set
  features = Array.prototype.slice.call(features);

  //add 'distance' prop
  features.forEach(feature => {
    setFeatureDistance(feature,origin);
  });

  //sort by distance
  const sorted = features.sort((a, b) => {
    return a.properties.distance - b.properties.distance;
  });

  const match = sorted[0];
  return match?.properties.distance;
}

export const getHumanDistance = dist => {
  return dist.toFixed(2);
}
