export const APP_VERSION = '117';//when updated, the local data will be cleared

const IS_LOCAL = (process.env.NODE_ENV !== 'production');

const FORCE_REMOTE_DB = true;
export const DEBUG = IS_LOCAL;

export const WP_URL = (IS_LOCAL && !FORCE_REMOTE_DB) ? 'http://tribunaldp.local' : 'https://www.tribunaldesprejuges.org/datas';
export const STRAPI_URL = 'http://localhost:1337';


export const WP_POST_ID_HOME = 948;
export const WP_POST_ID_CONTACT = 20;
export const WP_CAT_ID_EVENT = 91;
export const WP_CAT_ID_CREATION = 89;

export const MAPBOX_TOKEN = 'pk.eyJ1IjoiZ29yZGllbGFjaGFuY2UiLCJhIjoiY2tmZ3N0Y2t2MG5oMjJ5bGRtYmF0Y2NscCJ9.sLVLQMjYhX9FBM_3AeuxtA';

export { default as ImageLogo } from './images/logo.svg';

const getWpIframeUrl = url => {
  url = new URL(url);
  url.searchParams.append('context','frontend');
  return url.href;
}

//relationship between WP taxonomies and feature properties
export const taxonomiesMap = {
  post_tag:'tags',
  category:'categories',
  tdp_format:'formats',
  tdp_area:'areas'
}
export const getTaxonomyFromPropertyName = name => {
  for (const taxonomy in taxonomiesMap) {
    if (taxonomiesMap.hasOwnProperty(taxonomy) && taxonomiesMap[taxonomy] === name) {
      return taxonomy;
    }
  }
  return null;
}
export const getPropertyNameFromTaxonomy = taxonomy => {
  for (const prop in taxonomiesMap) {
    if (taxonomiesMap.hasOwnProperty(prop) && prop === taxonomy) {
      return taxonomiesMap[prop];
    }
  }
  return null;
}

export const getWpIframePostUrl = post_id => {
  if (post_id === undefined) return;
  const url = getWpIframeUrl(WP_URL + '/?p=' + post_id);
  return url;
}
