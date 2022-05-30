import React, { useEffect, useRef } from "react";
import mapboxgl from '!mapbox-gl'; // eslint-disable-line import/no-webpack-loader-syntax
import { useMap } from '../MapContext';

const MapPopup = (props) => {
  const {mapboxMap} = useMap();
  const popupRef = useRef();

  //on init
  useEffect(() => {
    if (mapboxMap === undefined) return;

    //https://docs.mapbox.com/mapbox-gl-js/api/markers/#popup
    const popup = new mapboxgl.Popup(props.settings)

    popup
    .setLngLat(props.lngLat)
    .setDOMContent(popupRef.current)
    .addTo(mapboxMap)
    .on('close',props.onClose)

    return () => {
      popup.remove();
    };

  }, [props.lngLat,props.children]);

  return (
    <div style={{ display: "none" }}>
      <div ref={popupRef}>
      {props.children}
      </div>

    </div>
  );
};

export default MapPopup;
