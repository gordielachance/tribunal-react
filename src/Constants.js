export const APP_VERSION = '114';//when updated, the local data will be cleared

const IS_LOCAL = (process.env.NODE_ENV !== 'production');

const FORCE_REMOTE_DB = false;
export const DEBUG = IS_LOCAL;

export const WP_URL = (IS_LOCAL && !FORCE_REMOTE_DB) ? 'http://tribunaldp.local' : 'https://datas.tribunaldesprejuges.org';

export const WP_FORMATS = ['aside','gallery','link','image','quote','status','video','audio','chat'];
export const WP_POST_ID_HOME = 948;
export const WP_POST_ID_CONTACT = 20;
export const WP_TAG_ID_EVENT = 83;
export const WP_TAG_ID_CREATION = 88;

export const MAPBOX_TOKEN = 'pk.eyJ1IjoiZ29yZGllbGFjaGFuY2UiLCJhIjoiY2tmZ3N0Y2t2MG5oMjJ5bGRtYmF0Y2NscCJ9.sLVLQMjYhX9FBM_3AeuxtA';

export { default as ImageLogo } from './images/logo.svg';

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

//sometime we parse features from mapbox, sometimes from wordpress.
//It seems that from mapbox, some properties are rendered as strings while it should be objects.
export function maybeDecodeJson(value){
  return (typeof value === 'string') ? JSON.parse(value) : value;
}
