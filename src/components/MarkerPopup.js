import React from "react";
import classNames from "classnames";
import { Icon,Label,Checkbox,Accordion,Button } from 'semantic-ui-react';
import './MarkerPopup.scss';

export const MarkerPopup = (props) => {

  const tags = (props.tags || []);

  return (
    <div
    className={classNames({
      'marker-popup': true
    })}
    >
      <div className="popup-title">{props.title}</div>
      <div className="popup-content">
      {props.description}
      {
        /*
        props.district &&
        <p>
          <label>District</label>
          <span>{props.district}</span>
        </p>
        */
      }

      <p>
        {
            tags.map((tag,k) => {
              return(
                <Label key={k}>{tag}</Label>
              )
            })
        }
      </p>
      </div>
      <div class="popup-actions">
        <Button onClick={props.onClick}>Ouvrir</Button>
      </div>
    </div>
  );
}
