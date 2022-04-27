import * as turf from "@turf/turf";

export const APP_VERSION = '113';//when updated, the local data will be cleared
const IS_LOCAL = (process.env.NODE_ENV !== 'production');
export const DEBUG = IS_LOCAL;

export const MAPBOX_TOKEN = 'pk.eyJ1IjoiZ29yZGllbGFjaGFuY2UiLCJhIjoiY2tmZ3N0Y2t2MG5oMjJ5bGRtYmF0Y2NscCJ9.sLVLQMjYhX9FBM_3AeuxtA';
export const WP_URL = 'http://tribunaldp.local'//'http://www.tribunaldesprejuges.org';//'http://tribunaldp';



export const getMarkerUrl = feature => {
  return `/markers/${feature.properties.post_id}/${feature.properties.name}`;
}

export const getFeatureId = feature => {
  return feature.properties.unique_id;
}

export const getFeatureById = (features,id) => {
  return (features || []).find(feature => getFeatureId(feature) === id)
}

export const setFeatureDistance = (feature,origin) => {
  feature.properties.distance = turf.distance(feature.geometry,origin);//in km
}

//sort features by distance (returns a new copy of the array)
export const sortFeaturesByDistance = (features,origin) => {

  if (features === undefined) return;

  //clone set
  const collection = Array.prototype.slice.call(features);

  //add 'distance' prop
  collection.forEach(feature => {
    setFeatureDistance(feature,origin);
  });

  return collection.sort((a, b) => {
    return a.properties.distance - b.properties.distance;
  });

}

//in km
//https://gist.github.com/jbranigan/f334f471f954d78880806451eee25bba
export const getDistanceToClosestFeature = (origin,features) => {
  const featuresByDistance = sortFeaturesByDistance(features,origin);
  const match = featuresByDistance[0];
  return match?.properties.distance;
}

export const getHumanDistance = dist => {
  return dist.toFixed(2);
}
