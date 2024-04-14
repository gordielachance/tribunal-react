import React from "react";
import {DEBUG} from "../Constants";
import {strapiAPI} from "./connect";

export default class StrapiAPI extends React.Component {

  static async getFeatures(params = {}){
    const defaultParams = {};
    const mergedParams = {
      ...defaultParams,
      ...params
    };

    console.info(`GET FEATURES`,mergedParams);

    const config = {
     method: 'get',
     url: `/features`,
     params: mergedParams
    }
    return strapiAPI.request(config)
    .then(resp => resp.data)
  }

}
