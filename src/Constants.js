import * as turf from "@turf/turf";

export const APP_VERSION = '113';//when updated, the local data will be cleared
const IS_LOCAL = (process.env.NODE_ENV !== 'production');
export const DEBUG = IS_LOCAL;

export const WP_URL = IS_LOCAL ? 'http://tribunaldp.local' : 'https://www.tribunaldesprejuges.org';
export const WP_FORMATS = ['aside','gallery','link','image','quote','status','video','audio','chat'];


export const MAPBOX_TOKEN = 'pk.eyJ1IjoiZ29yZGllbGFjaGFuY2UiLCJhIjoiY2tmZ3N0Y2t2MG5oMjJ5bGRtYmF0Y2NscCJ9.sLVLQMjYhX9FBM_3AeuxtA';

export const setFeatureDistance = (feature,origin) => {

  const getDistance = (feature,origin) => {
    switch(feature.geometry.type){
      case 'Point':
        return turf.distance(feature.geometry,origin);//in km
      break;
      default:
        //TOUFIX URGENT
        //https://github.com/Turfjs/turf/issues/1743
        const centroid = turf.centroid(feature);
        return turf.distance(centroid.geometry,origin);//in km

    }
  }

  feature.properties.distance = getDistance(feature,origin);
}

export const getDistanceFromFeatureToClosest = (feature_id,features) => {

  const feature = (features || []).find(feature => feature.properties.id === feature_id);

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

export function getFormatText(slug){

  let text = slug;

  switch(slug){
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
    case 'standard':
      text = 'texte';
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
    case 'standard':
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
