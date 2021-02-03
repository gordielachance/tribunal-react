import React from "react";
import './MarkerPopup.scss';
import classNames from "classnames";

export const MarkerPopup = (props) => {

  return (
    <div
    className={classNames({
      'marker-popup': true
    })}
    >
      <div className="popup-title">{props.title}</div>
      <div className="popup-description">

      {
        /*
        props.district &&
        <p>
          <label>District</label>
          <span>{props.district}</span>
        </p>
        */
      }

      {props.surface &&
        <p>
          <label>Surface</label>
          <span>{props.surface} sqm</span>
        </p>
      }
      {props.delivery &&
        <p>
          <label>Delivery Date</label>
          <span>{props.delivery}</span>
        </p>
      }
      {props.status &&
        <p>
          <label>Status</label>
          <span>{props.status.name}</span>
        </p>
      }
      </div>
    </div>
  );
}
