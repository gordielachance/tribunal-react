import React from "react";
import classNames from "classnames";
import { Label,Button } from 'semantic-ui-react';
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
      <div className="popup-actions">
        {
          props.post_id &&
          <Button onClick={props.onClick}>Ouvrir</Button>
        }
      </div>
    </div>
  );
}
