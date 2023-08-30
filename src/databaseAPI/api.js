import React from "react";
import {DEBUG} from "../Constants";
import {databaseAPI} from "./connect";

export default class DatabaseAPI extends React.Component {

  static async getPaginatedItems(type,page,perPage){

    console.info(`GET '${type}' ITEMS, PAGE: ${page}, PER_PAGE: ${perPage}`);

    const config = {
      method: 'get',
      url: `/wp/v2/${type}`,
      params: {
        page: page ?? 1,
        per_page: perPage ?? 10,
      },
    }
    return databaseAPI.request(config)
  }

  static async getItems(type,perPage) {
    let page = 1;
    let posts = [];
    perPage = perPage ?? 10;

    console.info(`GET '${type}' ITEMS, PER_PAGE: ${perPage}`);

    while (true) {
      try {
        const request = await DatabaseAPI.getPaginatedItems(type,page,perPage);
        const pageItems = request.data;

        if (pageItems.length === 0) {
          // No more posts to fetch
          break;
        }

        posts = posts.concat(pageItems);
        page++;
      } catch (error) {
        console.error(`ERROR GETTING '${type}' ITEMS`, type, error);
        break; // Exit the loop on error
      }
    }

    return posts;
  }

  static async getSingleItem(type,id){

    const config = {
     method: 'get',
     url: `wp/v2/${type}/${id}`,
    }

    return databaseAPI.request(config)
    .then(resp => resp.data)
    .catch(error=>console.error(`ERROR GETTING '${type}' ITEM`,id,error))
  }

}
