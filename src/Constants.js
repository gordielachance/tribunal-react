export const APP_VERSION = '113';//when updated, the local data will be cleared
const IS_LOCAL = (process.env.NODE_ENV !== 'production');
export const DEBUG = IS_LOCAL;

//export const WP_URL = IS_LOCAL ? 'http://tribunaldesprejuges.local' : 'https://datas.tribunaldesprejuges.org';//WIN
export const WP_URL = IS_LOCAL ? 'http://tribunaldp.local' : 'https://datas.tribunaldesprejuges.org';//LINUX


export const WP_FORMATS = ['aside','gallery','link','image','quote','status','video','audio','chat'];
export const WP_POST_ID_HOME = 948;
export const WP_POST_ID_CONTACT = 20;

export const MAPBOX_TOKEN = 'pk.eyJ1IjoiZ29yZGllbGFjaGFuY2UiLCJhIjoiY2tmZ3N0Y2t2MG5oMjJ5bGRtYmF0Y2NscCJ9.sLVLQMjYhX9FBM_3AeuxtA';

export { default as ImageLogo } from './images/logo.svg';
export { default as ImageArrow } from './images/arrow.svg';

const getWpIframeUrl = url => {
  url = new URL(url);
  url.searchParams.append('context','frontend');
  return url.href;
}

export const getWpIframePostUrl = post_id => {
  if (post_id === undefined) return;
  const url = getWpIframeUrl(WP_URL + '/?p=' + post_id);
  return url;
}

export const getMapUrl = (id,slug) => {
  return `/cartes/${id}/${slug}`;
}

export const getUniqueFeatureId = feature => {
  return `${feature.properties.source}-${feature.properties.id}`;
}

export const getFeatureUrl = (mapId,mapSlug,sourceId,featureId) => {
  const mapUrl = getMapUrl(mapId,mapSlug);
  let url = mapUrl + `/${sourceId}/${featureId}`;
  return url;
}
