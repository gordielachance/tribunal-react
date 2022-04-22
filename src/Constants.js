import * as turf from "@turf/turf";

export const APP_VERSION = '113';//when updated, the local data will be cleared
const IS_LOCAL = (process.env.NODE_ENV !== 'production');
export const DEBUG = IS_LOCAL;

export const MAPBOX_TOKEN = 'pk.eyJ1IjoiZ29yZGllbGFjaGFuY2UiLCJhIjoiY2tmZ3N0Y2t2MG5oMjJ5bGRtYmF0Y2NscCJ9.sLVLQMjYhX9FBM_3AeuxtA';
export const WP_URL = 'http://tribunaldp.local'//'http://www.tribunaldesprejuges.org';//'http://tribunaldp';



export const getMarkerUrl = feature => {
  return `/markers/${feature.properties.post_id}/${feature.properties.name}`;
}

export const getFeatureByPostId = (features,post_id) => {
  return (features || []).find(feature => {
    return (feature.properties.post_id === post_id);
  })
}

export const getFeatureIndexByPostId = (features,post_id) => {
  const index = (features || []).findIndex(feature => {
    return (feature.properties.post_id === post_id);
  })

  return (index > -1) ? index : undefined;
}

//sort features by distance (returns a new copy of the array)
export const sortFeaturesByDistance = (targetFeature,features) => {

  //target index
  const index = features.indexOf(targetFeature);
  if (index === -1){
    throw('Target not found in features collection.');
  }

  //clone set
  const collection = Array.prototype.slice.call(features);

  //remove target from set
  collection.splice(index, 1);

  //add 'distance' prop
  collection.forEach(feature => {
    feature.properties.distance = turf.distance(targetFeature.geometry, feature.geometry);//in km
  });

  return collection.sort((a, b) => {
    return a.properties.distance - b.properties.distance;
  });

}

//in km
//https://gist.github.com/jbranigan/f334f471f954d78880806451eee25bba
export const getDistanceToClosestFeature = (targetFeature,features) => {
  const featuresByDistance = sortFeaturesByDistance(targetFeature,features);
  const match = featuresByDistance[0];
  return match?.properties.distance;
}

export const getHumanDistance = dist => {
  return dist.toFixed(2);
}
