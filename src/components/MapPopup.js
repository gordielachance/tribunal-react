import React, { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import { useApp } from '../AppContext';

const MapPopup = ({ children, lngLat, settings, ...mapboxPopupProps }) => {
  const {map} = useApp();
  const popupRef = useRef();

  useEffect(() => {
    if (map === undefined) return;

    //https://docs.mapbox.com/mapbox-gl-js/api/markers/#popup
    const popup = new mapboxgl.Popup(settings)

    popup
    .setLngLat(lngLat)
    .setDOMContent(popupRef.current)
    .addTo(map)
    .on('close', function(e) {
      console.log("POPUP CLOSED");
    })

    return popup.remove;
  }, [children, lngLat]);

  return (
    <div style={{ display: "none" }}>
      <div ref={popupRef}>{children}</div>
    </div>
  );
};

export default MapPopup;
