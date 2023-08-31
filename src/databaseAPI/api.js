import React from "react";
import {DEBUG} from "../Constants";
import {databaseAPI} from "./connect";

export default class DatabaseAPI extends React.Component {

  static async getPaginatedItems(type, params = {}) {
    const defaultParams = { page: 1, per_page: 10 };
    const mergedParams = { ...defaultParams, ...params };

    console.info(`GET '${type}' ITEMS,`,mergedParams);

    const config = {
      method: 'get',
      url: `/wp/v2/${type}`,
      params: mergedParams,
    }
    return databaseAPI.request(config)
  }

  static async getItems(type, params = {}) {
    const defaultParams = { page: 1, per_page: 10 };
    const mergedParams = { ...defaultParams, ...params };

    let items = [];

    console.info(`GET '${type}' ITEMS`,mergedParams);

    while (true) {
      try {
        const request = await DatabaseAPI.getPaginatedItems(type,mergedParams);
        const pageItems = request.data;

        if (pageItems.length === 0) {
          // No more items to fetch
          break;
        }

        items = items.concat(pageItems);
        mergedParams.page++;
      } catch (error) {
        console.error(`ERROR GETTING '${type}' ITEMS`, type,mergedParams,error);
        break; // Exit the loop on error
      }
    }

    //merge paginated feature into a single collection
    if (type === 'features' && params.geojson){

      const mergePaginatedCollections = pages => {
          const features = [];

          for (const collection of pages) {
              features.push(...collection.features);
          }

          return {
              type: 'FeatureCollection',
              features: features
          };
      }

      items = mergePaginatedCollections(items);
    }

    return items;
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
