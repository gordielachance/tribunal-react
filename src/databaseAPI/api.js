import React from "react";
import {DEBUG} from "../Constants";
import {databaseAPI} from "./connect";

export default class DatabaseAPI extends React.Component {

  static async getTags(){
    const config = {
     method: 'get',
     url: `/wp/v2/tags`,
     params:{
       per_page:10000
     }
    }
    return databaseAPI.request(config)
    .then(resp => resp.data)
    .catch(error=>console.error("ERROR GETTING TAGS",error))
  }

  static async getMaps(){

    const config = {
     method: 'get',
     url: `/wp/v2/maps`,
    }
    return databaseAPI.request(config)
    .then(resp => resp.data)
    .catch(error=>console.error("ERROR GETTING MAPS",error))
  }

  static async getCreations(){

    const config = {
     method: 'get',
     url: `/wp/v2/creations`,
    }
    return databaseAPI.request(config)
    .then(resp => resp.data)
    .catch(error=>console.error("ERROR GETTING CREATIONS",error))
  }

  static async getEvents(){

    const config = {
     method: 'get',
     url: `/wp/v2/agenda`,
    }
    return databaseAPI.request(config)
    .then(resp => resp.data)
    .catch(error=>console.error("ERROR GETTING EVENTS",error))
  }

  static async getMapPost(post_id){

    const config = {
     method: 'get',
     url: `wp/v2/maps/${post_id}`,
    }

    return databaseAPI.request(config)
    .then(resp => resp.data)
    .catch(error=>console.error("ERROR GETTING MAP",post_id,error))
  }


}
