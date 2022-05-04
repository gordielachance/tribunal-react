import {APP_VERSION,DEBUG} from "../Constants";
import playlistModel from  "../playlist/Playlist.Model";

export class DatabaseApiCache {

  static VERSION_KEY = 'version';
  static USER_TOKEN_KEY = 'user_token';
  static USER_PROFILE_KEY = 'user_profile';
  static USER_POSTS_KEY = 'user_posts';
  static USER_FAVPOSTS_KEY = 'user_favposts';
  static POSTS_LAYOUT_KEY = 'playlists_layout';

  static setLocalVersion(): void {
    console.log("Store version",APP_VERSION);
    localStorage.setItem(this.VERSION_KEY, APP_VERSION);
  }

  static getLocalVersion(): string | null {
    return localStorage.getItem(this.VERSION_KEY);
  }

  static setUserToken(token: string): void {
    if(!token) return;
    DEBUG && console.log("Store user token",token);
    localStorage.setItem(this.USER_TOKEN_KEY, token);
  }

  static getUserToken(): string | null {
    return localStorage.getItem(this.USER_TOKEN_KEY);
  }

  static setLocalUser(user: object): void {
    if(!user) return;
    DEBUG && console.log("Store local user",user);
    localStorage.setItem(this.USER_PROFILE_KEY,JSON.stringify(user));
  }

  static getLocalUser(): string | null {
    return JSON.parse(localStorage.getItem(this.USER_PROFILE_KEY)) || undefined;
  }

  static setLocalPosts(posts: array): void {
    if(!posts) return;
    const jspfs = posts.map(function(post){
      return {...post};
    })
    DEBUG && console.log("Store local posts",jspfs);
    localStorage.setItem(this.USER_POSTS_KEY,JSON.stringify(jspfs));
  }

  static getLocalPosts(): string | null {
    const jspfs = JSON.parse(localStorage.getItem(this.USER_POSTS_KEY)) || undefined;
    if (!jspfs) return;
    return jspfs.map(function(jspf){
      return new playlistModel(jspf);
    })
  }

  static setLocalPlaylistLayout(layoutName: string): void {
    if(!layoutName) return;
    localStorage.setItem(this.POSTS_LAYOUT_KEY, layoutName);
  }

  static getLocalPlaylistLayout(): string | null {
    return localStorage.getItem(this.POSTS_LAYOUT_KEY);
  }

  static clearDatabaseApiCache(): void {
    console.log("Clear local data");
    localStorage.clear();
  }

}
