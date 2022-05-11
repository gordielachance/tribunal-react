import * as turf from "@turf/turf";

export const APP_VERSION = '113';//when updated, the local data will be cleared
const IS_LOCAL = (process.env.NODE_ENV !== 'production');
export const DEBUG = IS_LOCAL;

export const WP_URL = IS_LOCAL ? 'http://tribunaldp.local' : 'https://www.tribunaldesprejuges.org';
export const WP_FORMATS = ['aside','gallery','link','image','quote','status','video','audio','chat'];
export const WP_POST_ID_HOME = 948;
export const WP_POST_ID_AGENDA = 18;
export const WP_POST_ID_CONTACT = 20;

export const MAPBOX_TOKEN = 'pk.eyJ1IjoiZ29yZGllbGFjaGFuY2UiLCJhIjoiY2tmZ3N0Y2t2MG5oMjJ5bGRtYmF0Y2NscCJ9.sLVLQMjYhX9FBM_3AeuxtA';

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

export const getClosestFeature = (feature,features)=>{
  if (features === undefined){
    throw 'Missing features parameter.';
  }

  const origin = feature.geometry.coordinates;

  //clone set, we don't want to alter the original data
  features = Array.prototype.slice.call(features);

  //remove the current feature from the set
  const index = features.indexOf(feature);
  features.splice(index, 1);

  //add 'distance' prop
  features.forEach(feature => {
    setFeatureDistance(feature,origin);
  });

  //sort by distance
  const sorted = features.sort((a, b) => {
    return a.properties.distance - b.properties.distance;
  });

  return sorted[0];
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
    case 'audio':
      text='audio';
    break;
    default:
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

export const getMapUrl = (id,slug) => {
  return `/carte/${id}/${slug}`;
}

export const getMarkerUrl = (mapId,mapSlug,markerId,markerSlug) => {
  const mapUrl = getMapUrl(mapId,mapSlug);
  return mapUrl + `/creation/${markerId}/${markerSlug}`;
}

export const getWpIframeUrl = url => {
  url = new URL(url);
  url.searchParams.append('context','frontend');
  return url.href;
}

export const getWpIframePostUrl = post_id => {
  if (post_id === undefined) return;
  const url = getWpIframeUrl(WP_URL + '/?p=' + post_id);
  return url;
}

export const getFeaturesTags = features => {
  let arr = [];

  (features || []).forEach(feature => {
    const tags = feature.properties.tag_slugs || [];
    arr = arr.concat(tags);
  });

  return [...new Set(arr)];
}

export const getIdsForTag = (tag,features) => {
  features = (features || []).filter(feature => (feature.properties.tag_slugs || []).includes(tag));
  return features.map(feature=>feature.properties.id);
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

export const getIdsForFormat = (format,features) => {
  features = (features || []).filter(feature => format === feature.properties.format);
  return features.map(feature=>feature.properties.id);
}
