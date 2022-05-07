import React, { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import { useApp } from '../AppContext';

const MapPopup = (props) => {
  const {mapboxMap} = useApp();
  const popupRef = useRef();

  //https://docs.mapbox.com/mapbox-gl-js/api/markers/#popup
  const popup = new mapboxgl.Popup(props.settings)
  .on('close', function(e) {
    if (typeof props.onClose === 'function'){
      props.onClose(e);
    }
  })


  //on init
  useEffect(() => {
    if (mapboxMap === undefined) return;

    popup
    .setLngLat(props.lngLat)
    .setDOMContent(popupRef.current)
    .addTo(mapboxMap)

    return popup.remove;
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
