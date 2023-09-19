import React from "react";
import {DEBUG} from "../Constants";
import {databaseAPI} from "./connect";

export default class DatabaseAPI extends React.Component {

  static async getItems(type, params = {}) {
    const defaultParams = {};
    const mergedParams = { ...defaultParams, ...params };

    console.info(`GET '${type}' ITEMS,`,mergedParams);

    const config = {
      method: 'get',
      url: `/wp/v2/${type}`,
      params: mergedParams,
    }
    const response = await databaseAPI.request(config);

    return response.data;

  }


  static async getSingleItem(type,id,params){

    const defaultParams = {};
    const mergedParams = { ...defaultParams, ...params };

    console.info(`GET '${type}' ITEM #${id}`,mergedParams);

    const config = {
     method: 'get',
     url: `wp/v2/${type}/${id}`,
     params: mergedParams,
    }

    return databaseAPI.request(config)
    .then(resp => resp.data)
    .catch(error=>console.error(`ERROR GETTING '${type}' ITEM`,id,error))
  }

}
