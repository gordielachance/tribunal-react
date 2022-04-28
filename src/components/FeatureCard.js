import React,{useState,useEffect} from "react";
import classNames from "classnames";
import { Label,Button,Icon } from 'semantic-ui-react';
import {getHumanDistance} from "../Constants";

const FeatureTags = (props) => {

  const [slugs,setSlugs] = useState();

  useEffect(()=>{
    let slugs = (props.tags || []);
    if (props.format){
      slugs.push(props.format);
    }
    setSlugs(slugs);
  },[props.tags,props.format])

  const getIcon = slug => {
    switch(slug){
      case 'gallery':
        return 'images outline';
      break;
      case 'link':
        return 'linkify';
      break;
      case 'image':
        return 'image outline';
      break;
      case 'quote':
        return 'quote left';
      break;
      case 'video':
        return 'video';
      break;
      case 'audio':
        return 'volume down';
      break;
    }
  }

  return (
    <>
    {
      (slugs || []).length > 0 &&
        <ul className="feature-tags feature-meta">
        {
            slugs.map((slug,k) => {
              const icon = getIcon(slug);
              return(
                <li key={k}>
                  <Label>
                    {icon &&
                      <Icon name={icon}/>
                    }
                    {slug}
                  </Label>
                </li>
              )
            })
        }
        </ul>
    }
    </>
  )
}

export const FeatureCard = props => {

  const title = props.feature?.properties.title;
  const date = props.feature?.properties.timestamp;
  const description=  props.feature?.properties.excerpt;
  const post_id = props.feature?.properties.post_id;
  const format = props.feature?.properties.format;

  let tags = props.feature?.properties.layer_slugs;
  tags = (typeof tags === 'string') ? JSON.parse(tags) : tags;

  return(
    <div className="feature-card">
      <div className="feature-header">
        <p className="feature-title">{title}</p>
        <p className="feature-date feature-meta">{date}</p>
        <FeatureTags tags={tags} format={format}/>
      </div>
      {
        description &&
        <div className="feature-description">
          {description}
        </div>
      }
    </div>
  )
}

export const FeaturePopup = (props) => {

  const post_id = props.feature?.properties.post_id;

  return (
    <div className="feature-popup">
      <FeatureCard feature={props.feature}/>
      <div className="feature-actions">
        {
          post_id &&
          <Button onClick={props.onClick}>Ouvrir</Button>
        }
      </div>
    </div>
  );
}
