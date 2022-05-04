import React from "react";
import {DEBUG} from "../Constants";
import {databaseAPI} from "./connect";

export default class DatabaseAPI extends React.Component {

  static async getTags(){
    const config = {
     method: 'get',
     url: `/wp/v2/tags`,
    }
    return databaseAPI.request(config)
    .then(resp => resp.data)
  }

  static async getMaps(){

    const config = {
     method: 'get',
     url: `/wp/v2/maps`,
    }
    return databaseAPI.request(config)
    .then(resp => resp.data)
  }

  static async getPostByID(post_id) {

    if (!post_id){
      throw("Missing 'post_id' parameter.");
    }

    const config = {
     method: 'get',
     url: `/soundsystem/v2/post/${post_id}`,
    }

    return databaseAPI.request(config)
    .then(resp => resp.data)
    .then(function(item){
      return item;
    })
  }

}
