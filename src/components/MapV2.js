import React, { useRef, useEffect,useState }  from "react";
import ReactDOM from 'react-dom';

import mapboxgl from 'mapbox-gl';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';
import * as turf from "@turf/turf";

import axios from 'axios';
import './Map.scss';
import { useMap } from '../MapContext';

const MAPBOX_TOKEN = 'pk.eyJ1IjoiZ29yZGllbGFjaGFuY2UiLCJhIjoiY2tmZ3N0Y2t2MG5oMjJ5bGRtYmF0Y2NscCJ9.sLVLQMjYhX9FBM_3AeuxtA';
const WP_URL = 'https://www.tribunaldesprejuges.org';


export const Map = (props) => {

  const {
    mapboxMap,
    setMapboxMap,
  } = useMap();

  const mapContainerRef = useRef(null);
  const [map,setMap] = useState(undefined);

  const mapSources = {
    markers:{
      "type":"geojson",
      "data":WP_URL + "/wp-json/geoposts/v1/geojson/markers"
    },
    rasters:{
      "type":"geojson",
      "data":WP_URL + "/wp-json/geoposts/v1/geojson/rasters"
    },
    basemap: {
      'type': 'raster',
      'tiles': [
        'https://stamen-tiles-d.a.ssl.fastly.net/toner/{z}/{x}/{y}.png'
      ],
      'tileSize': 256,
      'paint' : {
        "raster-opacity" : 0.5
      }
    }
  };

  const mapGeoJson = {};

  const mapLayers = {
    basemap:{
      'id': 'basemap',
      'type': 'raster',
      'source': 'basemap',
      'minzoom': 0,
      'maxzoom': 22
    },
    markers:{
      'id': 'markers',
      'type': 'circle',
      'source': 'markers',
      'layout': {
        // get the title name from the source's "title" property
        /*
        'text-field': ['get', 'title'],
        'text-font': [
          'Open Sans Semibold',
          'Arial Unicode MS Bold'
        ],
        'text-offset': [0, 1.25],
        'text-anchor': 'top'
        */
      }
    }

  }

  /*
  Get JSONs from 'data' url and replace it with the loaded content.
  So we can access de geoJSON data without the need of mapbox.
  */

  const fetchGeoJsons = async (sources) => {

    return new Promise((resolve, reject) => {

      let sourceLoadedCount = 0;

      for (var key in sources) {
        const source = sources[key];

        if (source.type!=='geojson') continue;

        axios.get(
          source.data, //URL
          {
            headers: {
              'Content-Type': 'application/json'
            }
        })
        .then(function (response) {
          mapGeoJson[key] = response.data; //fill geojson obj
          source.data = response.data; //replace URL by geojson data
          sourceLoadedCount = sourceLoadedCount + 1;

          if (sourceLoadedCount === Object.keys(sources).length){
            resolve(sources);
          }
        })
        .catch((error) => {// error
          reject(error);
        })
      };

    })
  }

  const initSources = async() => {

    //when a specific source has been loaded
    map.on('sourcedata', (e) => {
      const source = e.source;
      if (!e.isSourceLoaded) return;
      if (source.type === 'image') return;
      console.log("SOURCE DATA LOADED",e.sourceId,source);
    });


    return new Promise((resolve, reject) => {
      //load geoJSON data
      const geoJsonSources = Object.entries(mapSources).reduce((acc, [key, source]) =>{
        if (source.type==='geojson'){
          acc[key] = source;
        }
        return acc;
      }, {});

      fetchGeoJsons(geoJsonSources)
      .then(function (response) {
        console.log("GEOJSON LOADED",response);

        mapSources.annotationsPolygons  = {
            "type": "geojson",
            "data": {
                "type": "FeatureCollection",
                "name": "Polygons",
                "features": [
                    {
                        "type": "Feature",
                        "properties": {
                            "post_id": 729,
                            "id": "annotationsPolygons-94",
                            "title": "Maison",
                            "excerpt": "",
                            "post_type": "tdp_annotation",
                            "tag_slugs": [
                                "home",
                                "prives",
                                "trajets"
                            ],
                            "slug": "729-2",
                            "timestamp": 1587204102,
                            "date_human": "avril 18, 2020",
                            "author": 3,
                            "author_name": "casimir",
                            "has_more": false,
                            "image_url": WP_OLD_URL + "/wordpress/wp-content/uploads/2020/04/FOR7-150x150.png",
                            "image_bbox": [
                                4.328016146125,
                                50.830879773158,
                                4.3344193374768,
                                50.828020058555
                            ],
                            "target_id": 101,
                            "minzoom": 15,
                            "image_layer": "annotation-raster-layer-729"
                        },
                        "geometry": {
                            "type": "Polygon",
                            "coordinates": [
                                [
                                    [
                                        4.325848651256363,
                                        50.873507065182125
                                    ],
                                    [
                                        4.325992948066508,
                                        50.87365323423857
                                    ],
                                    [
                                        4.32627774440232,
                                        50.873619687282535
                                    ],
                                    [
                                        4.326296730824708,
                                        50.873483102997994
                                    ],
                                    [
                                        4.326220785135158,
                                        50.87338006546583
                                    ],
                                    [
                                        4.326076488325014,
                                        50.8732914050814
                                    ],
                                    [
                                        4.325860043109795,
                                        50.87329380131022
                                    ],
                                    [
                                        4.325848651256363,
                                        50.873507065182125
                                    ]
                                ]
                            ]
                        }
                    },
                    {
                        "type": "Feature",
                        "properties": {
                            "post_id": 636,
                            "id": "annotationsPolygons-2",
                            "title": "Insécurité",
                            "excerpt": "",
                            "post_type": "tdp_annotation",
                            "tag_slugs": [
                                "home",
                                "non-frequentes"
                            ],
                            "slug": "636-2",
                            "timestamp": 1587144756,
                            "date_human": "avril 17, 2020",
                            "author": 3,
                            "author_name": "casimir",
                            "has_more": false,
                            "image_url": WP_OLD_URL + "/wordpress/wp-content/uploads/2020/04/JETTE28-150x150.png",
                            "image_bbox": [
                                4.3322070312702,
                                50.8727500135,
                                4.3428790168564,
                                50.867988001671
                            ],
                            "target_id": 2,
                            "minzoom": 11,
                            "image_layer": "annotation-raster-layer-636"
                        },
                        "geometry": {
                            "type": "Polygon",
                            "coordinates": [
                                [
                                    [
                                        4.335019093269534,
                                        50.871137145529154
                                    ],
                                    [
                                        4.339545456366717,
                                        50.872785798044184
                                    ],
                                    [
                                        4.340335291538039,
                                        50.87111797480808
                                    ],
                                    [
                                        4.336203846026515,
                                        50.86805055788078
                                    ],
                                    [
                                        4.335201362924455,
                                        50.8685873704143
                                    ],
                                    [
                                        4.335019093269534,
                                        50.871137145529154
                                    ]
                                ]
                            ]
                        }
                    },
                    {
                        "type": "Feature",
                        "properties": {
                            "post_id": 637,
                            "id": "annotationsPolygons-3",
                            "title": "Local scout",
                            "excerpt": "",
                            "post_type": "tdp_annotation",
                            "tag_slugs": [
                                "activites",
                                "home"
                            ],
                            "slug": "637-2",
                            "timestamp": 1587144764,
                            "date_human": "avril 17, 2020",
                            "author": 3,
                            "author_name": "casimir",
                            "has_more": false,
                            "image_url": WP_OLD_URL + "/wordpress/wp-content/uploads/2020/04/JETTE27-150x150.png",
                            "image_bbox": [
                                4.333884242463,
                                50.873804418087,
                                4.3365522388596,
                                50.87261398767
                            ],
                            "target_id": 3,
                            "minzoom": 13,
                            "image_layer": "annotation-raster-layer-637"
                        },
                        "geometry": {
                            "type": "Polygon",
                            "coordinates": [
                                [
                                    [
                                        4.334062177581203,
                                        50.87357176301776
                                    ],
                                    [
                                        4.334578608270144,
                                        50.873552593298044
                                    ],
                                    [
                                        4.335748171889215,
                                        50.873696366003685
                                    ],
                                    [
                                        4.336401304819345,
                                        50.87367719633523
                                    ],
                                    [
                                        4.336462061370986,
                                        50.87315961230639
                                    ],
                                    [
                                        4.335793739302946,
                                        50.87300625297177
                                    ],
                                    [
                                        4.334852012752525,
                                        50.87291998812428
                                    ],
                                    [
                                        4.334153312408664,
                                        50.87260368231752
                                    ],
                                    [
                                        4.334062177581203,
                                        50.87357176301776
                                    ]
                                ]
                            ]
                        }
                    },
                    {
                        "type": "Feature",
                        "properties": {
                            "post_id": 729,
                            "id": "annotationsPolygons-93",
                            "title": "Maison",
                            "excerpt": "",
                            "post_type": "tdp_annotation",
                            "tag_slugs": [
                                "home",
                                "prives",
                                "trajets"
                            ],
                            "slug": "729-2",
                            "timestamp": 1587204102,
                            "date_human": "avril 18, 2020",
                            "author": 3,
                            "author_name": "casimir",
                            "has_more": false,
                            "image_url": WP_OLD_URL + "/wordpress/wp-content/uploads/2020/04/FOR7-150x150.png",
                            "image_bbox": [
                                4.328016146125,
                                50.830879773158,
                                4.3344193374768,
                                50.828020058555
                            ],
                            "target_id": 100,
                            "minzoom": 15,
                            "image_layer": "annotation-raster-layer-729"
                        },
                        "geometry": {
                            "type": "Polygon",
                            "coordinates": [
                                [
                                    [
                                        4.327709320650341,
                                        50.8748704931657
                                    ],
                                    [
                                        4.3278004554778,
                                        50.87499509267946
                                    ],
                                    [
                                        4.327952346856901,
                                        50.87500467724365
                                    ],
                                    [
                                        4.328089049098091,
                                        50.87491122765878
                                    ],
                                    [
                                        4.328089049098091,
                                        50.87469557405545
                                    ],
                                    [
                                        4.327944752287945,
                                        50.87460691617353
                                    ],
                                    [
                                        4.32778526633989,
                                        50.87460691617353
                                    ],
                                    [
                                        4.327671347805565,
                                        50.87470755483737
                                    ],
                                    [
                                        4.327709320650341,
                                        50.8748704931657
                                    ]
                                ]
                            ]
                        }
                    },
                    {
                        "type": "Feature",
                        "properties": {
                            "post_id": 729,
                            "id": "annotationsPolygons-95",
                            "title": "Maison",
                            "excerpt": "",
                            "post_type": "tdp_annotation",
                            "tag_slugs": [
                                "home",
                                "prives",
                                "trajets"
                            ],
                            "slug": "729-2",
                            "timestamp": 1587204102,
                            "date_human": "avril 18, 2020",
                            "author": 3,
                            "author_name": "casimir",
                            "has_more": false,
                            "image_url": WP_OLD_URL + "/wordpress/wp-content/uploads/2020/04/FOR7-150x150.png",
                            "image_bbox": [
                                4.328016146125,
                                50.830879773158,
                                4.3344193374768,
                                50.828020058555
                            ],
                            "target_id": 99,
                            "minzoom": 14,
                            "image_layer": "annotation-raster-layer-729"
                        },
                        "geometry": {
                            "type": "Polygon",
                            "coordinates": [
                                [
                                    [
                                        4.326741013108576,
                                        50.87738158830081
                                    ],
                                    [
                                        4.327333389487067,
                                        50.87747742894586
                                    ],
                                    [
                                        4.327371362331842,
                                        50.87725220311732
                                    ],
                                    [
                                        4.327135930694237,
                                        50.87707968898053
                                    ],
                                    [
                                        4.326908093625586,
                                        50.87707489691206
                                    ],
                                    [
                                        4.326710634832756,
                                        50.87723782696365
                                    ],
                                    [
                                        4.326741013108576,
                                        50.87738158830081
                                    ]
                                ]
                            ]
                        }
                    },
                    {
                        "type": "Feature",
                        "properties": {
                            "post_id": 643,
                            "id": "annotationsPolygons-6",
                            "title": "Supermarché",
                            "excerpt": "",
                            "post_type": "tdp_annotation",
                            "tag_slugs": [
                                "home",
                                "nourriture"
                            ],
                            "slug": "643-2",
                            "timestamp": 1587144966,
                            "date_human": "avril 17, 2020",
                            "author": 3,
                            "author_name": "casimir",
                            "has_more": false,
                            "image_url": WP_OLD_URL + "/wordpress/wp-content/uploads/2020/04/JETTE22-150x150.png",
                            "image_bbox": [
                                4.3261939343174,
                                50.878801511123,
                                4.3299291292726,
                                50.877135078722
                            ],
                            "target_id": 6,
                            "minzoom": 13,
                            "image_layer": "annotation-raster-layer-643"
                        },
                        "geometry": {
                            "type": "Polygon",
                            "coordinates": [
                                [
                                    [
                                        4.328396629140768,
                                        50.8787137555952
                                    ],
                                    [
                                        4.328730790174787,
                                        50.878234563112386
                                    ],
                                    [
                                        4.327893784792657,
                                        50.877144662854505
                                    ],
                                    [
                                        4.327120741556326,
                                        50.87764994161023
                                    ],
                                    [
                                        4.328396629140768,
                                        50.8787137555952
                                    ]
                                ]
                            ]
                        }
                    },
                    {
                        "type": "Feature",
                        "properties": {
                            "post_id": 644,
                            "id": "annotationsPolygons-7",
                            "title": "Ecole",
                            "excerpt": "",
                            "post_type": "tdp_annotation",
                            "tag_slugs": [
                                "activites",
                                "home",
                                "scolaires"
                            ],
                            "slug": "644-2",
                            "timestamp": 1587144972,
                            "date_human": "avril 17, 2020",
                            "author": 3,
                            "author_name": "casimir",
                            "has_more": false,
                            "image_url": WP_OLD_URL + "/wordpress/wp-content/uploads/2020/04/JETTE21-150x150.png",
                            "image_bbox": [
                                4.3275401169854,
                                50.878027305404,
                                4.3312753119405,
                                50.876360845317
                            ],
                            "target_id": 7,
                            "minzoom": 12,
                            "image_layer": "annotation-raster-layer-644"
                        },
                        "geometry": {
                            "type": "Polygon",
                            "coordinates": [
                                [
                                    [
                                        4.329140896898358,
                                        50.878057260644816
                                    ],
                                    [
                                        4.329733273276848,
                                        50.877673901652
                                    ],
                                    [
                                        4.33046235189653,
                                        50.87708927311599
                                    ],
                                    [
                                        4.329930732069679,
                                        50.87641837887321
                                    ],
                                    [
                                        4.328859897847023,
                                        50.87667236140122
                                    ],
                                    [
                                        4.328396629140768,
                                        50.87692634254502
                                    ],
                                    [
                                        4.329140896898358,
                                        50.878057260644816
                                    ]
                                ]
                            ]
                        }
                    },
                    {
                        "type": "Feature",
                        "properties": {
                            "post_id": 729,
                            "id": "annotationsPolygons-98",
                            "title": "Maison",
                            "excerpt": "",
                            "post_type": "tdp_annotation",
                            "tag_slugs": [
                                "home",
                                "prives",
                                "trajets"
                            ],
                            "slug": "729-2",
                            "timestamp": 1587204102,
                            "date_human": "avril 18, 2020",
                            "author": 3,
                            "author_name": "casimir",
                            "has_more": false,
                            "image_url": WP_OLD_URL + "/wordpress/wp-content/uploads/2020/04/FOR7-150x150.png",
                            "image_bbox": [
                                4.328016146125,
                                50.830879773158,
                                4.3344193374768,
                                50.828020058555
                            ],
                            "minzoom": 14,
                            "image_layer": "annotation-raster-layer-729"
                        },
                        "geometry": {
                            "type": "Polygon",
                            "coordinates": [
                                [
                                    [
                                        4.330614243275629,
                                        50.877817661643896
                                    ],
                                    [
                                        4.33088764775801,
                                        50.877822453635986
                                    ],
                                    [
                                        4.331062322843975,
                                        50.87774578170338
                                    ],
                                    [
                                        4.331001566292334,
                                        50.87751097312506
                                    ],
                                    [
                                        4.330728161809954,
                                        50.877362420148145
                                    ],
                                    [
                                        4.33046235189653,
                                        50.877520557171835
                                    ],
                                    [
                                        4.33049273017235,
                                        50.877649941610244
                                    ],
                                    [
                                        4.330614243275629,
                                        50.877817661643896
                                    ]
                                ]
                            ]
                        }
                    },
                    {
                        "type": "Feature",
                        "properties": {
                            "post_id": 647,
                            "id": "annotationsPolygons-9",
                            "title": "Endroits favoris de Coralie",
                            "excerpt": "",
                            "post_type": "tdp_annotation",
                            "tag_slugs": [
                                "home",
                                "rencontres"
                            ],
                            "slug": "647-2",
                            "timestamp": 1587144998,
                            "date_human": "avril 17, 2020",
                            "author": 3,
                            "author_name": "casimir",
                            "has_more": false,
                            "image_url": WP_OLD_URL + "/wordpress/wp-content/uploads/2020/04/JETTE18-150x150.png",
                            "image_bbox": [
                                4.3307117111666,
                                50.878021438765,
                                4.3320457093649,
                                50.877426281214
                            ],
                            "target_id": 9,
                            "minzoom": 14,
                            "image_layer": "annotation-raster-layer-647"
                        },
                        "geometry": {
                            "type": "Polygon",
                            "coordinates": [
                                [
                                    [
                                        4.331107890257705,
                                        50.877918293374336
                                    ],
                                    [
                                        4.331533186119184,
                                        50.877913501392094
                                    ],
                                    [
                                        4.331624320946645,
                                        50.87776974169588
                                    ],
                                    [
                                        4.33164710465351,
                                        50.877568477376094
                                    ],
                                    [
                                        4.33120661965412,
                                        50.87750618110094
                                    ],
                                    [
                                        4.331047133706065,
                                        50.87767869365888
                                    ],
                                    [
                                        4.331107890257705,
                                        50.877918293374336
                                    ]
                                ]
                            ]
                        }
                    },
                    {
                        "type": "Feature",
                        "properties": {
                            "post_id": 729,
                            "id": "annotationsPolygons-99",
                            "title": "Maison",
                            "excerpt": "",
                            "post_type": "tdp_annotation",
                            "tag_slugs": [
                                "home",
                                "prives",
                                "trajets"
                            ],
                            "slug": "729-2",
                            "timestamp": 1587204102,
                            "date_human": "avril 18, 2020",
                            "author": 3,
                            "author_name": "casimir",
                            "has_more": false,
                            "image_url": WP_OLD_URL + "/wordpress/wp-content/uploads/2020/04/FOR7-150x150.png",
                            "image_bbox": [
                                4.328016146125,
                                50.830879773158,
                                4.3344193374768,
                                50.828020058555
                            ],
                            "target_id": 96,
                            "minzoom": 14,
                            "image_layer": "annotation-raster-layer-729"
                        },
                        "geometry": {
                            "type": "Polygon",
                            "coordinates": [
                                [
                                    [
                                        4.331601537239781,
                                        50.8785747902825
                                    ],
                                    [
                                        4.332110373359765,
                                        50.87852207919341
                                    ],
                                    [
                                        4.332125562497676,
                                        50.87802850882976
                                    ],
                                    [
                                        4.331214214223075,
                                        50.8779853810739
                                    ],
                                    [
                                        4.331601537239781,
                                        50.8785747902825
                                    ]
                                ]
                            ]
                        }
                    },
                    {
                        "type": "Feature",
                        "properties": {
                            "post_id": 647,
                            "id": "annotationsPolygons-97",
                            "title": "Endroits favoris de Coralie",
                            "excerpt": "",
                            "post_type": "tdp_annotation",
                            "tag_slugs": [
                                "home",
                                "rencontres"
                            ],
                            "slug": "647-2",
                            "timestamp": 1587144998,
                            "date_human": "avril 17, 2020",
                            "author": 3,
                            "author_name": "casimir",
                            "has_more": false,
                            "image_url": WP_OLD_URL + "/wordpress/wp-content/uploads/2020/04/JETTE18-150x150.png",
                            "image_bbox": [
                                4.3307117111666,
                                50.878021438765,
                                4.3320457093649,
                                50.877426281214
                            ],
                            "target_id": 90,
                            "minzoom": 13,
                            "image_layer": "annotation-raster-layer-647"
                        },
                        "geometry": {
                            "type": "Polygon",
                            "coordinates": [
                                [
                                    [
                                        4.327318200349158,
                                        50.879844630317294
                                    ],
                                    [
                                        4.328381440002858,
                                        50.87999796714968
                                    ],
                                    [
                                        4.328913059829707,
                                        50.87965295856723
                                    ],
                                    [
                                        4.328867492415978,
                                        50.879001268719584
                                    ],
                                    [
                                        4.327910576727647,
                                        50.87883834483357
                                    ],
                                    [
                                        4.327044795866777,
                                        50.8792791963869
                                    ],
                                    [
                                        4.327318200349158,
                                        50.879844630317294
                                    ]
                                ]
                            ]
                        }
                    },
                    {
                        "type": "Feature",
                        "properties": {
                            "post_id": 647,
                            "id": "annotationsPolygons-98",
                            "title": "Endroits favoris de Coralie",
                            "excerpt": "",
                            "post_type": "tdp_annotation",
                            "tag_slugs": [
                                "home",
                                "rencontres"
                            ],
                            "slug": "647-2",
                            "timestamp": 1587144998,
                            "date_human": "avril 17, 2020",
                            "author": 3,
                            "author_name": "casimir",
                            "has_more": false,
                            "image_url": WP_OLD_URL + "/wordpress/wp-content/uploads/2020/04/JETTE18-150x150.png",
                            "image_bbox": [
                                4.3307117111666,
                                50.878021438765,
                                4.3320457093649,
                                50.877426281214
                            ],
                            "target_id": 91,
                            "minzoom": 13,
                            "image_layer": "annotation-raster-layer-647"
                        },
                        "geometry": {
                            "type": "Polygon",
                            "coordinates": [
                                [
                                    [
                                        4.320012225014443,
                                        50.870638704218855
                                    ],
                                    [
                                        4.321242545185154,
                                        50.8704278235984
                                    ],
                                    [
                                        4.321303301736794,
                                        50.86973766217
                                    ],
                                    [
                                        4.320650168806663,
                                        50.869315891822126
                                    ],
                                    [
                                        4.319738820532063,
                                        50.86940216334012
                                    ],
                                    [
                                        4.319526172601323,
                                        50.87015942870162
                                    ],
                                    [
                                        4.320012225014443,
                                        50.870638704218855
                                    ]
                                ]
                            ]
                        }
                    },
                    {
                        "type": "Feature",
                        "properties": {
                            "post_id": 708,
                            "id": "annotationsPolygons-14",
                            "title": "Zone habituelle",
                            "excerpt": "",
                            "post_type": "tdp_annotation",
                            "tag_slugs": [
                                "home",
                                "quotidien",
                                "rencontres"
                            ],
                            "slug": "708-2",
                            "timestamp": 1587201943,
                            "date_human": "avril 18, 2020",
                            "author": 3,
                            "author_name": "casimir",
                            "has_more": false,
                            "image_url": WP_OLD_URL + "/wordpress/wp-content/uploads/2020/04/JETTE13-150x150.png",
                            "image_bbox": [
                                4.3212939500275,
                                50.881479027547,
                                4.3287643399378,
                                50.878146294659
                            ],
                            "target_id": 14,
                            "minzoom": 11,
                            "image_layer": "annotation-raster-layer-708"
                        },
                        "geometry": {
                            "type": "Polygon",
                            "coordinates": [
                                [
                                    [
                                        4.322093136908112,
                                        50.88072631021266
                                    ],
                                    [
                                        4.327940955003467,
                                        50.88109047747483
                                    ],
                                    [
                                        4.326908093625586,
                                        50.879212110550014
                                    ],
                                    [
                                        4.324219616215514,
                                        50.878483743818435
                                    ],
                                    [
                                        4.321865299839462,
                                        50.88026630539217
                                    ],
                                    [
                                        4.322093136908112,
                                        50.88072631021266
                                    ]
                                ]
                            ]
                        }
                    },
                    {
                        "type": "Feature",
                        "properties": {
                            "post_id": 712,
                            "id": "annotationsPolygons-15",
                            "title": "Lieu du quotidien",
                            "excerpt": "",
                            "post_type": "tdp_annotation",
                            "tag_slugs": [
                                "home",
                                "quotidien"
                            ],
                            "slug": "712-2",
                            "timestamp": 1587202274,
                            "date_human": "avril 18, 2020",
                            "author": 3,
                            "author_name": "casimir",
                            "has_more": false,
                            "image_url": WP_OLD_URL + "/wordpress/wp-content/uploads/2020/04/JETTE9-150x150.png",
                            "image_bbox": [
                                4.3302796578812,
                                50.883562834912,
                                4.3361492499536,
                                50.880944396247
                            ],
                            "target_id": 15,
                            "minzoom": 12,
                            "image_layer": "annotation-raster-layer-712"
                        },
                        "geometry": {
                            "type": "Polygon",
                            "coordinates": [
                                [
                                    [
                                        4.33100916086129,
                                        50.88275794384778
                                    ],
                                    [
                                        4.334411527753132,
                                        50.883275421278135
                                    ],
                                    [
                                        4.335687415337573,
                                        50.88218296218425
                                    ],
                                    [
                                        4.335140606372813,
                                        50.881684639002884
                                    ],
                                    [
                                        4.332862235686311,
                                        50.88155047415882
                                    ],
                                    [
                                        4.33158634810187,
                                        50.88120547707157
                                    ],
                                    [
                                        4.33100916086129,
                                        50.88275794384778
                                    ]
                                ]
                            ]
                        }
                    },
                    {
                        "type": "Feature",
                        "properties": {
                            "post_id": 714,
                            "id": "annotationsPolygons-16",
                            "title": "Parc Roi Baudouin",
                            "excerpt": "",
                            "post_type": "tdp_annotation",
                            "tag_slugs": [
                                "activites",
                                "home",
                                "rencontres"
                            ],
                            "slug": "714-2",
                            "timestamp": 1587202421,
                            "date_human": "avril 18, 2020",
                            "author": 3,
                            "author_name": "casimir",
                            "has_more": false,
                            "image_url": WP_OLD_URL + "/wordpress/wp-content/uploads/2020/04/JETTE7-150x150.png",
                            "image_bbox": [
                                4.3253945117738,
                                50.883493590652,
                                4.327528908891,
                                50.882541446748
                            ],
                            "target_id": 16,
                            "minzoom": 13,
                            "image_layer": "annotation-raster-layer-714"
                        },
                        "geometry": {
                            "type": "Polygon",
                            "coordinates": [
                                [
                                    [
                                        4.326391662936647,
                                        50.88345270389081
                                    ],
                                    [
                                        4.326685911736994,
                                        50.883503173467844
                                    ],
                                    [
                                        4.327340984056022,
                                        50.88304543201867
                                    ],
                                    [
                                        4.327090363280508,
                                        50.88257586708872
                                    ],
                                    [
                                        4.326490392333063,
                                        50.88270523749071
                                    ],
                                    [
                                        4.326019529057851,
                                        50.882489619954505
                                    ],
                                    [
                                        4.325791691989202,
                                        50.88282023310202
                                    ],
                                    [
                                        4.326391662936647,
                                        50.88345270389081
                                    ]
                                ]
                            ]
                        }
                    },
                    {
                        "type": "Feature",
                        "properties": {
                            "post_id": 729,
                            "id": "annotationsPolygons-96",
                            "title": "Maison",
                            "excerpt": "",
                            "post_type": "tdp_annotation",
                            "tag_slugs": [
                                "home",
                                "prives",
                                "trajets"
                            ],
                            "slug": "729-2",
                            "timestamp": 1587204102,
                            "date_human": "avril 18, 2020",
                            "author": 3,
                            "author_name": "casimir",
                            "has_more": false,
                            "image_url": WP_OLD_URL + "/wordpress/wp-content/uploads/2020/04/FOR7-150x150.png",
                            "image_bbox": [
                                4.328016146125,
                                50.830879773158,
                                4.3344193374768,
                                50.828020058555
                            ],
                            "minzoom": 15,
                            "image_layer": "annotation-raster-layer-729"
                        },
                        "geometry": {
                            "type": "Polygon",
                            "coordinates": [
                                [
                                    [
                                        4.319829955359522,
                                        50.88519195428988
                                    ],
                                    [
                                        4.320202089238316,
                                        50.88527819642168
                                    ],
                                    [
                                        4.320247656652048,
                                        50.884961974491226
                                    ],
                                    [
                                        4.319913495618026,
                                        50.88493322693656
                                    ],
                                    [
                                        4.319829955359522,
                                        50.88519195428988
                                    ]
                                ]
                            ]
                        }
                    },
                    {
                        "type": "Feature",
                        "properties": {
                            "post_id": 647,
                            "id": "annotationsPolygons-92",
                            "title": "Endroits favoris de Coralie",
                            "excerpt": "",
                            "post_type": "tdp_annotation",
                            "tag_slugs": [
                                "home",
                                "rencontres"
                            ],
                            "slug": "647-2",
                            "timestamp": 1587144998,
                            "date_human": "avril 17, 2020",
                            "author": 3,
                            "author_name": "casimir",
                            "has_more": false,
                            "image_url": WP_OLD_URL + "/wordpress/wp-content/uploads/2020/04/JETTE18-150x150.png",
                            "image_bbox": [
                                4.3307117111666,
                                50.878021438765,
                                4.3320457093649,
                                50.877426281214
                            ],
                            "minzoom": 14,
                            "image_layer": "annotation-raster-layer-647"
                        },
                        "geometry": {
                            "type": "Polygon",
                            "coordinates": [
                                [
                                    [
                                        4.316154183985298,
                                        50.88920204453053
                                    ],
                                    [
                                        4.316670614674239,
                                        50.88939367699857
                                    ],
                                    [
                                        4.317278180190638,
                                        50.889297860863095
                                    ],
                                    [
                                        4.317212521458815,
                                        50.888828107501006
                                    ],
                                    [
                                        4.316328859071263,
                                        50.888770868594925
                                    ],
                                    [
                                        4.316154183985298,
                                        50.88920204453053
                                    ]
                                ]
                            ]
                        }
                    },
                    {
                        "type": "Feature",
                        "properties": {
                            "post_id": 644,
                            "id": "annotationsPolygons-86",
                            "title": "Ecole",
                            "excerpt": "",
                            "post_type": "tdp_annotation",
                            "tag_slugs": [
                                "activites",
                                "home",
                                "scolaires"
                            ],
                            "slug": "644-2",
                            "timestamp": 1587144972,
                            "date_human": "avril 17, 2020",
                            "author": 3,
                            "author_name": "casimir",
                            "has_more": false,
                            "image_url": WP_OLD_URL + "/wordpress/wp-content/uploads/2020/04/JETTE21-150x150.png",
                            "image_bbox": [
                                4.3275401169854,
                                50.878027305404,
                                4.3312753119405,
                                50.876360845317
                            ],
                            "minzoom": 9,
                            "image_layer": "annotation-raster-layer-644"
                        },
                        "geometry": {
                            "type": "Polygon",
                            "coordinates": [
                                [
                                    [
                                        4.318793525675741,
                                        50.81320342946704
                                    ],
                                    [
                                        4.319435681778911,
                                        50.81300055563316
                                    ],
                                    [
                                        4.319250818658301,
                                        50.81223208615067
                                    ],
                                    [
                                        4.321858361622687,
                                        50.813154248012474
                                    ],
                                    [
                                        4.323925909682135,
                                        50.8134677788981
                                    ],
                                    [
                                        4.325677244508962,
                                        50.824458472603325
                                    ],
                                    [
                                        4.33517337112553,
                                        50.82455681165276
                                    ],
                                    [
                                        4.33400094975535,
                                        50.821526644557125
                                    ],
                                    [
                                        4.334857157892911,
                                        50.82119472789505
                                    ],
                                    [
                                        4.334779320789496,
                                        50.82037107265303
                                    ],
                                    [
                                        4.333553386410717,
                                        50.820346485706075
                                    ],
                                    [
                                        4.333008526686816,
                                        50.82114555485557
                                    ],
                                    [
                                        4.333397712203888,
                                        50.82155123088268
                                    ],
                                    [
                                        4.333981490479498,
                                        50.82397292051061
                                    ],
                                    [
                                        4.326645343482681,
                                        50.823849995129166
                                    ],
                                    [
                                        4.325049682862682,
                                        50.81342474537175
                                    ],
                                    [
                                        4.324368608207805,
                                        50.81271161259096
                                    ],
                                    [
                                        4.323239970208295,
                                        50.81253947546085
                                    ],
                                    [
                                        4.32224754713976,
                                        50.8127607945116
                                    ],
                                    [
                                        4.318360556787999,
                                        50.81142672013806
                                    ],
                                    [
                                        4.318793525675741,
                                        50.81320342946704
                                    ]
                                ]
                            ]
                        }
                    },
                    {
                        "type": "Feature",
                        "properties": {
                            "post_id": 729,
                            "id": "annotationsPolygons-95",
                            "title": "Maison",
                            "excerpt": "",
                            "post_type": "tdp_annotation",
                            "tag_slugs": [
                                "home",
                                "prives",
                                "trajets"
                            ],
                            "slug": "729-2",
                            "timestamp": 1587204102,
                            "date_human": "avril 18, 2020",
                            "author": 3,
                            "author_name": "casimir",
                            "has_more": false,
                            "image_url": WP_OLD_URL + "/wordpress/wp-content/uploads/2020/04/FOR7-150x150.png",
                            "image_bbox": [
                                4.328016146125,
                                50.830879773158,
                                4.3344193374768,
                                50.828020058555
                            ],
                            "minzoom": 14,
                            "image_layer": "annotation-raster-layer-729"
                        },
                        "geometry": {
                            "type": "Polygon",
                            "coordinates": [
                                [
                                    [
                                        4.319445411416837,
                                        50.81367372451104
                                    ],
                                    [
                                        4.319917298856288,
                                        50.813756717262535
                                    ],
                                    [
                                        4.320116756433787,
                                        50.81341245007122
                                    ],
                                    [
                                        4.319547572615069,
                                        50.81333867820008
                                    ],
                                    [
                                        4.319445411416837,
                                        50.81367372451104
                                    ]
                                ]
                            ]
                        }
                    },
                    {
                        "type": "Feature",
                        "properties": {
                            "post_id": 725,
                            "id": "annotationsPolygons-22",
                            "title": "Le Brass",
                            "excerpt": "",
                            "post_type": "tdp_annotation",
                            "tag_slugs": [
                                "activites",
                                "home",
                                "rencontres"
                            ],
                            "slug": "725-2",
                            "timestamp": 1587203866,
                            "date_human": "avril 18, 2020",
                            "author": 3,
                            "author_name": "casimir",
                            "has_more": false,
                            "image_url": WP_OLD_URL + "/wordpress/wp-content/uploads/2020/04/FOR3-150x150.png",
                            "image_bbox": [
                                4.325435180302,
                                50.826457916436,
                                4.3267024785904,
                                50.825891891546
                            ],
                            "target_id": 22,
                            "minzoom": 14,
                            "image_layer": "annotation-raster-layer-725"
                        },
                        "geometry": {
                            "type": "Polygon",
                            "coordinates": [
                                [
                                    [
                                        4.325798864983049,
                                        50.82638833859404
                                    ],
                                    [
                                        4.326392372896584,
                                        50.826376046706415
                                    ],
                                    [
                                        4.326411832172439,
                                        50.82595197460127
                                    ],
                                    [
                                        4.325798864983049,
                                        50.82596426660054
                                    ],
                                    [
                                        4.325798864983049,
                                        50.82638833859404
                                    ]
                                ]
                            ]
                        }
                    },
                    {
                        "type": "Feature",
                        "properties": {
                            "post_id": 726,
                            "id": "annotationsPolygons-23",
                            "title": "QG",
                            "excerpt": "",
                            "post_type": "tdp_annotation",
                            "tag_slugs": [
                                "home",
                                "rencontres"
                            ],
                            "slug": "726-2",
                            "timestamp": 1587203889,
                            "date_human": "avril 18, 2020",
                            "author": 3,
                            "author_name": "casimir",
                            "has_more": false,
                            "image_url": WP_OLD_URL + "/wordpress/wp-content/uploads/2020/04/FOR4-150x150.png",
                            "image_bbox": [
                                4.3247103854651,
                                50.826913854498,
                                4.3297795786185,
                                50.824649735875
                            ],
                            "target_id": 23,
                            "minzoom": 12,
                            "image_layer": "annotation-raster-layer-726"
                        },
                        "geometry": {
                            "type": "Polygon",
                            "coordinates": [
                                [
                                    [
                                        4.327073447551461,
                                        50.82659730018862
                                    ],
                                    [
                                        4.328046411344142,
                                        50.82672636470089
                                    ],
                                    [
                                        4.328377219033654,
                                        50.826363754815546
                                    ],
                                    [
                                        4.326878854792925,
                                        50.8249440189385
                                    ],
                                    [
                                        4.326382643258658,
                                        50.82493172737854
                                    ],
                                    [
                                        4.327073447551461,
                                        50.82659730018862
                                    ]
                                ]
                            ]
                        }
                    },
                    {
                        "type": "Feature",
                        "properties": {
                            "post_id": 729,
                            "id": "annotationsPolygons-25",
                            "title": "Maison",
                            "excerpt": "",
                            "post_type": "tdp_annotation",
                            "tag_slugs": [
                                "home",
                                "prives",
                                "trajets"
                            ],
                            "slug": "729-2",
                            "timestamp": 1587204102,
                            "date_human": "avril 18, 2020",
                            "author": 3,
                            "author_name": "casimir",
                            "has_more": false,
                            "image_url": WP_OLD_URL + "/wordpress/wp-content/uploads/2020/04/FOR7-150x150.png",
                            "image_bbox": [
                                4.328016146125,
                                50.830879773158,
                                4.3344193374768,
                                50.828020058555
                            ],
                            "target_id": 25,
                            "minzoom": 12,
                            "image_layer": "annotation-raster-layer-729"
                        },
                        "geometry": {
                            "type": "Polygon",
                            "coordinates": [
                                [
                                    [
                                        4.331091788015235,
                                        50.83075789956815
                                    ],
                                    [
                                        4.33147124389438,
                                        50.830751754199994
                                    ],
                                    [
                                        4.330508009739626,
                                        50.82972546636804
                                    ],
                                    [
                                        4.331111247291088,
                                        50.82909247519763
                                    ],
                                    [
                                        4.33058584684304,
                                        50.82860697129906
                                    ],
                                    [
                                        4.331004221273894,
                                        50.82855780606574
                                    ],
                                    [
                                        4.331033410187674,
                                        50.82810302520286
                                    ],
                                    [
                                        4.330381524446578,
                                        50.82810302520286
                                    ],
                                    [
                                        4.330138283498407,
                                        50.828637699543584
                                    ],
                                    [
                                        4.330683143222308,
                                        50.82909862078424
                                    ],
                                    [
                                        4.330050716757066,
                                        50.82959641061243
                                    ],
                                    [
                                        4.331091788015235,
                                        50.83075789956815
                                    ]
                                ]
                            ]
                        }
                    },
                    {
                        "type": "Feature",
                        "properties": {
                            "post_id": 644,
                            "id": "annotationsPolygons-87",
                            "title": "Ecole",
                            "excerpt": "",
                            "post_type": "tdp_annotation",
                            "tag_slugs": [
                                "activites",
                                "home",
                                "scolaires"
                            ],
                            "slug": "644-2",
                            "timestamp": 1587144972,
                            "date_human": "avril 17, 2020",
                            "author": 3,
                            "author_name": "casimir",
                            "has_more": false,
                            "image_url": WP_OLD_URL + "/wordpress/wp-content/uploads/2020/04/JETTE21-150x150.png",
                            "image_bbox": [
                                4.3275401169854,
                                50.878027305404,
                                4.3312753119405,
                                50.876360845317
                            ],
                            "minzoom": 12,
                            "image_layer": "annotation-raster-layer-644"
                        },
                        "geometry": {
                            "type": "Polygon",
                            "coordinates": [
                                [
                                    [
                                        4.331704755204624,
                                        50.83056739277904
                                    ],
                                    [
                                        4.333816086634743,
                                        50.82973775737378
                                    ],
                                    [
                                        4.333164200893646,
                                        50.82917236776041
                                    ],
                                    [
                                        4.331101517653162,
                                        50.83005732238696
                                    ],
                                    [
                                        4.331704755204624,
                                        50.83056739277904
                                    ]
                                ]
                            ]
                        }
                    },
                    {
                        "type": "Feature",
                        "properties": {
                            "post_id": 733,
                            "id": "annotationsPolygons-27",
                            "title": "Place Jourdan, les meilleures frites de BX",
                            "excerpt": "",
                            "post_type": "tdp_annotation",
                            "tag_slugs": [
                                "home",
                                "nourriture"
                            ],
                            "slug": "733-2",
                            "timestamp": 1587204608,
                            "date_human": "avril 18, 2020",
                            "author": 3,
                            "author_name": "casimir",
                            "has_more": false,
                            "image_url": WP_OLD_URL + "/wordpress/wp-content/uploads/2020/04/ETT13-150x150.png",
                            "image_bbox": [
                                4.3801112577094825,
                                50.837681793459474,
                                4.383115331806162,
                                50.83648929632669
                            ],
                            "target_id": 27,
                            "minzoom": 12,
                            "image_layer": "annotation-raster-layer-733"
                        },
                        "geometry": {
                            "type": "Polygon",
                            "coordinates": [
                                [
                                    [
                                        4.381824421739235,
                                        50.8375907044238
                                    ],
                                    [
                                        4.382766148289656,
                                        50.83769621911623
                                    ],
                                    [
                                        4.38572803018211,
                                        50.83780173382839
                                    ],
                                    [
                                        4.386259650008959,
                                        50.837216604955515
                                    ],
                                    [
                                        4.385803975871659,
                                        50.836813725251226
                                    ],
                                    [
                                        4.384330629494388,
                                        50.83667943124356
                                    ],
                                    [
                                        4.381869989152966,
                                        50.83671780099947
                                    ],
                                    [
                                        4.381475071567305,
                                        50.83699598078636
                                    ],
                                    [
                                        4.381824421739235,
                                        50.8375907044238
                                    ]
                                ]
                            ]
                        }
                    },
                    {
                        "type": "Feature",
                        "properties": {
                            "post_id": 734,
                            "id": "annotationsPolygons-28",
                            "title": "Commune et commissariat",
                            "excerpt": "",
                            "post_type": "tdp_annotation",
                            "tag_slugs": [
                                "home",
                                "non-frequentes"
                            ],
                            "slug": "734-2",
                            "timestamp": 1587204619,
                            "date_human": "avril 18, 2020",
                            "author": 3,
                            "author_name": "casimir",
                            "has_more": false,
                            "image_url": WP_OLD_URL + "/wordpress/wp-content/uploads/2020/04/ETT12-150x150.png",
                            "image_bbox": [
                                4.3851433530974,
                                50.836529854595,
                                4.3872777502147,
                                50.835576751245
                            ],
                            "target_id": 28,
                            "minzoom": 13,
                            "image_layer": "annotation-raster-layer-734"
                        },
                        "geometry": {
                            "type": "Polygon",
                            "coordinates": [
                                [
                                    [
                                        4.38589511069912,
                                        50.83654513684946
                                    ],
                                    [
                                        4.38686721552536,
                                        50.83645880453489
                                    ],
                                    [
                                        4.38703429604237,
                                        50.83599836282659
                                    ],
                                    [
                                        4.386472297939699,
                                        50.83553791657551
                                    ],
                                    [
                                        4.385545760527189,
                                        50.835758547637674
                                    ],
                                    [
                                        4.385378680010179,
                                        50.83619980663295
                                    ],
                                    [
                                        4.38589511069912,
                                        50.83654513684946
                                    ]
                                ]
                            ]
                        }
                    },
                    {
                        "type": "Feature",
                        "properties": {
                            "post_id": 735,
                            "id": "annotationsPolygons-87",
                            "title": "Zone non fréquentée",
                            "excerpt": "",
                            "post_type": "tdp_annotation",
                            "tag_slugs": [
                                "non-frequentes"
                            ],
                            "slug": "735-2",
                            "timestamp": 1587204629,
                            "date_human": "avril 18, 2020",
                            "author": 3,
                            "author_name": "casimir",
                            "has_more": false,
                            "image_url": WP_OLD_URL + "/wordpress/wp-content/uploads/2020/04/ETT11-150x150.png",
                            "image_bbox": [
                                4.3832783033893,
                                50.839506344448836,
                                4.393416689696217,
                                50.834979218928986
                            ],
                            "target_id": 29,
                            "minzoom": 11,
                            "image_layer": "annotation-raster-layer-735"
                        },
                        "geometry": {
                            "type": "Polygon",
                            "coordinates": [
                                [
                                    [
                                        4.385196410355259,
                                        50.8394323811595
                                    ],
                                    [
                                        4.385454625699729,
                                        50.8395378916878
                                    ],
                                    [
                                        4.387854509489511,
                                        50.83538443348231
                                    ],
                                    [
                                        4.391180930691803,
                                        50.83612306623781
                                    ],
                                    [
                                        4.391469524312094,
                                        50.83584488124765
                                    ],
                                    [
                                        4.387657050696681,
                                        50.83505828023331
                                    ],
                                    [
                                        4.385196410355259,
                                        50.8394323811595
                                    ]
                                ]
                            ]
                        }
                    },
                    {
                        "type": "Feature",
                        "properties": {
                            "post_id": 736,
                            "id": "annotationsPolygons-30",
                            "title": "Où trainent les arabes (marocains, syriens, arméniens…), chems, charbel, snacks, venizi",
                            "excerpt": "",
                            "post_type": "tdp_annotation",
                            "tag_slugs": [
                                "home",
                                "nourriture",
                                "rencontres"
                            ],
                            "slug": "736-2",
                            "timestamp": 1587204640,
                            "date_human": "avril 18, 2020",
                            "author": 3,
                            "author_name": "casimir",
                            "has_more": false,
                            "image_url": WP_OLD_URL + "/wordpress/wp-content/uploads/2020/04/ETT10-150x150.png",
                            "image_bbox": [
                                4.3800077415632,
                                50.832583528075,
                                4.3901461278701,
                                50.828055730984
                            ],
                            "target_id": 30,
                            "minzoom": 11,
                            "image_layer": "annotation-raster-layer-736"
                        },
                        "geometry": {
                            "type": "Polygon",
                            "coordinates": [
                                [
                                    [
                                        4.381019397430006,
                                        50.8312018249072
                                    ],
                                    [
                                        4.381748476049687,
                                        50.83207483150149
                                    ],
                                    [
                                        4.383191444151138,
                                        50.8327079909037
                                    ],
                                    [
                                        4.386168515181501,
                                        50.832458565497824
                                    ],
                                    [
                                        4.389677206038713,
                                        50.83027123946003
                                    ],
                                    [
                                        4.386305217422691,
                                        50.827997462955295
                                    ],
                                    [
                                        4.3848014927696,
                                        50.82855392482494
                                    ],
                                    [
                                        4.381429504153576,
                                        50.829311853597694
                                    ],
                                    [
                                        4.381019397430006,
                                        50.8312018249072
                                    ]
                                ]
                            ]
                        }
                    },
                    {
                        "type": "Feature",
                        "properties": {
                            "post_id": 737,
                            "id": "annotationsPolygons-31",
                            "title": "Fréquentés par les Ixellois du Germoir",
                            "excerpt": "",
                            "post_type": "tdp_annotation",
                            "tag_slugs": [
                                "home",
                                "rencontres"
                            ],
                            "slug": "737-2",
                            "timestamp": 1587204971,
                            "date_human": "avril 18, 2020",
                            "author": 3,
                            "author_name": "casimir",
                            "has_more": false,
                            "image_url": WP_OLD_URL + "/wordpress/wp-content/uploads/2020/04/ETT9-150x150.png",
                            "image_bbox": [
                                4.3793206806045,
                                50.830436518459,
                                4.3809881783523,
                                50.829691810914
                            ],
                            "target_id": 31,
                            "minzoom": 14,
                            "image_layer": "annotation-raster-layer-737"
                        },
                        "geometry": {
                            "type": "Polygon",
                            "coordinates": [
                                [
                                    [
                                        4.379773888121385,
                                        50.830367176961786
                                    ],
                                    [
                                        4.380214373120776,
                                        50.83046311426637
                                    ],
                                    [
                                        4.380442210189426,
                                        50.8304247393682
                                    ],
                                    [
                                        4.380700425533896,
                                        50.83007936386499
                                    ],
                                    [
                                        4.380487777603156,
                                        50.82971479806151
                                    ],
                                    [
                                        4.379773888121385,
                                        50.829772361272404
                                    ],
                                    [
                                        4.379682753293926,
                                        50.83003139484299
                                    ],
                                    [
                                        4.379773888121385,
                                        50.830367176961786
                                    ]
                                ]
                            ]
                        }
                    },
                    {
                        "type": "Feature",
                        "properties": {
                            "post_id": 738,
                            "id": "annotationsPolygons-32",
                            "title": "Square aux papys qui promènent leur iench",
                            "excerpt": "",
                            "post_type": "tdp_annotation",
                            "tag_slugs": [
                                "home",
                                "intergenerationnel"
                            ],
                            "slug": "738-2",
                            "timestamp": 1587204984,
                            "date_human": "avril 18, 2020",
                            "author": 3,
                            "author_name": "casimir",
                            "has_more": false,
                            "image_url": WP_OLD_URL + "/wordpress/wp-content/uploads/2020/04/ETT8-150x150.png",
                            "image_bbox": [
                                4.3816083944935,
                                50.82893101333,
                                4.3840095912504,
                                50.827858596114
                            ],
                            "target_id": 32,
                            "minzoom": 13,
                            "image_layer": "annotation-raster-layer-738"
                        },
                        "geometry": {
                            "type": "Polygon",
                            "coordinates": [
                                [
                                    [
                                        4.382219339324898,
                                        50.82887052947977
                                    ],
                                    [
                                        4.383100309323678,
                                        50.828947281799984
                                    ],
                                    [
                                        4.383647118288438,
                                        50.82850595423537
                                    ],
                                    [
                                        4.383434470357699,
                                        50.82783436080544
                                    ],
                                    [
                                        4.382492743807278,
                                        50.82789192633517
                                    ],
                                    [
                                        4.382037069669978,
                                        50.828256506374984
                                    ],
                                    [
                                        4.382219339324898,
                                        50.82887052947977
                                    ]
                                ]
                            ]
                        }
                    },
                    {
                        "type": "Feature",
                        "properties": {
                            "post_id": 739,
                            "id": "annotationsPolygons-33",
                            "title": "Où on mange le plus souvent",
                            "excerpt": "",
                            "post_type": "tdp_annotation",
                            "tag_slugs": [
                                "home",
                                "nourriture"
                            ],
                            "slug": "739-2",
                            "timestamp": 1587204994,
                            "date_human": "avril 18, 2020",
                            "author": 3,
                            "author_name": "casimir",
                            "has_more": false,
                            "image_url": WP_OLD_URL + "/wordpress/wp-content/uploads/2020/04/ETT7-150x150.png",
                            "image_bbox": [
                                4.3883473599212,
                                50.831524307384,
                                4.3920825548764,
                                50.829856184857
                            ],
                            "target_id": 33,
                            "minzoom": 12,
                            "image_layer": "annotation-raster-layer-739"
                        },
                        "geometry": {
                            "type": "Polygon",
                            "coordinates": [
                                [
                                    [
                                        4.389464558107973,
                                        50.83155678560212
                                    ],
                                    [
                                        4.390072123624374,
                                        50.831537598606545
                                    ],
                                    [
                                        4.391165741553895,
                                        50.83112507629391
                                    ],
                                    [
                                        4.391135363278075,
                                        50.83068376931861
                                    ],
                                    [
                                        4.390588554313315,
                                        50.82987789364133
                                    ],
                                    [
                                        4.389874664831543,
                                        50.829858705955644
                                    ],
                                    [
                                        4.389920232245273,
                                        50.83020408309148
                                    ],
                                    [
                                        4.390482230347944,
                                        50.8307797059725
                                    ],
                                    [
                                        4.389677206038713,
                                        50.831048327554434
                                    ],
                                    [
                                        4.389464558107973,
                                        50.83155678560212
                                    ]
                                ]
                            ]
                        }
                    },
                    {
                        "type": "Feature",
                        "properties": {
                            "post_id": 740,
                            "id": "annotationsPolygons-34",
                            "title": "Chems",
                            "excerpt": "",
                            "post_type": "tdp_annotation",
                            "tag_slugs": [
                                "genres",
                                "home"
                            ],
                            "slug": "740-2",
                            "timestamp": 1587205006,
                            "date_human": "avril 18, 2020",
                            "author": 3,
                            "author_name": "casimir",
                            "has_more": false,
                            "image_url": WP_OLD_URL + "/wordpress/wp-content/uploads/2020/04/ETT6-150x150.png",
                            "image_bbox": [
                                4.3921608085282,
                                50.829334506639,
                                4.393094607267,
                                50.828917462032
                            ],
                            "target_id": 34,
                            "minzoom": 15,
                            "image_layer": "annotation-raster-layer-740"
                        },
                        "geometry": {
                            "type": "Polygon",
                            "coordinates": [
                                [
                                    [
                                        4.39237327801774,
                                        50.8292207109152
                                    ],
                                    [
                                        4.392563142241616,
                                        50.829307056618845
                                    ],
                                    [
                                        4.392836546723996,
                                        50.8293262445313
                                    ],
                                    [
                                        4.392958059827276,
                                        50.82915835002991
                                    ],
                                    [
                                        4.39287451956877,
                                        50.82899045492466
                                    ],
                                    [
                                        4.392517574827886,
                                        50.828942484783674
                                    ],
                                    [
                                        4.392350494310875,
                                        50.82903842501634
                                    ],
                                    [
                                        4.39237327801774,
                                        50.8292207109152
                                    ]
                                ]
                            ]
                        }
                    },
                    {
                        "type": "Feature",
                        "properties": {
                            "post_id": 741,
                            "id": "annotationsPolygons-35",
                            "title": "Boncelles Rolin – Quartier des arabes",
                            "excerpt": "",
                            "post_type": "tdp_annotation",
                            "tag_slugs": [
                                "genres",
                                "home",
                                "non-frequentes",
                                "rencontres"
                            ],
                            "slug": "741-2",
                            "timestamp": 1587205017,
                            "date_human": "avril 18, 2020",
                            "author": 3,
                            "author_name": "casimir",
                            "has_more": false,
                            "image_url": WP_OLD_URL + "/wordpress/wp-content/uploads/2020/04/ETT5-150x150.png",
                            "image_bbox": [
                                4.3936047021203,
                                50.829603352326,
                                4.3974732968953,
                                50.827875581791
                            ],
                            "target_id": 35,
                            "minzoom": 12,
                            "image_layer": "annotation-raster-layer-741"
                        },
                        "geometry": {
                            "type": "Polygon",
                            "coordinates": [
                                [
                                    [
                                        4.394841512928117,
                                        50.829283071717185
                                    ],
                                    [
                                        4.395525024134068,
                                        50.829642843948065
                                    ],
                                    [
                                        4.396504723529263,
                                        50.82865945994847
                                    ],
                                    [
                                        4.396428777839713,
                                        50.828256506374984
                                    ],
                                    [
                                        4.395752861202718,
                                        50.827824766543586
                                    ],
                                    [
                                        4.395441483875563,
                                        50.82800705718166
                                    ],
                                    [
                                        4.395304781634373,
                                        50.82897126687418
                                    ],
                                    [
                                        4.394841512928117,
                                        50.829283071717185
                                    ]
                                ]
                            ]
                        }
                    },
                    {
                        "type": "Feature",
                        "properties": {
                            "post_id": 742,
                            "id": "annotationsPolygons-36",
                            "title": "Les quartiers principaux fréquentés",
                            "excerpt": "",
                            "post_type": "tdp_annotation",
                            "tag_slugs": [
                                "home",
                                "quotidien"
                            ],
                            "slug": "742-2",
                            "timestamp": 1587205375,
                            "date_human": "avril 18, 2020",
                            "author": 3,
                            "author_name": "casimir",
                            "has_more": false,
                            "image_url": WP_OLD_URL + "/wordpress/wp-content/uploads/2020/04/ETT4-150x150.png",
                            "image_bbox": [
                                4.387115260664,
                                50.824819609893,
                                4.3911172552588,
                                50.823032076765
                            ],
                            "target_id": 36,
                            "minzoom": 12,
                            "image_layer": "annotation-raster-layer-742"
                        },
                        "geometry": {
                            "type": "Polygon",
                            "coordinates": [
                                [
                                    [
                                        4.387634266989817,
                                        50.82478328614976
                                    ],
                                    [
                                        4.388150697678757,
                                        50.82488882979747
                                    ],
                                    [
                                        4.390505014054809,
                                        50.82306576962349
                                    ],
                                    [
                                        4.390018961641688,
                                        50.82294103132551
                                    ],
                                    [
                                        4.388545615264418,
                                        50.82381419241328
                                    ],
                                    [
                                        4.387634266989817,
                                        50.82478328614976
                                    ]
                                ]
                            ]
                        }
                    },
                    {
                        "type": "Feature",
                        "properties": {
                            "post_id": 743,
                            "id": "annotationsPolygons-37",
                            "title": "Les fumeurs de beuh",
                            "excerpt": "",
                            "post_type": "tdp_annotation",
                            "tag_slugs": [
                                "home",
                                "non-frequentes"
                            ],
                            "slug": "743-2",
                            "timestamp": 1587205385,
                            "date_human": "avril 18, 2020",
                            "author": 3,
                            "author_name": "casimir",
                            "has_more": false,
                            "image_url": WP_OLD_URL + "/wordpress/wp-content/uploads/2020/04/ETT3-150x150.png",
                            "image_bbox": [
                                4.3974927902712,
                                50.833137214701,
                                4.3996805473164,
                                50.8321602125
                            ],
                            "target_id": 37,
                            "minzoom": 13,
                            "image_layer": "annotation-raster-layer-743"
                        },
                        "geometry": {
                            "type": "Polygon",
                            "coordinates": [
                                [
                                    [
                                        4.397689476286245,
                                        50.8330293639808
                                    ],
                                    [
                                        4.398737526802035,
                                        50.83296221158041
                                    ],
                                    [
                                        4.399603307662906,
                                        50.83284709295495
                                    ],
                                    [
                                        4.399777982748872,
                                        50.832444175529915
                                    ],
                                    [
                                        4.399314714042617,
                                        50.83222832547862
                                    ],
                                    [
                                        4.397947691630715,
                                        50.83226190221882
                                    ],
                                    [
                                        4.397461639217595,
                                        50.832496938723956
                                    ],
                                    [
                                        4.397689476286245,
                                        50.8330293639808
                                    ]
                                ]
                            ]
                        }
                    },
                    {
                        "type": "Feature",
                        "properties": {
                            "post_id": 744,
                            "id": "annotationsPolygons-38",
                            "title": "Boncelles, garçons 100%, racailles, mecs de quartier",
                            "excerpt": "",
                            "post_type": "tdp_annotation",
                            "tag_slugs": [
                                "genres",
                                "home",
                                "non-frequentes"
                            ],
                            "slug": "744-2",
                            "timestamp": 1587205395,
                            "date_human": "avril 18, 2020",
                            "author": 3,
                            "author_name": "casimir",
                            "has_more": false,
                            "image_url": WP_OLD_URL + "/wordpress/wp-content/uploads/2020/04/ETT2-150x150.png",
                            "image_bbox": [
                                4.3952284461793,
                                50.835790223678,
                                4.4018984371707,
                                50.832811663876
                            ],
                            "target_id": 38,
                            "minzoom": 12,
                            "image_layer": "annotation-raster-layer-744"
                        },
                        "geometry": {
                            "type": "Polygon",
                            "coordinates": [
                                [
                                    [
                                        4.396550290942994,
                                        50.83513022599888
                                    ],
                                    [
                                        4.39766669257938,
                                        50.835734566051016
                                    ],
                                    [
                                        4.400256440593037,
                                        50.83350422462637
                                    ],
                                    [
                                        4.399512172835446,
                                        50.832866279412244
                                    ],
                                    [
                                        4.398038826458174,
                                        50.83306773673764
                                    ],
                                    [
                                        4.396914830252833,
                                        50.83426686949206
                                    ],
                                    [
                                        4.396550290942994,
                                        50.83513022599888
                                    ]
                                ]
                            ]
                        }
                    },
                    {
                        "type": "Feature",
                        "properties": {
                            "post_id": 746,
                            "id": "annotationsPolygons-39",
                            "title": "Les 4 façades",
                            "excerpt": "",
                            "post_type": "tdp_annotation",
                            "tag_slugs": [
                                "home",
                                "non-frequentes"
                            ],
                            "slug": "746-2",
                            "timestamp": 1587206234,
                            "date_human": "avril 18, 2020",
                            "author": 3,
                            "author_name": "casimir",
                            "has_more": false,
                            "image_url": WP_OLD_URL + "/wordpress/wp-content/uploads/2020/04/AND1_OPA75-150x150.png",
                            "image_bbox": [
                                4.278743633447778,
                                50.846431796564595,
                                4.301154803178853,
                                50.83642536413711
                            ],
                            "target_id": 39,
                            "minzoom": 10,
                            "image_layer": "annotation-raster-layer-746"
                        },
                        "geometry": {
                            "type": "Polygon",
                            "coordinates": [
                                [
                                    [
                                        4.284890602319765,
                                        50.84542458754865
                                    ],
                                    [
                                        4.286603018594884,
                                        50.84540001379569
                                    ],
                                    [
                                        4.28991109549,
                                        50.84567032436632
                                    ],
                                    [
                                        4.294814833005113,
                                        50.84557202979458
                                    ],
                                    [
                                        4.297772642934865,
                                        50.84630923403464
                                    ],
                                    [
                                        4.298239665555351,
                                        50.84530171865443
                                    ],
                                    [
                                        4.295748878246088,
                                        50.84429418151593
                                    ],
                                    [
                                        4.297096433098911,
                                        50.8402883918341
                                    ],
                                    [
                                        4.295359692729014,
                                        50.836945874687
                                    ],
                                    [
                                        4.290845140730974,
                                        50.8376340595538
                                    ],
                                    [
                                        4.284851683768059,
                                        50.837855259172336
                                    ],
                                    [
                                        4.282750081975866,
                                        50.838101036362325
                                    ],
                                    [
                                        4.282438733562208,
                                        50.83849427636613
                                    ],
                                    [
                                        4.282944674734403,
                                        50.839182438399135
                                    ],
                                    [
                                        4.281932792390014,
                                        50.83928074643256
                                    ],
                                    [
                                        4.281178745450615,
                                        50.8402146631584
                                    ],
                                    [
                                        4.283163591587688,
                                        50.841271439549104
                                    ],
                                    [
                                        4.283567371561719,
                                        50.84404843744979
                                    ],
                                    [
                                        4.284890602319765,
                                        50.84542458754865
                                    ]
                                ]
                            ]
                        }
                    },
                    {
                        "type": "Feature",
                        "properties": {
                            "post_id": 747,
                            "id": "annotationsPolygons-40",
                            "title": "Foot",
                            "excerpt": "",
                            "post_type": "tdp_annotation",
                            "tag_slugs": [
                                "activites",
                                "home",
                                "rencontres"
                            ],
                            "slug": "747-2",
                            "timestamp": 1587206246,
                            "date_human": "avril 18, 2020",
                            "author": 3,
                            "author_name": "casimir",
                            "has_more": false,
                            "image_url": WP_OLD_URL + "/wordpress/wp-content/uploads/2020/04/AND2_OPA75-150x150.png",
                            "image_bbox": [
                                4.2702908200642,
                                50.834170600233,
                                4.2814964049297,
                                50.829166337532
                            ],
                            "target_id": 40,
                            "minzoom": 11,
                            "image_layer": "annotation-raster-layer-747"
                        },
                        "geometry": {
                            "type": "Polygon",
                            "coordinates": [
                                [
                                    [
                                        4.275238801496366,
                                        50.833541668147454
                                    ],
                                    [
                                        4.277963100115874,
                                        50.83363998806392
                                    ],
                                    [
                                        4.278507959839775,
                                        50.83221432900365
                                    ],
                                    [
                                        4.27901390101197,
                                        50.83155064527653
                                    ],
                                    [
                                        4.277223647633436,
                                        50.82968244782247
                                    ],
                                    [
                                        4.275355557151489,
                                        50.82968244782247
                                    ],
                                    [
                                        4.274693941772465,
                                        50.83037073979408
                                    ],
                                    [
                                        4.273526385221247,
                                        50.83046906639011
                                    ],
                                    [
                                        4.272981525497346,
                                        50.8313048340939
                                    ],
                                    [
                                        4.275238801496366,
                                        50.833541668147454
                                    ]
                                ]
                            ]
                        }
                    },
                    {
                        "type": "Feature",
                        "properties": {
                            "post_id": 748,
                            "id": "annotationsPolygons-41",
                            "title": "Indics, qui travaillent avec la police",
                            "excerpt": "",
                            "post_type": "tdp_annotation",
                            "tag_slugs": [
                                "home",
                                "limites",
                                "non-frequentes"
                            ],
                            "slug": "748-2",
                            "timestamp": 1587206258,
                            "date_human": "avril 18, 2020",
                            "author": 3,
                            "author_name": "casimir",
                            "has_more": false,
                            "image_url": WP_OLD_URL + "/wordpress/wp-content/uploads/2020/04/AND3_OPA75-150x150.png",
                            "image_bbox": [
                                4.2737335167233,
                                50.830265070892,
                                4.2961446864543,
                                50.820255171495
                            ],
                            "target_id": 41,
                            "minzoom": 10,
                            "image_layer": "annotation-raster-layer-748"
                        },
                        "geometry": {
                            "type": "Polygon",
                            "coordinates": [
                                [
                                    [
                                        4.279967405528795,
                                        50.82754990737157
                                    ],
                                    [
                                        4.284287364768299,
                                        50.82754990737157
                                    ],
                                    [
                                        4.288295975594145,
                                        50.828975708898376
                                    ],
                                    [
                                        4.290670007248287,
                                        50.82656657060098
                                    ],
                                    [
                                        4.286505722215612,
                                        50.8242064778437
                                    ],
                                    [
                                        4.284014934906346,
                                        50.82076447174015
                                    ],
                                    [
                                        4.280395509597573,
                                        50.823960627987
                                    ],
                                    [
                                        4.278332826357088,
                                        50.82474733798752
                                    ],
                                    [
                                        4.279967405528795,
                                        50.82754990737157
                                    ]
                                ]
                            ]
                        }
                    },
                    {
                        "type": "Feature",
                        "properties": {
                            "post_id": 749,
                            "id": "annotationsPolygons-42",
                            "title": "Quartier étudiants",
                            "excerpt": "",
                            "post_type": "tdp_annotation",
                            "tag_slugs": [
                                "home",
                                "non-frequentes"
                            ],
                            "slug": "749-2",
                            "timestamp": 1587206549,
                            "date_human": "avril 18, 2020",
                            "author": 3,
                            "author_name": "casimir",
                            "has_more": false,
                            "image_url": WP_OLD_URL + "/wordpress/wp-content/uploads/2020/04/AND4_OPA75-150x150.png",
                            "image_bbox": [
                                4.2986268617966,
                                50.817977666829,
                                4.3098324466621,
                                50.812971668168
                            ],
                            "target_id": 42,
                            "minzoom": 11,
                            "image_layer": "annotation-raster-layer-749"
                        },
                        "geometry": {
                            "type": "Polygon",
                            "coordinates": [
                                [
                                    [
                                        4.301139097657538,
                                        50.817691019233834
                                    ],
                                    [
                                        4.308339029723379,
                                        50.81732219250319
                                    ],
                                    [
                                        4.307327147378991,
                                        50.81301899874535
                                    ],
                                    [
                                        4.299387762830712,
                                        50.813289496887904
                                    ],
                                    [
                                        4.301139097657538,
                                        50.817691019233834
                                    ]
                                ]
                            ]
                        }
                    },
                    {
                        "type": "Feature",
                        "properties": {
                            "post_id": 644,
                            "id": "annotationsPolygons-88",
                            "title": "Ecole",
                            "excerpt": "",
                            "post_type": "tdp_annotation",
                            "tag_slugs": [
                                "activites",
                                "home",
                                "scolaires"
                            ],
                            "slug": "644-2",
                            "timestamp": 1587144972,
                            "date_human": "avril 17, 2020",
                            "author": 3,
                            "author_name": "casimir",
                            "has_more": false,
                            "image_url": WP_OLD_URL + "/wordpress/wp-content/uploads/2020/04/JETTE21-150x150.png",
                            "image_bbox": [
                                4.3275401169854,
                                50.878027305404,
                                4.3312753119405,
                                50.876360845317
                            ],
                            "minzoom": 13,
                            "image_layer": "annotation-raster-layer-644"
                        },
                        "geometry": {
                            "type": "Polygon",
                            "coordinates": [
                                [
                                    [
                                        4.30518662703509,
                                        50.83574767146156
                                    ],
                                    [
                                        4.306101213000211,
                                        50.83568622431306
                                    ],
                                    [
                                        4.306042835172651,
                                        50.83501030033982
                                    ],
                                    [
                                        4.305595271828017,
                                        50.834739928009505
                                    ],
                                    [
                                        4.304816900793873,
                                        50.834776797055866
                                    ],
                                    [
                                        4.30518662703509,
                                        50.83574767146156
                                    ]
                                ]
                            ]
                        }
                    },
                    {
                        "type": "Feature",
                        "properties": {
                            "post_id": 729,
                            "id": "annotationsPolygons-94",
                            "title": "Maison",
                            "excerpt": "",
                            "post_type": "tdp_annotation",
                            "tag_slugs": [
                                "home",
                                "prives",
                                "trajets"
                            ],
                            "slug": "729-2",
                            "timestamp": 1587204102,
                            "date_human": "avril 18, 2020",
                            "author": 3,
                            "author_name": "casimir",
                            "has_more": false,
                            "image_url": WP_OLD_URL + "/wordpress/wp-content/uploads/2020/04/FOR7-150x150.png",
                            "image_bbox": [
                                4.328016146125,
                                50.830879773158,
                                4.3344193374768,
                                50.828020058555
                            ],
                            "minzoom": 13,
                            "image_layer": "annotation-raster-layer-729"
                        },
                        "geometry": {
                            "type": "Polygon",
                            "coordinates": [
                                [
                                    [
                                        4.314449242341418,
                                        50.840441994404785
                                    ],
                                    [
                                        4.315558421065075,
                                        50.8404542825886
                                    ],
                                    [
                                        4.316083821513122,
                                        50.83965554390999
                                    ],
                                    [
                                        4.314896805686051,
                                        50.83969240907304
                                    ],
                                    [
                                        4.314449242341418,
                                        50.840441994404785
                                    ]
                                ]
                            ]
                        }
                    },
                    {
                        "type": "Feature",
                        "properties": {
                            "post_id": 753,
                            "id": "annotationsPolygons-45",
                            "title": "Escale du Nord",
                            "excerpt": "",
                            "post_type": "tdp_annotation",
                            "tag_slugs": [
                                "activites",
                                "home"
                            ],
                            "slug": "753-2",
                            "timestamp": 1587207102,
                            "date_human": "avril 18, 2020",
                            "author": 3,
                            "author_name": "casimir",
                            "has_more": false,
                            "image_url": WP_OLD_URL + "/wordpress/wp-content/uploads/2020/04/AND8-150x150.png",
                            "image_bbox": [
                                4.3114045628581,
                                50.845711745454,
                                4.3142059590745,
                                50.844461039451
                            ],
                            "target_id": 45,
                            "minzoom": 13,
                            "image_layer": "annotation-raster-layer-753"
                        },
                        "geometry": {
                            "type": "Polygon",
                            "coordinates": [
                                [
                                    [
                                        4.312337910911297,
                                        50.845467591585134
                                    ],
                                    [
                                        4.312795203893857,
                                        50.845427659266825
                                    ],
                                    [
                                        4.313004391109284,
                                        50.84553209756561
                                    ],
                                    [
                                        4.313490873005624,
                                        50.84541230067375
                                    ],
                                    [
                                        4.313578439746965,
                                        50.84505597989519
                                    ],
                                    [
                                        4.313189254229893,
                                        50.84494846878101
                                    ],
                                    [
                                        4.312994661471355,
                                        50.84466279518816
                                    ],
                                    [
                                        4.312663853781845,
                                        50.84470272822261
                                    ],
                                    [
                                        4.312478990661235,
                                        50.84497918626748
                                    ],
                                    [
                                        4.312191966342391,
                                        50.84509284075031
                                    ],
                                    [
                                        4.312337910911297,
                                        50.845467591585134
                                    ]
                                ]
                            ]
                        }
                    },
                    {
                        "type": "Feature",
                        "properties": {
                            "post_id": 754,
                            "id": "annotationsPolygons-46",
                            "title": "Comico",
                            "excerpt": "",
                            "post_type": "tdp_annotation",
                            "tag_slugs": [
                                "home",
                                "limites",
                                "non-frequentes"
                            ],
                            "slug": "754-2",
                            "timestamp": 1587207111,
                            "date_human": "avril 18, 2020",
                            "author": 3,
                            "author_name": "casimir",
                            "has_more": false,
                            "image_url": WP_OLD_URL + "/wordpress/wp-content/uploads/2020/04/AND9-150x150.png",
                            "image_bbox": [
                                4.3108385040805,
                                50.843487772876,
                                4.3136399002969,
                                50.842237007253
                            ],
                            "target_id": 46,
                            "minzoom": 13,
                            "image_layer": "annotation-raster-layer-754"
                        },
                        "geometry": {
                            "type": "Polygon",
                            "coordinates": [
                                [
                                    [
                                        4.311822240101177,
                                        50.84334191604953
                                    ],
                                    [
                                        4.312581151859468,
                                        50.843366490886524
                                    ],
                                    [
                                        4.31297033737654,
                                        50.84255551443133
                                    ],
                                    [
                                        4.311841699377031,
                                        50.84232204889936
                                    ],
                                    [
                                        4.311822240101177,
                                        50.84334191604953
                                    ]
                                ]
                            ]
                        }
                    },
                    {
                        "type": "Feature",
                        "properties": {
                            "post_id": 756,
                            "id": "annotationsPolygons-47",
                            "title": "Endroit que j’aime pas",
                            "excerpt": "",
                            "post_type": "tdp_annotation",
                            "tag_slugs": [
                                "home",
                                "non-frequentes"
                            ],
                            "slug": "756-2",
                            "timestamp": 1587207241,
                            "date_human": "avril 18, 2020",
                            "author": 3,
                            "author_name": "casimir",
                            "has_more": false,
                            "image_url": WP_OLD_URL + "/wordpress/wp-content/uploads/2020/04/AND11-150x150.png",
                            "image_bbox": [
                                4.3119822992741,
                                50.836827514276,
                                4.3170514924276,
                                50.834563876475
                            ],
                            "target_id": 47,
                            "minzoom": 12,
                            "image_layer": "annotation-raster-layer-756"
                        },
                        "geometry": {
                            "type": "Polygon",
                            "coordinates": [
                                [
                                    [
                                        4.312892500273127,
                                        50.83647274170416
                                    ],
                                    [
                                        4.314507620168976,
                                        50.8366570798003
                                    ],
                                    [
                                        4.316142199340681,
                                        50.836300692157494
                                    ],
                                    [
                                        4.31623949571995,
                                        50.835612487628055
                                    ],
                                    [
                                        4.316083821513121,
                                        50.83497343147791
                                    ],
                                    [
                                        4.314643835099953,
                                        50.83498572110179
                                    ],
                                    [
                                        4.313145470859223,
                                        50.83514548591762
                                    ],
                                    [
                                        4.312581151859469,
                                        50.835710803182174
                                    ],
                                    [
                                        4.312892500273127,
                                        50.83647274170416
                                    ]
                                ]
                            ]
                        }
                    },
                    {
                        "type": "Feature",
                        "properties": {
                            "post_id": 757,
                            "id": "annotationsPolygons-48",
                            "title": "Léonard de Vinci",
                            "excerpt": "",
                            "post_type": "tdp_annotation",
                            "tag_slugs": [
                                "home",
                                "scolaires"
                            ],
                            "slug": "757-2",
                            "timestamp": 1587207250,
                            "date_human": "avril 18, 2020",
                            "author": 3,
                            "author_name": "casimir",
                            "has_more": false,
                            "image_url": WP_OLD_URL + "/wordpress/wp-content/uploads/2020/04/AND12-150x150.png",
                            "image_bbox": [
                                4.3211680255751,
                                50.839023433936,
                                4.3237026221519,
                                50.837891682016
                            ],
                            "target_id": 48,
                            "minzoom": 13,
                            "image_layer": "annotation-raster-layer-757"
                        },
                        "geometry": {
                            "type": "Polygon",
                            "coordinates": [
                                [
                                    [
                                        4.321921604269209,
                                        50.838881368758386
                                    ],
                                    [
                                        4.322602678924087,
                                        50.838881368758386
                                    ],
                                    [
                                        4.323069701544574,
                                        50.83857415283696
                                    ],
                                    [
                                        4.322933486613598,
                                        50.83803344790291
                                    ],
                                    [
                                        4.321843767165795,
                                        50.8383283786436
                                    ],
                                    [
                                        4.321921604269209,
                                        50.838881368758386
                                    ]
                                ]
                            ]
                        }
                    },
                    {
                        "type": "Feature",
                        "properties": {
                            "post_id": 759,
                            "id": "annotationsPolygons-49",
                            "title": "Snack",
                            "excerpt": "",
                            "post_type": "tdp_annotation",
                            "tag_slugs": [
                                "home",
                                "nourriture"
                            ],
                            "slug": "759-2",
                            "timestamp": 1587207353,
                            "date_human": "avril 18, 2020",
                            "author": 3,
                            "author_name": "casimir",
                            "has_more": false,
                            "image_url": WP_OLD_URL + "/wordpress/wp-content/uploads/2020/04/AND14-150x150.png",
                            "image_bbox": [
                                4.3342056881472,
                                50.844415811167,
                                4.3388746818411,
                                50.842331224631
                            ],
                            "target_id": 49,
                            "minzoom": 12,
                            "image_layer": "annotation-raster-layer-759"
                        },
                        "geometry": {
                            "type": "Polygon",
                            "coordinates": [
                                [
                                    [
                                        4.335037156194552,
                                        50.84402386297198
                                    ],
                                    [
                                        4.336438224056013,
                                        50.844281894343354
                                    ],
                                    [
                                        4.338111721779425,
                                        50.84406072468383
                                    ],
                                    [
                                        4.337800373365767,
                                        50.84316374809423
                                    ],
                                    [
                                        4.337060920883329,
                                        50.84259852111244
                                    ],
                                    [
                                        4.335796067952844,
                                        50.84259852111244
                                    ],
                                    [
                                        4.334920400539431,
                                        50.84304087324587
                                    ],
                                    [
                                        4.335037156194552,
                                        50.84402386297198
                                    ]
                                ]
                            ]
                        }
                    },
                    {
                        "type": "Feature",
                        "properties": {
                            "post_id": 760,
                            "id": "annotationsPolygons-50",
                            "title": "Rezo avec Boho, « Zoo »",
                            "excerpt": "",
                            "post_type": "tdp_annotation",
                            "tag_slugs": [
                                "activites",
                                "home",
                                "rencontres"
                            ],
                            "slug": "760-2",
                            "timestamp": 1587207361,
                            "date_human": "avril 18, 2020",
                            "author": 3,
                            "author_name": "casimir",
                            "has_more": false,
                            "image_url": WP_OLD_URL + "/wordpress/wp-content/uploads/2020/04/AND15-150x150.png",
                            "image_bbox": [
                                4.3336262466981,
                                50.846923205953,
                                4.3386954398515,
                                50.844660057872
                            ],
                            "target_id": 50,
                            "minzoom": 12,
                            "image_layer": "annotation-raster-layer-760"
                        },
                        "geometry": {
                            "type": "Polygon",
                            "coordinates": [
                                [
                                    [
                                        4.334998237642845,
                                        50.84683755688475
                                    ],
                                    [
                                        4.337489024952109,
                                        50.84684984307362
                                    ],
                                    [
                                        4.337956047572597,
                                        50.84542458754863
                                    ],
                                    [
                                        4.336885787400647,
                                        50.84482252687504
                                    ],
                                    [
                                        4.334686889229188,
                                        50.84479795280497
                                    ],
                                    [
                                        4.334005814574311,
                                        50.84562117645589
                                    ],
                                    [
                                        4.334998237642845,
                                        50.84683755688475
                                    ]
                                ]
                            ]
                        }
                    },
                    {
                        "type": "Feature",
                        "properties": {
                            "post_id": 644,
                            "id": "annotationsPolygons-89",
                            "title": "Ecole",
                            "excerpt": "",
                            "post_type": "tdp_annotation",
                            "tag_slugs": [
                                "activites",
                                "home",
                                "scolaires"
                            ],
                            "slug": "644-2",
                            "timestamp": 1587144972,
                            "date_human": "avril 17, 2020",
                            "author": 3,
                            "author_name": "casimir",
                            "has_more": false,
                            "image_url": WP_OLD_URL + "/wordpress/wp-content/uploads/2020/04/JETTE21-150x150.png",
                            "image_bbox": [
                                4.3275401169854,
                                50.878027305404,
                                4.3312753119405,
                                50.876360845317
                            ],
                            "minzoom": 13,
                            "image_layer": "annotation-raster-layer-644"
                        },
                        "geometry": {
                            "type": "Polygon",
                            "coordinates": [
                                [
                                    [
                                        4.338539825848206,
                                        50.84614950743785
                                    ],
                                    [
                                        4.339006848468692,
                                        50.84598978029418
                                    ],
                                    [
                                        4.339143063399667,
                                        50.84521571023592
                                    ],
                                    [
                                        4.338384151641375,
                                        50.84495768402909
                                    ],
                                    [
                                        4.338247936710401,
                                        50.845645750742776
                                    ],
                                    [
                                        4.338539825848206,
                                        50.84614950743785
                                    ]
                                ]
                            ]
                        }
                    },
                    {
                        "type": "Feature",
                        "properties": {
                            "post_id": 762,
                            "id": "annotationsPolygons-52",
                            "title": "Vers Forest",
                            "excerpt": "",
                            "post_type": "tdp_annotation",
                            "tag_slugs": [
                                "home",
                                "prives",
                                "trajets"
                            ],
                            "slug": "762-2",
                            "timestamp": 1587207379,
                            "date_human": "avril 18, 2020",
                            "author": 3,
                            "author_name": "casimir",
                            "has_more": false,
                            "image_url": WP_OLD_URL + "/wordpress/wp-content/uploads/2020/04/AND17-150x150.png",
                            "image_bbox": [
                                4.338694554451803,
                                50.84583924442949,
                                4.344297346884574,
                                50.84333780572902
                            ],
                            "target_id": 52,
                            "minzoom": 12,
                            "image_layer": "annotation-raster-layer-762"
                        },
                        "geometry": {
                            "type": "Polygon",
                            "coordinates": [
                                [
                                    [
                                        4.338987389192838,
                                        50.844748804383286
                                    ],
                                    [
                                        4.339940893709667,
                                        50.84496997102368
                                    ],
                                    [
                                        4.34221762898454,
                                        50.844933110030205
                                    ],
                                    [
                                        4.343871667432098,
                                        50.8453140055584
                                    ],
                                    [
                                        4.343871667432098,
                                        50.8448962490076
                                    ],
                                    [
                                        4.342159251156979,
                                        50.84460135977837
                                    ],
                                    [
                                        4.340038190088935,
                                        50.84467508226042
                                    ],
                                    [
                                        4.339006848468692,
                                        50.84431875585135
                                    ],
                                    [
                                        4.338987389192838,
                                        50.844748804383286
                                    ]
                                ]
                            ]
                        }
                    },
                    {
                        "type": "Feature",
                        "properties": {
                            "post_id": 791,
                            "id": "annotationsPolygons-53",
                            "title": "Gare du midi",
                            "excerpt": "",
                            "post_type": "tdp_annotation",
                            "tag_slugs": [
                                "home",
                                "trajets"
                            ],
                            "slug": "791-2",
                            "timestamp": 1587291959,
                            "date_human": "avril 19, 2020",
                            "author": 3,
                            "author_name": "casimir",
                            "has_more": false,
                            "image_url": WP_OLD_URL + "/wordpress/wp-content/uploads/2020/04/STGILLES1_OPA75-150x150.png",
                            "image_bbox": [
                                4.3285452995560165,
                                50.837387256358724,
                                4.340284483700866,
                                50.83214504336378
                            ],
                            "target_id": 53,
                            "minzoom": 11,
                            "image_layer": "annotation-raster-layer-791"
                        },
                        "geometry": {
                            "type": "Polygon",
                            "coordinates": [
                                [
                                    [
                                        4.3356817447072,
                                        50.83762330674331
                                    ],
                                    [
                                        4.338114154188913,
                                        50.83627150511794
                                    ],
                                    [
                                        4.332899068260121,
                                        50.831970057618214
                                    ],
                                    [
                                        4.330174769640601,
                                        50.8330638918548
                                    ],
                                    [
                                        4.334105543363051,
                                        50.83684909787621
                                    ],
                                    [
                                        4.3356817447072,
                                        50.83762330674331
                                    ]
                                ]
                            ]
                        }
                    },
                    {
                        "type": "Feature",
                        "properties": {
                            "post_id": 792,
                            "id": "annotationsPolygons-54",
                            "title": "Parc chateaux",
                            "excerpt": "",
                            "post_type": "tdp_annotation",
                            "tag_slugs": [
                                "activites",
                                "home"
                            ],
                            "slug": "792-2",
                            "timestamp": 1587291975,
                            "date_human": "avril 19, 2020",
                            "author": 3,
                            "author_name": "casimir",
                            "has_more": false,
                            "image_url": WP_OLD_URL + "/wordpress/wp-content/uploads/2020/04/STGILLES2-150x150.png",
                            "image_bbox": [
                                4.3469495642582,
                                50.836475922879,
                                4.3497843104296,
                                50.835210076788
                            ],
                            "target_id": 54,
                            "minzoom": 13,
                            "image_layer": "annotation-raster-layer-792"
                        },
                        "geometry": {
                            "type": "Polygon",
                            "coordinates": [
                                [
                                    [
                                        4.347104339633324,
                                        50.83643126553223
                                    ],
                                    [
                                        4.349575667666745,
                                        50.83640668704255
                                    ],
                                    [
                                        4.349595126942598,
                                        50.83536208926572
                                    ],
                                    [
                                        4.347196771193631,
                                        50.83536823402688
                                    ],
                                    [
                                        4.347104339633324,
                                        50.83643126553223
                                    ]
                                ]
                            ]
                        }
                    },
                    {
                        "type": "Feature",
                        "properties": {
                            "post_id": 796,
                            "id": "annotationsPolygons-56",
                            "title": "Terrain PDH",
                            "excerpt": "",
                            "post_type": "tdp_annotation",
                            "tag_slugs": [
                                "activites",
                                "home"
                            ],
                            "slug": "796-2",
                            "timestamp": 1587293003,
                            "date_human": "avril 19, 2020",
                            "author": 3,
                            "author_name": "casimir",
                            "has_more": false,
                            "image_url": WP_OLD_URL + "/wordpress/wp-content/uploads/2020/04/STGILLES5_OPA85-150x150.png",
                            "image_bbox": [
                                4.3402372876986,
                                50.832869652685,
                                4.3429052840951,
                                50.83167817702
                            ],
                            "target_id": 56,
                            "minzoom": 13,
                            "image_layer": "annotation-raster-layer-796"
                        },
                        "geometry": {
                            "type": "Polygon",
                            "coordinates": [
                                [
                                    [
                                        4.340872506541177,
                                        50.832603009767716
                                    ],
                                    [
                                        4.341534121920203,
                                        50.832867249387604
                                    ],
                                    [
                                        4.342059522368253,
                                        50.832400220207674
                                    ],
                                    [
                                        4.342536274626669,
                                        50.83246781682558
                                    ],
                                    [
                                        4.342915730505816,
                                        50.83227117097492
                                    ],
                                    [
                                        4.341320069885812,
                                        50.831718103403375
                                    ],
                                    [
                                        4.340784939799835,
                                        50.83222201047302
                                    ],
                                    [
                                        4.340979532558372,
                                        50.8324063653588
                                    ],
                                    [
                                        4.340872506541177,
                                        50.832603009767716
                                    ]
                                ]
                            ]
                        }
                    },
                    {
                        "type": "Feature",
                        "properties": {
                            "post_id": 759,
                            "id": "annotationsPolygons-103",
                            "title": "Snack",
                            "excerpt": "",
                            "post_type": "tdp_annotation",
                            "tag_slugs": [
                                "home",
                                "nourriture"
                            ],
                            "slug": "759-2",
                            "timestamp": 1587207353,
                            "date_human": "avril 18, 2020",
                            "author": 3,
                            "author_name": "casimir",
                            "has_more": false,
                            "image_url": WP_OLD_URL + "/wordpress/wp-content/uploads/2020/04/AND14-150x150.png",
                            "image_bbox": [
                                4.3342056881472,
                                50.844415811167,
                                4.3388746818411,
                                50.842331224631
                            ],
                            "minzoom": 14,
                            "image_layer": "annotation-raster-layer-759"
                        },
                        "geometry": {
                            "type": "Polygon",
                            "coordinates": [
                                [
                                    [
                                        4.336810382706714,
                                        50.829748512001146
                                    ],
                                    [
                                        4.337350377611655,
                                        50.829653256643994
                                    ],
                                    [
                                        4.3369320031808,
                                        50.82925072379494
                                    ],
                                    [
                                        4.336601195491287,
                                        50.8293951443767
                                    ],
                                    [
                                        4.336810382706714,
                                        50.829748512001146
                                    ]
                                ]
                            ]
                        }
                    },
                    {
                        "type": "Feature",
                        "properties": {
                            "post_id": 644,
                            "id": "annotationsPolygons-85",
                            "title": "Ecole",
                            "excerpt": "",
                            "post_type": "tdp_annotation",
                            "tag_slugs": [
                                "activites",
                                "home",
                                "scolaires"
                            ],
                            "slug": "644-2",
                            "timestamp": 1587144972,
                            "date_human": "avril 17, 2020",
                            "author": 3,
                            "author_name": "casimir",
                            "has_more": false,
                            "image_url": WP_OLD_URL + "/wordpress/wp-content/uploads/2020/04/JETTE21-150x150.png",
                            "image_bbox": [
                                4.3275401169854,
                                50.878027305404,
                                4.3312753119405,
                                50.876360845317
                            ],
                            "minzoom": 14,
                            "image_layer": "annotation-raster-layer-644"
                        },
                        "geometry": {
                            "type": "Polygon",
                            "coordinates": [
                                [
                                    [
                                        4.336557412120616,
                                        50.830519765960275
                                    ],
                                    [
                                        4.336951462456654,
                                        50.830593510691294
                                    ],
                                    [
                                        4.337180108947935,
                                        50.83044909381708
                                    ],
                                    [
                                        4.337267675689276,
                                        50.82981918520504
                                    ],
                                    [
                                        4.336479575017202,
                                        50.829822257950596
                                    ],
                                    [
                                        4.336557412120616,
                                        50.830519765960275
                                    ]
                                ]
                            ]
                        }
                    },
                    {
                        "type": "Feature",
                        "properties": {
                            "post_id": 800,
                            "id": "annotationsPolygons-59",
                            "title": "4 saisons",
                            "excerpt": "",
                            "post_type": "tdp_annotation",
                            "tag_slugs": [
                                "home",
                                "scolaires"
                            ],
                            "slug": "800-2",
                            "timestamp": 1587293431,
                            "date_human": "avril 19, 2020",
                            "author": 3,
                            "author_name": "casimir",
                            "has_more": false,
                            "image_url": WP_OLD_URL + "/wordpress/wp-content/uploads/2020/04/STGILLES9-150x150.png",
                            "image_bbox": [
                                4.3375083813826,
                                50.831469255817,
                                4.3391091792206,
                                50.830754352619
                            ],
                            "target_id": 59,
                            "minzoom": 14,
                            "image_layer": "annotation-raster-layer-800"
                        },
                        "geometry": {
                            "type": "Polygon",
                            "coordinates": [
                                [
                                    [
                                        4.338160369969058,
                                        50.831449248320546
                                    ],
                                    [
                                        4.338651716684363,
                                        50.83142159456704
                                    ],
                                    [
                                        4.338870633537717,
                                        50.831289470851985
                                    ],
                                    [
                                        4.338607933313693,
                                        50.83095147825096
                                    ],
                                    [
                                        4.338179829244913,
                                        50.830785553714826
                                    ],
                                    [
                                        4.337897669745034,
                                        50.8308777340855
                                    ],
                                    [
                                        4.337785778908877,
                                        50.83100371363101
                                    ],
                                    [
                                        4.337941453115706,
                                        50.831252599050806
                                    ],
                                    [
                                        4.338160369969058,
                                        50.831449248320546
                                    ]
                                ]
                            ]
                        }
                    },
                    {
                        "type": "Feature",
                        "properties": {
                            "post_id": 801,
                            "id": "annotationsPolygons-60",
                            "title": "Place B.",
                            "excerpt": "",
                            "post_type": "tdp_annotation",
                            "tag_slugs": [
                                "home",
                                "non-frequentes"
                            ],
                            "slug": "801-2",
                            "timestamp": 1587293444,
                            "date_human": "avril 19, 2020",
                            "author": 3,
                            "author_name": "casimir",
                            "has_more": false,
                            "image_url": WP_OLD_URL + "/wordpress/wp-content/uploads/2020/04/STGILLES10-150x150.png",
                            "image_bbox": [
                                4.337612418919,
                                50.830758382485,
                                4.339213216757,
                                50.830043468399
                            ],
                            "target_id": 60,
                            "minzoom": 14,
                            "image_layer": "annotation-raster-layer-801"
                        },
                        "geometry": {
                            "type": "Polygon",
                            "coordinates": [
                                [
                                    [
                                        4.338461988744791,
                                        50.830724100033244
                                    ],
                                    [
                                        4.338673608369707,
                                        50.83072563637631
                                    ],
                                    [
                                        4.338736851016231,
                                        50.83013874966076
                                    ],
                                    [
                                        4.337885507697631,
                                        50.83009880422344
                                    ],
                                    [
                                        4.338461988744791,
                                        50.830724100033244
                                    ]
                                ]
                            ]
                        }
                    },
                    {
                        "type": "Feature",
                        "properties": {
                            "post_id": 803,
                            "id": "annotationsPolygons-61",
                            "title": "Les 2 bancs",
                            "excerpt": "",
                            "post_type": "tdp_annotation",
                            "tag_slugs": [
                                "home",
                                "rencontres"
                            ],
                            "slug": "803-2",
                            "timestamp": 1587293468,
                            "date_human": "avril 19, 2020",
                            "author": 3,
                            "author_name": "casimir",
                            "has_more": false,
                            "image_url": WP_OLD_URL + "/wordpress/wp-content/uploads/2020/04/STGILLES12-150x150.png",
                            "image_bbox": [
                                4.337553400394,
                                50.829400082467,
                                4.3395543976914,
                                50.828506412145
                            ],
                            "target_id": 61,
                            "minzoom": 13,
                            "image_layer": "annotation-raster-layer-803"
                        },
                        "geometry": {
                            "type": "Polygon",
                            "coordinates": [
                                [
                                    [
                                        4.338819552938612,
                                        50.829441235957674
                                    ],
                                    [
                                        4.339062793886783,
                                        50.82936134385505
                                    ],
                                    [
                                        4.339023875335076,
                                        50.82915854021125
                                    ],
                                    [
                                        4.338264963576782,
                                        50.82853783267492
                                    ],
                                    [
                                        4.337914696611415,
                                        50.828642308778505
                                    ],
                                    [
                                        4.338449826697392,
                                        50.82909093880086
                                    ],
                                    [
                                        4.338819552938612,
                                        50.829441235957674
                                    ]
                                ]
                            ]
                        }
                    },
                    {
                        "type": "Feature",
                        "properties": {
                            "post_id": 806,
                            "id": "annotationsPolygons-62",
                            "title": "Métro",
                            "excerpt": "",
                            "post_type": "tdp_annotation",
                            "tag_slugs": [
                                "home",
                                "trajets"
                            ],
                            "slug": "806-2",
                            "timestamp": 1587293517,
                            "date_human": "avril 19, 2020",
                            "author": 3,
                            "author_name": "casimir",
                            "has_more": false,
                            "image_url": WP_OLD_URL + "/wordpress/wp-content/uploads/2020/04/STGILLES15-150x150.png",
                            "image_bbox": [
                                4.3441491116936,
                                50.831143319659,
                                4.3481511062884,
                                50.829356028653
                            ],
                            "target_id": 62,
                            "minzoom": 12,
                            "image_layer": "annotation-raster-layer-806"
                        },
                        "geometry": {
                            "type": "Polygon",
                            "coordinates": [
                                [
                                    [
                                        4.344652470875759,
                                        50.83029853106823
                                    ],
                                    [
                                        4.345557327202956,
                                        50.830470602741535
                                    ],
                                    [
                                        4.347503254788326,
                                        50.8311465924602
                                    ],
                                    [
                                        4.348067573788083,
                                        50.830618092242375
                                    ],
                                    [
                                        4.346773531943812,
                                        50.82963482010079
                                    ],
                                    [
                                        4.344633011599904,
                                        50.82975773025119
                                    ],
                                    [
                                        4.344652470875759,
                                        50.83029853106823
                                    ]
                                ]
                            ]
                        }
                    },
                    {
                        "type": "Feature",
                        "properties": {
                            "post_id": 807,
                            "id": "annotationsPolygons-63",
                            "title": "Place aux canards",
                            "excerpt": "",
                            "post_type": "tdp_annotation",
                            "tag_slugs": [
                                "activites",
                                "home",
                                "nature"
                            ],
                            "slug": "807-2",
                            "timestamp": 1587293527,
                            "date_human": "avril 19, 2020",
                            "author": 3,
                            "author_name": "casimir",
                            "has_more": false,
                            "image_url": WP_OLD_URL + "/wordpress/wp-content/uploads/2020/04/STGILLES16_OPA75-150x150.png",
                            "image_bbox": [
                                4.3453847384495,
                                50.830462496085,
                                4.3507207312427,
                                50.828079391446
                            ],
                            "target_id": 63,
                            "minzoom": 12,
                            "image_layer": "annotation-raster-layer-807"
                        },
                        "geometry": {
                            "type": "Polygon",
                            "coordinates": [
                                [
                                    [
                                        4.348033520055341,
                                        50.830538202153924
                                    ],
                                    [
                                        4.349716747416686,
                                        50.829352125526704
                                    ],
                                    [
                                        4.348072438607048,
                                        50.82807997875737
                                    ],
                                    [
                                        4.346184888849239,
                                        50.828657672891644
                                    ],
                                    [
                                        4.347138393366071,
                                        50.82962867458476
                                    ],
                                    [
                                        4.348033520055341,
                                        50.830538202153924
                                    ]
                                ]
                            ]
                        }
                    },
                    {
                        "type": "Feature",
                        "properties": {
                            "post_id": 729,
                            "id": "annotationsPolygons-102",
                            "title": "Maison",
                            "excerpt": "",
                            "post_type": "tdp_annotation",
                            "tag_slugs": [
                                "home",
                                "prives",
                                "trajets"
                            ],
                            "slug": "729-2",
                            "timestamp": 1587204102,
                            "date_human": "avril 18, 2020",
                            "author": 3,
                            "author_name": "casimir",
                            "has_more": false,
                            "image_url": WP_OLD_URL + "/wordpress/wp-content/uploads/2020/04/FOR7-150x150.png",
                            "image_bbox": [
                                4.328016146125,
                                50.830879773158,
                                4.3344193374768,
                                50.828020058555
                            ],
                            "minzoom": 15,
                            "image_layer": "annotation-raster-layer-729"
                        },
                        "geometry": {
                            "type": "Polygon",
                            "coordinates": [
                                [
                                    [
                                        4.3376242879262,
                                        50.828436581771
                                    ],
                                    [
                                        4.3381578872055,
                                        50.828436581771
                                    ],
                                    [
                                        4.3381578872055,
                                        50.828198266439
                                    ],
                                    [
                                        4.3376242879262,
                                        50.828198266439
                                    ],
                                    [
                                        4.3376242879262,
                                        50.828436581771
                                    ]
                                ]
                            ]
                        }
                    },
                    {
                        "type": "Feature",
                        "properties": {
                            "post_id": 810,
                            "id": "annotationsPolygons-65",
                            "title": "C.D.J.",
                            "excerpt": "",
                            "post_type": "tdp_annotation",
                            "tag_slugs": [
                                "activites",
                                "home"
                            ],
                            "slug": "810-2",
                            "timestamp": 1587293749,
                            "date_human": "avril 19, 2020",
                            "author": 3,
                            "author_name": "casimir",
                            "has_more": false,
                            "image_url": WP_OLD_URL + "/wordpress/wp-content/uploads/2020/04/STGILLES19-150x150.png",
                            "image_bbox": [
                                4.3383084135443,
                                50.82773044158,
                                4.3404428106616,
                                50.826777158533
                            ],
                            "target_id": 65,
                            "minzoom": 14,
                            "image_layer": "annotation-raster-layer-810"
                        },
                        "geometry": {
                            "type": "Polygon",
                            "coordinates": [
                                [
                                    [
                                        4.338890092813575,
                                        50.82770047898596
                                    ],
                                    [
                                        4.339619815658086,
                                        50.827651312797926
                                    ],
                                    [
                                        4.339921434433817,
                                        50.826975272461624
                                    ],
                                    [
                                        4.338890092813575,
                                        50.82691381376378
                                    ],
                                    [
                                        4.338890092813575,
                                        50.82770047898596
                                    ]
                                ]
                            ]
                        }
                    },
                    {
                        "type": "Feature",
                        "properties": {
                            "post_id": 812,
                            "id": "annotationsPolygons-66",
                            "title": "Piscine Victor Boin",
                            "excerpt": "",
                            "post_type": "tdp_annotation",
                            "tag_slugs": [
                                "activites",
                                "home"
                            ],
                            "slug": "812-2",
                            "timestamp": 1587293768,
                            "date_human": "avril 19, 2020",
                            "author": 3,
                            "author_name": "casimir",
                            "has_more": false,
                            "image_url": WP_OLD_URL + "/wordpress/wp-content/uploads/2020/04/STGILLES21-150x150.png",
                            "image_bbox": [
                                4.3406507524544,
                                50.826882178164,
                                4.3419847639927,
                                50.826286361757
                            ],
                            "target_id": 66,
                            "minzoom": 14,
                            "image_layer": "annotation-raster-layer-812"
                        },
                        "geometry": {
                            "type": "Polygon",
                            "coordinates": [
                                [
                                    [
                                        4.341050072433327,
                                        50.826864646747254
                                    ],
                                    [
                                        4.34146844686418,
                                        50.82682777145087
                                    ],
                                    [
                                        4.341740876726131,
                                        50.82671714538698
                                    ],
                                    [
                                        4.341565743243448,
                                        50.826293076380246
                                    ],
                                    [
                                        4.340933316778206,
                                        50.82632995209895
                                    ],
                                    [
                                        4.340826290761011,
                                        50.82666183225673
                                    ],
                                    [
                                        4.341050072433327,
                                        50.826864646747254
                                    ]
                                ]
                            ]
                        }
                    },
                    {
                        "type": "Feature",
                        "properties": {
                            "post_id": 813,
                            "id": "annotationsPolygons-67",
                            "title": "Le Jacques Franck",
                            "excerpt": "",
                            "post_type": "tdp_annotation",
                            "tag_slugs": [
                                "activites",
                                "home"
                            ],
                            "slug": "813-2",
                            "timestamp": 1587293781,
                            "date_human": "avril 19, 2020",
                            "author": 3,
                            "author_name": "casimir",
                            "has_more": false,
                            "image_url": WP_OLD_URL + "/wordpress/wp-content/uploads/2020/04/STGILLES22-150x150.png",
                            "image_bbox": [
                                4.3444615594144,
                                50.829519271087,
                                4.3451285651835,
                                50.829221380662
                            ],
                            "target_id": 67,
                            "minzoom": 15,
                            "image_layer": "annotation-raster-layer-813"
                        },
                        "geometry": {
                            "type": "Polygon",
                            "coordinates": [
                                [
                                    [
                                        4.344774091349845,
                                        50.82952420068874
                                    ],
                                    [
                                        4.344988143384236,
                                        50.829475036421464
                                    ],
                                    [
                                        4.34500760266009,
                                        50.829333688864594
                                    ],
                                    [
                                        4.344924900737712,
                                        50.829250723794935
                                    ],
                                    [
                                        4.34466706533265,
                                        50.829229214308356
                                    ],
                                    [
                                        4.344579498591308,
                                        50.82941972655888
                                    ],
                                    [
                                        4.344774091349845,
                                        50.82952420068874
                                    ]
                                ]
                            ]
                        }
                    },
                    {
                        "type": "Feature",
                        "properties": {
                            "post_id": 814,
                            "id": "annotationsPolygons-68",
                            "title": "Tacos",
                            "excerpt": "",
                            "post_type": "tdp_annotation",
                            "tag_slugs": [
                                "home",
                                "nourriture"
                            ],
                            "slug": "814-2",
                            "timestamp": 1587293790,
                            "date_human": "avril 19, 2020",
                            "author": 3,
                            "author_name": "casimir",
                            "has_more": false,
                            "image_url": WP_OLD_URL + "/wordpress/wp-content/uploads/2020/04/STGILLES23-150x150.png",
                            "image_bbox": [
                                4.3434306316991,
                                50.828694355444,
                                4.3447646432373,
                                50.828098562165
                            ],
                            "target_id": 68,
                            "minzoom": 14,
                            "image_layer": "annotation-raster-layer-814"
                        },
                        "geometry": {
                            "type": "Polygon",
                            "coordinates": [
                                [
                                    [
                                        4.343874099841612,
                                        50.82865152724702
                                    ],
                                    [
                                        4.344399500289661,
                                        50.82864538160155
                                    ],
                                    [
                                        4.344355716918991,
                                        50.82845793902616
                                    ],
                                    [
                                        4.344399500289661,
                                        50.828135290207385
                                    ],
                                    [
                                        4.343791397919233,
                                        50.82810763449057
                                    ],
                                    [
                                        4.343767073824416,
                                        50.828390336601174
                                    ],
                                    [
                                        4.343874099841612,
                                        50.82865152724702
                                    ]
                                ]
                            ]
                        }
                    },
                    {
                        "type": "Feature",
                        "properties": {
                            "post_id": 815,
                            "id": "annotationsPolygons-69",
                            "title": "Hôtel des monnaies",
                            "excerpt": "",
                            "post_type": "tdp_annotation",
                            "tag_slugs": [
                                "home",
                                "trajets"
                            ],
                            "slug": "815-2",
                            "timestamp": 1587293799,
                            "date_human": "avril 19, 2020",
                            "author": 3,
                            "author_name": "casimir",
                            "has_more": false,
                            "image_url": WP_OLD_URL + "/wordpress/wp-content/uploads/2020/04/STGILLES24-150x150.png",
                            "image_bbox": [
                                4.3447474171278,
                                50.826390324877,
                                4.3466150412853,
                                50.825556167415
                            ],
                            "target_id": 69,
                            "minzoom": 13,
                            "image_layer": "annotation-raster-layer-815"
                        },
                        "geometry": {
                            "type": "Polygon",
                            "coordinates": [
                                [
                                    [
                                        4.345496516965881,
                                        50.826372973733996
                                    ],
                                    [
                                        4.346177591620757,
                                        50.826336098049254
                                    ],
                                    [
                                        4.346352725103439,
                                        50.82602265355296
                                    ],
                                    [
                                        4.346313806551732,
                                        50.82567233074318
                                    ],
                                    [
                                        4.345671650448564,
                                        50.82559243219036
                                    ],
                                    [
                                        4.344922468328199,
                                        50.825746083132124
                                    ],
                                    [
                                        4.345000305431613,
                                        50.826207032923286
                                    ],
                                    [
                                        4.345496516965881,
                                        50.826372973733996
                                    ]
                                ]
                            ]
                        }
                    },
                    {
                        "type": "Feature",
                        "properties": {
                            "post_id": 816,
                            "id": "annotationsPolygons-70",
                            "title": "Morichar",
                            "excerpt": "",
                            "post_type": "tdp_annotation",
                            "tag_slugs": [
                                "activites",
                                "home",
                                "non-frequentes"
                            ],
                            "slug": "816-2",
                            "timestamp": 1587293812,
                            "date_human": "avril 19, 2020",
                            "author": 3,
                            "author_name": "casimir",
                            "has_more": false,
                            "image_url": WP_OLD_URL + "/wordpress/wp-content/uploads/2020/04/STGILLES25_OPA75-150x150.png",
                            "image_bbox": [
                                4.3467484795383,
                                50.827977468571,
                                4.3499501285741,
                                50.826547520436
                            ],
                            "target_id": 70,
                            "minzoom": 12,
                            "image_layer": "annotation-raster-layer-816"
                        },
                        "geometry": {
                            "type": "Polygon",
                            "coordinates": [
                                [
                                    [
                                        4.348016493188925,
                                        50.8280384951269
                                    ],
                                    [
                                        4.349738639101971,
                                        50.82735016876639
                                    ],
                                    [
                                        4.348532163999046,
                                        50.82642828720648
                                    ],
                                    [
                                        4.347014340482463,
                                        50.82723339810904
                                    ],
                                    [
                                        4.348016493188925,
                                        50.8280384951269
                                    ]
                                ]
                            ]
                        }
                    },
                    {
                        "type": "Feature",
                        "properties": {
                            "post_id": 817,
                            "id": "annotationsPolygons-71",
                            "title": "Institut Saint-Jean-Baptiste",
                            "excerpt": "",
                            "post_type": "tdp_annotation",
                            "tag_slugs": [
                                "home",
                                "scolaires"
                            ],
                            "slug": "817-2",
                            "timestamp": 1587293852,
                            "date_human": "avril 19, 2020",
                            "author": 3,
                            "author_name": "casimir",
                            "has_more": false,
                            "image_url": WP_OLD_URL + "/wordpress/wp-content/uploads/2020/04/STGILLES26-150x150.png",
                            "image_bbox": [
                                4.3544499930788,
                                50.825182489743,
                                4.3564509903762,
                                50.82428873868
                            ],
                            "target_id": 71,
                            "minzoom": 13,
                            "image_layer": "annotation-raster-layer-817"
                        },
                        "geometry": {
                            "type": "Polygon",
                            "coordinates": [
                                [
                                    [
                                        4.354871023108363,
                                        50.82527283661172
                                    ],
                                    [
                                        4.356418035538727,
                                        50.82484260833945
                                    ],
                                    [
                                        4.355960742556167,
                                        50.82420340472851
                                    ],
                                    [
                                        4.354549945056779,
                                        50.824725831410035
                                    ],
                                    [
                                        4.354871023108363,
                                        50.82527283661172
                                    ]
                                ]
                            ]
                        }
                    },
                    {
                        "type": "Feature",
                        "properties": {
                            "post_id": 818,
                            "id": "annotationsPolygons-72",
                            "title": "Chicken",
                            "excerpt": "",
                            "post_type": "tdp_annotation",
                            "tag_slugs": [
                                "home",
                                "nourriture"
                            ],
                            "slug": "818-2",
                            "timestamp": 1587293862,
                            "date_human": "avril 19, 2020",
                            "author": 3,
                            "author_name": "casimir",
                            "has_more": false,
                            "image_url": WP_OLD_URL + "/wordpress/wp-content/uploads/2020/04/STGILLES27-150x150.png",
                            "image_bbox": [
                                4.3436181603106,
                                50.831384183461,
                                4.3449521585089,
                                50.83078843047
                            ],
                            "target_id": 72,
                            "minzoom": 14,
                            "image_layer": "annotation-raster-layer-818"
                        },
                        "geometry": {
                            "type": "Polygon",
                            "coordinates": [
                                [
                                    [
                                        4.343951936945023,
                                        50.83135246011166
                                    ],
                                    [
                                        4.344234096444903,
                                        50.83138933183396
                                    ],
                                    [
                                        4.344574633772343,
                                        50.83138625919155
                                    ],
                                    [
                                        4.344662200513684,
                                        50.83107899392888
                                    ],
                                    [
                                        4.344652470875758,
                                        50.83080245349507
                                    ],
                                    [
                                        4.344112475970817,
                                        50.83086390704153
                                    ],
                                    [
                                        4.343937342488134,
                                        50.83112201118741
                                    ],
                                    [
                                        4.343951936945023,
                                        50.83135246011166
                                    ]
                                ]
                            ]
                        }
                    },
                    {
                        "type": "Feature",
                        "properties": {
                            "post_id": 819,
                            "id": "annotationsPolygons-73",
                            "title": "Institut des Filles de Marie",
                            "excerpt": "",
                            "post_type": "tdp_annotation",
                            "tag_slugs": [
                                "home",
                                "scolaires"
                            ],
                            "slug": "819-2",
                            "timestamp": 1587293874,
                            "date_human": "avril 19, 2020",
                            "author": 3,
                            "author_name": "casimir",
                            "has_more": false,
                            "image_url": WP_OLD_URL + "/wordpress/wp-content/uploads/2020/04/STGILLES28-150x150.png",
                            "image_bbox": [
                                4.342983840192,
                                50.827242663462,
                                4.3439176389308,
                                50.826825600167
                            ],
                            "target_id": 73,
                            "minzoom": 14,
                            "image_layer": "annotation-raster-layer-819"
                        },
                        "geometry": {
                            "type": "Polygon",
                            "coordinates": [
                                [
                                    [
                                        4.343210052053079,
                                        50.82719037726691
                                    ],
                                    [
                                        4.343531130104664,
                                        50.82724568977093
                                    ],
                                    [
                                        4.343774371052834,
                                        50.827178085590454
                                    ],
                                    [
                                        4.343715993225274,
                                        50.82688308438452
                                    ],
                                    [
                                        4.343326807708202,
                                        50.82677860434373
                                    ],
                                    [
                                        4.343171133501373,
                                        50.82693839725263
                                    ],
                                    [
                                        4.343210052053079,
                                        50.82719037726691
                                    ]
                                ]
                            ]
                        }
                    },
                    {
                        "type": "Feature",
                        "properties": {
                            "post_id": 863,
                            "id": "annotationsPolygons-74",
                            "title": "Chemin des bêtises",
                            "excerpt": "",
                            "post_type": "tdp_annotation",
                            "tag_slugs": [
                                "home",
                                "trajets"
                            ],
                            "slug": "863-2",
                            "timestamp": 1593095022,
                            "date_human": "juin 25, 2020",
                            "author": 3,
                            "author_name": "casimir",
                            "has_more": false,
                            "image_url": WP_OLD_URL + "/wordpress/wp-content/uploads/2020/06/STGILLES31-150x150.png",
                            "image_bbox": [
                                4.3404299707267,
                                50.831786178614,
                                4.3492343588353,
                                50.827854102222
                            ],
                            "target_id": 75,
                            "minzoom": 11,
                            "image_layer": "annotation-raster-layer-863"
                        },
                        "geometry": {
                            "type": "Polygon",
                            "coordinates": [
                                [
                                    [
                                        4.341406125760694,
                                        50.831412882943
                                    ],
                                    [
                                        4.342682013345136,
                                        50.83189255674802
                                    ],
                                    [
                                        4.343714874723016,
                                        50.83031920823552
                                    ],
                                    [
                                        4.344580655583886,
                                        50.830276036339775
                                    ],
                                    [
                                        4.344550277308067,
                                        50.82905761303919
                                    ],
                                    [
                                        4.346145136788619,
                                        50.82876499483337
                                    ],
                                    [
                                        4.347785563682899,
                                        50.82805502828385
                                    ],
                                    [
                                        4.347481780924698,
                                        50.82782476654355
                                    ],
                                    [
                                        4.345962867133698,
                                        50.8284963601115
                                    ],
                                    [
                                        4.344322440239417,
                                        50.8288225592155
                                    ],
                                    [
                                        4.343016174379155,
                                        50.828669054038734
                                    ],
                                    [
                                        4.341406125760694,
                                        50.831412882943
                                    ]
                                ]
                            ]
                        }
                    },
                    {
                        "type": "Feature",
                        "properties": {
                            "post_id": 865,
                            "id": "annotationsPolygons-92",
                            "title": "Quartier de bourges et de blancs",
                            "excerpt": "",
                            "post_type": "tdp_annotation",
                            "tag_slugs": [
                                "home",
                                "non-frequentes"
                            ],
                            "slug": "865-2",
                            "timestamp": 1593095061,
                            "date_human": "juin 25, 2020",
                            "author": 3,
                            "author_name": "casimir",
                            "has_more": false,
                            "image_url": WP_OLD_URL + "/wordpress/wp-content/uploads/2020/06/ETT14-150x150.png",
                            "image_bbox": [
                                4.3813338557822,
                                50.842573058675,
                                4.418685805334,
                                50.825893099756
                            ],
                            "target_id": 75,
                            "minzoom": 9,
                            "image_layer": "annotation-raster-layer-865"
                        },
                        "geometry": {
                            "type": "Polygon",
                            "coordinates": [
                                [
                                    [
                                        4.394757972669613,
                                        50.841542546397726
                                    ],
                                    [
                                        4.396398399563894,
                                        50.84211802944653
                                    ],
                                    [
                                        4.398585635422935,
                                        50.839777687455836
                                    ],
                                    [
                                        4.406483987136142,
                                        50.83828134171729
                                    ],
                                    [
                                        4.407577605065663,
                                        50.83655472931904
                                    ],
                                    [
                                        4.405208099551702,
                                        50.83152800510585
                                    ],
                                    [
                                        4.400894384385258,
                                        50.8275753150433
                                    ],
                                    [
                                        4.397978069906536,
                                        50.82634722668433
                                    ],
                                    [
                                        4.397127478183575,
                                        50.82684614147647
                                    ],
                                    [
                                        4.401319680246738,
                                        50.828956875831196
                                    ],
                                    [
                                        4.404175238173821,
                                        50.831604753056624
                                    ],
                                    [
                                        4.406483987136142,
                                        50.83636287955365
                                    ],
                                    [
                                        4.405633395413181,
                                        50.83762907343051
                                    ],
                                    [
                                        4.397826178527436,
                                        50.83920217554243
                                    ],
                                    [
                                        4.393451706809352,
                                        50.83782091799067
                                    ],
                                    [
                                        4.393056789223691,
                                        50.838089499049936
                                    ],
                                    [
                                        4.394757972669613,
                                        50.841542546397726
                                    ]
                                ]
                            ]
                        }
                    },
                    {
                        "type": "Feature",
                        "properties": {
                            "post_id": 741,
                            "id": "annotationsPolygons-84",
                            "title": "Boncelles Rolin – Quartier des arabes",
                            "excerpt": "",
                            "post_type": "tdp_annotation",
                            "tag_slugs": [
                                "genres",
                                "home",
                                "non-frequentes",
                                "rencontres"
                            ],
                            "slug": "741-2",
                            "timestamp": 1587205017,
                            "date_human": "avril 18, 2020",
                            "author": 3,
                            "author_name": "casimir",
                            "has_more": false,
                            "image_url": WP_OLD_URL + "/wordpress/wp-content/uploads/2020/04/ETT5-150x150.png",
                            "image_bbox": [
                                4.3936047021203,
                                50.829603352326,
                                4.3974732968953,
                                50.827875581791
                            ],
                            "minzoom": 12,
                            "image_layer": "annotation-raster-layer-741"
                        },
                        "geometry": {
                            "type": "Polygon",
                            "coordinates": [
                                [
                                    [
                                        4.398357798354285,
                                        50.83521656077115
                                    ],
                                    [
                                        4.401562706453297,
                                        50.83520696802656
                                    ],
                                    [
                                        4.401760165246128,
                                        50.83458343539895
                                    ],
                                    [
                                        4.399451416283806,
                                        50.83422849772108
                                    ],
                                    [
                                        4.398357798354285,
                                        50.83521656077115
                                    ]
                                ]
                            ]
                        }
                    },
                    {
                        "type": "Feature",
                        "properties": {
                            "post_id": 735,
                            "id": "annotationsPolygons-104",
                            "title": "Zone non fréquentée",
                            "excerpt": "",
                            "post_type": "tdp_annotation",
                            "tag_slugs": [
                                "non-frequentes"
                            ],
                            "slug": "735-2",
                            "timestamp": 1587204629,
                            "date_human": "avril 18, 2020",
                            "author": 3,
                            "author_name": "casimir",
                            "has_more": false,
                            "image_url": WP_OLD_URL + "/wordpress/wp-content/uploads/2020/04/ETT11-150x150.png",
                            "image_bbox": [
                                4.3832783033893,
                                50.839506344448836,
                                4.393416689696217,
                                50.834979218928986
                            ],
                            "minzoom": 10,
                            "image_layer": "annotation-raster-layer-735"
                        },
                        "geometry": {
                            "type": "Polygon",
                            "coordinates": [
                                [
                                    [
                                        4.395456673013474,
                                        50.83833889436371
                                    ],
                                    [
                                        4.396368021288074,
                                        50.83854992012664
                                    ],
                                    [
                                        4.400286818868858,
                                        50.83774418026125
                                    ],
                                    [
                                        4.400074170938118,
                                        50.8386266565311
                                    ],
                                    [
                                        4.400742493006159,
                                        50.838607472441815
                                    ],
                                    [
                                        4.402595567831179,
                                        50.83356178316426
                                    ],
                                    [
                                        4.407790252996404,
                                        50.82918713198737
                                    ],
                                    [
                                        4.407425713686563,
                                        50.828956875831196
                                    ],
                                    [
                                        4.402200650245519,
                                        50.83344666601759
                                    ],
                                    [
                                        4.400651358178698,
                                        50.837168643268384
                                    ],
                                    [
                                        4.395456673013474,
                                        50.83833889436371
                                    ]
                                ]
                            ]
                        }
                    },
                    {
                        "type": "Feature",
                        "properties": {
                            "post_id": 793,
                            "id": "annotationsPolygons-80",
                            "title": "Trajets",
                            "excerpt": "",
                            "post_type": "tdp_annotation",
                            "tag_slugs": [
                                "activites",
                                "home",
                                "scolaires",
                                "trajets"
                            ],
                            "slug": "793-2",
                            "timestamp": 1587291986,
                            "date_human": "avril 19, 2020",
                            "author": 3,
                            "author_name": "casimir",
                            "has_more": false,
                            "image_url": WP_OLD_URL + "/wordpress/wp-content/uploads/2020/04/STGILLES3-150x150.png",
                            "image_bbox": [
                                4.332495637207739,
                                50.83334071861189,
                                4.355173606578468,
                                50.82321230818509
                            ],
                            "minzoom": 11,
                            "image_layer": "annotation-raster-layer-793"
                        },
                        "geometry": {
                            "type": "Polygon",
                            "coordinates": [
                                [
                                    [
                                        4.340099000325992,
                                        50.83320522811637
                                    ],
                                    [
                                        4.340789804618798,
                                        50.83336807153928
                                    ],
                                    [
                                        4.34174330913563,
                                        50.83326667853139
                                    ],
                                    [
                                        4.342210331756119,
                                        50.83362308934303
                                    ],
                                    [
                                        4.343110323264353,
                                        50.83354934939839
                                    ],
                                    [
                                        4.343947072126062,
                                        50.83369068418992
                                    ],
                                    [
                                        4.345338410349603,
                                        50.83420071487863
                                    ],
                                    [
                                        4.347872981029547,
                                        50.835441971097815
                                    ],
                                    [
                                        4.347838927296804,
                                        50.835269917751106
                                    ],
                                    [
                                        4.345922188625214,
                                        50.83422529453008
                                    ],
                                    [
                                        4.344190313074233,
                                        50.83362308934302
                                    ],
                                    [
                                        4.343265997471184,
                                        50.83340186915962
                                    ],
                                    [
                                        4.342385465238802,
                                        50.83335270897648
                                    ],
                                    [
                                        4.341937901894168,
                                        50.83299629610015
                                    ],
                                    [
                                        4.340673048963676,
                                        50.83315606772611
                                    ],
                                    [
                                        4.340497915480992,
                                        50.833134560039085
                                    ],
                                    [
                                        4.340400619101724,
                                        50.832830378832774
                                    ],
                                    [
                                        4.340303322722456,
                                        50.83271669443869
                                    ],
                                    [
                                        4.339962785395016,
                                        50.832642953062056
                                    ],
                                    [
                                        4.339870353834711,
                                        50.832894902284615
                                    ],
                                    [
                                        4.340099000325992,
                                        50.83320522811637
                                    ]
                                ]
                            ]
                        }
                    },
                    {
                        "type": "Feature",
                        "properties": {
                            "post_id": 729,
                            "id": "annotationsPolygons-81",
                            "title": "Maison",
                            "excerpt": "",
                            "post_type": "tdp_annotation",
                            "tag_slugs": [
                                "home",
                                "prives",
                                "trajets"
                            ],
                            "slug": "729-2",
                            "timestamp": 1587204102,
                            "date_human": "avril 18, 2020",
                            "author": 3,
                            "author_name": "casimir",
                            "has_more": false,
                            "image_url": WP_OLD_URL + "/wordpress/wp-content/uploads/2020/04/FOR7-150x150.png",
                            "image_bbox": [
                                4.328016146125,
                                50.830879773158,
                                4.3344193374768,
                                50.828020058555
                            ],
                            "minzoom": 14,
                            "image_layer": "annotation-raster-layer-729"
                        },
                        "geometry": {
                            "type": "Polygon",
                            "coordinates": [
                                [
                                    [
                                        4.329914501826091,
                                        50.82755605316128
                                    ],
                                    [
                                        4.33034260589487,
                                        50.82751917841104
                                    ],
                                    [
                                        4.329680990515847,
                                        50.82684928204398
                                    ],
                                    [
                                        4.329437749567676,
                                        50.826947616057616
                                    ],
                                    [
                                        4.329914501826091,
                                        50.82755605316128
                                    ]
                                ]
                            ]
                        }
                    },
                    {
                        "type": "Feature",
                        "properties": {
                            "post_id": 647,
                            "id": "annotationsPolygons-93",
                            "title": "Endroits favoris de Coralie",
                            "excerpt": "",
                            "post_type": "tdp_annotation",
                            "tag_slugs": [
                                "home",
                                "rencontres"
                            ],
                            "slug": "647-2",
                            "timestamp": 1587144998,
                            "date_human": "avril 17, 2020",
                            "author": 3,
                            "author_name": "casimir",
                            "has_more": false,
                            "image_url": WP_OLD_URL + "/wordpress/wp-content/uploads/2020/04/JETTE18-150x150.png",
                            "image_bbox": [
                                4.3307117111666,
                                50.878021438765,
                                4.3320457093649,
                                50.877426281214
                            ],
                            "minzoom": 14,
                            "image_layer": "annotation-raster-layer-647"
                        },
                        "geometry": {
                            "type": "Polygon",
                            "coordinates": [
                                [
                                    [
                                        4.330629432413541,
                                        50.87512448412963
                                    ],
                                    [
                                        4.331069917412931,
                                        50.875172406797795
                                    ],
                                    [
                                        4.331525591550232,
                                        50.87511489959009
                                    ],
                                    [
                                        4.331662293791422,
                                        50.87480819328389
                                    ],
                                    [
                                        4.331510402412321,
                                        50.87444397692369
                                    ],
                                    [
                                        4.330811702068461,
                                        50.87441522287929
                                    ],
                                    [
                                        4.330507919310261,
                                        50.87478902407274
                                    ],
                                    [
                                        4.330629432413541,
                                        50.87512448412963
                                    ]
                                ]
                            ]
                        }
                    },
                    {
                        "type": "Feature",
                        "properties": {
                            "post_id": 708,
                            "id": "annotationsPolygons-83",
                            "title": "Zone habituelle",
                            "excerpt": "",
                            "post_type": "tdp_annotation",
                            "tag_slugs": [
                                "home",
                                "quotidien",
                                "rencontres"
                            ],
                            "slug": "708-2",
                            "timestamp": 1587201943,
                            "date_human": "avril 18, 2020",
                            "author": 3,
                            "author_name": "casimir",
                            "has_more": false,
                            "image_url": WP_OLD_URL + "/wordpress/wp-content/uploads/2020/04/JETTE13-150x150.png",
                            "image_bbox": [
                                4.3212939500275,
                                50.881479027547,
                                4.3287643399378,
                                50.878146294659
                            ],
                            "minzoom": 11,
                            "image_layer": "annotation-raster-layer-708"
                        },
                        "geometry": {
                            "type": "Polygon",
                            "coordinates": [
                                [
                                    [
                                        4.323224727682408,
                                        50.87275704297675
                                    ],
                                    [
                                        4.322526027338548,
                                        50.87398391008447
                                    ],
                                    [
                                        4.32492591112833,
                                        50.87473151639198
                                    ],
                                    [
                                        4.325943583368301,
                                        50.871980649450244
                                    ],
                                    [
                                        4.32377153664717,
                                        50.87167392251785
                                    ],
                                    [
                                        4.322374135959449,
                                        50.870130672013886
                                    ],
                                    [
                                        4.320369169755327,
                                        50.87216276761131
                                    ],
                                    [
                                        4.323224727682408,
                                        50.87275704297675
                                    ]
                                ]
                            ]
                        }
                    }
                ]
            },
            "promoteId": "id"
        }

        //now that the data has been populated, load all sources
        for (var key in mapSources) {
          const source = mapSources[key];
          map.addSource(key,source);
        }

        resolve();

      }).catch(function (error) {
        reject(error);
      });

    });
  }

  const initMapLayers = () => {


    initSources()
    .then(function (response) {
      //basemap
      map.addLayer(mapLayers.basemap);

      //rasters
      const addRasterLayersNew = () => {
        /*
        set polygon minzoom properties
        */

        //get size of the polygon at the current zoom
        const getPolygonSize = polygon => {
          const bbox = turf.bbox(polygon);
          const bboxPolygon = turf.bboxPolygon(bbox);

          const p1 = [bbox[0],bbox[3]];
          const p2 = [bbox[2],bbox[1]];

          const p1Pixels = mapboxMap.project(p1);
          const p2Pixels = mapboxMap.project(p2);

          const pixelWidth = (p2Pixels.x - p1Pixels.x);
          const pixelHeight = (p2Pixels.y - p1Pixels.y);

          const zoomLevel = mapboxMap.getZoom();

          return {
            x:pixelWidth,
            y:pixelHeight,
            zoomLevel:zoomLevel
          }

        }

        const getPolygonSizeForZoomlevel = (polygon,zoomLevel) => {

          const polygonSize = getPolygonSize(polygon);

          const currentZoom = polygonSize.zoomLevel;
          const zoomCorrection = Math.pow(2, currentZoom) / Math.pow(2, zoomLevel);
          return {x:polygonSize.x/zoomCorrection,y:polygonSize.y/zoomCorrection,zoomLevel:zoomLevel};

        }

        //get the minimum zoom level for a polygon, based on a minimum size (in pixels) of the polygon's bounding box.
        const getPolygonMinimumZoom = polygon => {
          const polygonSize = getPolygonSize(polygon);
          const minPixels = 15;
          let targetZoom = undefined;
          for (let zoomLevel = 0; zoomLevel < 23; zoomLevel++) {
            const size = getPolygonSizeForZoomlevel(polygon,zoomLevel);
            if ( (size.x > minPixels) || (size.y > minPixels) ){
              targetZoom = zoomLevel;
              break;
            }

          }
          const size = getPolygonSizeForZoomlevel(polygon,targetZoom);
          return targetZoom;

        }

        //init mapbox annotation images
        const getRasterDatas = (feature) => {

          const postId = feature.properties.post_id;
          const imageUrl = feature.properties.image_url;
          const imageBbox = feature.properties.image_bbox;

          //compute minimum zoom and store as a prop
          /*
          const minzoom = getPolygonMinimumZoom(feature);
          feature.properties.minzoom = minzoom;
          */

          const imagePolygon = turf.bboxPolygon(imageBbox);
          let coordinates = imagePolygon.geometry.coordinates[0];
          coordinates.pop();//remove last item of the polygon (the closing vertex)

          const sourceId = "annotation-raster-source-"+postId;
          const layerId = "annotation-raster-layer-"+postId;

          return {
            polygon_id:feature.properties.target_id,
            source:{
              id:sourceId,
              type: 'image',
              url: imageUrl,
              coordinates: coordinates
            },
            layer:{
              id: layerId,
              source: sourceId,
              type: "raster",
              //"minzoom":minzoom
            }
          }

        }

        const polygonSource = map.getSource('annotationsPolygons');

        console.log("POLYGONSOURCE",polygonSource);

        const polygonFeatures = (polygonSource?._data.features || []);
        const rasterDatas = polygonFeatures.map(feature => {
          const datas = getRasterDatas(feature);
          feature.properties.image_layer = datas.layer.id;
          return datas;
        })

        rasterDatas.forEach(data => {

          if (data){
            //add source for this image
            if (map.getSource(data.source.id)) {
              console.log(`Source "${data.source.id}" already exists.`);
              return;//continue
            }

            //add image
            if (map.getLayer(data.layer.id)) {
              console.log(`Layer "${data.layer.id}" already exists.`);
              return;//continue
            }


            const sourceData = {...data.source};delete sourceData.id;//remove ID since to avoid bug

            map.addSource(data.source.id,sourceData);
            map.addLayer(data.layer);


          }

        })

      }

      const addRasterLayers = () => {
        let rasterFeatures = mapGeoJson?.rasters?.features;

        for (var key in rasterFeatures) {
          const feature = rasterFeatures[key];

          const addRaster = (feature) => {
            const sourceId = "source-raster-"+feature.properties.media_id;
            const layerId = "layer-raster-"+feature.properties.media_id;
            let coordinates = feature.geometry.coordinates[0];
            coordinates.pop();//remove last item of the polygon (the closing vertex)

            //add source for this image
            map.addSource(
              sourceId,
              {
                'type': 'image',
                'url': feature.properties.media_url,//'https://upload.wikimedia.org/wikipedia/en/a/a9/Example.jpg'
                'coordinates': coordinates
              }
           )

           //add image
           map.addLayer({
             "id": layerId,
             "source": sourceId,
             "type": "raster",
             "paint": {"raster-opacity": 0.85}
           })

          }

          addRaster(feature);

        }
      }

      addRasterLayersNew();



      //list all layers

      console.log("layers list:");
      console.log(map.getStyle().layers);


    })

  }

  //At init
  useEffect(() => {

    mapboxgl.accessToken = MAPBOX_TOKEN;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/gordielachance/ckkplfnd60xgg17o0ilwozq2o',
      center: [4.3779,50.7786],
      zoom: 10
    });

    map.once('load', (e) => {

      console.log("MAPBOX LOADED!");

      map.resize(); // fit to container

      // Add search
      map.addControl(
        new MapboxGeocoder({
          accessToken: MAPBOX_TOKEN,
          mapboxgl: mapboxgl
        })
      );

      // Add navigation control (the +/- zoom buttons)
      map.addControl(new mapboxgl.NavigationControl(), 'top-right');

      map.on('moveend', (e) => {
        console.log({
          'center':[map.getCenter().lng.toFixed(4),map.getCenter().lat.toFixed(4)],
          'zoom':map.getZoom().toFixed(2)
        })
      });

      setMap(map);
    });


    // Clean up on unmount
    return () => map.remove();

  }, []);

  //when map is initialized
  useEffect(() => {

    if (!map) return;

    initMapLayers();
    setMapboxMap(map);

  }, [map]);

  return (
    <>
      <div id="map" ref={mapContainerRef} />
    </>
  );
}


export default Map
