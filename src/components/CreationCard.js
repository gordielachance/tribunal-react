import React,{useState,useEffect} from "react";
import classNames from "classnames";
import { Label,Button,Icon } from 'semantic-ui-react';
import {getHumanDistance,getFormatIcon,getFormatText} from "../Constants";
import { useApp } from '../AppContext';

function maybeDecodeJson(value){
  return (typeof value === 'string') ? JSON.parse(value) : value;
}

const TagLabel = props => {
  return(
    <Label title={props.description}>
      {props.icon &&
        <Icon name={props.icon}/>
      }
      {props.label}
    </Label>
  )
}

const FeatureTags = (props) => {

  const formatIcon = props.format ? getFormatIcon(props.format) : undefined;
  const formatText = props.format ? getFormatText(props.format) : undefined;

  const {tags} = useApp();

  return (
    <>
    {
      (props.tags || props.format) &&
        <ul className="feature-tags feature-meta">
        {
          formatText &&
          <li>
            <TagLabel label={formatText} icon={formatIcon}/>
          </li>
        }
        {
            (props.tags || []).map((slug,k) => {

              const tag = tags.find(term => term.slug === slug);
              const name = tag?.name || slug;
              const desc = tag?.description;

              return(
                <li key={k}>
                  <TagLabel label={name} description={desc}/>
                </li>
              )
            })
        }
        </ul>
    }
    </>
  )
}

export const CreationCard = props => {

  const post_id = props.feature?.properties.post_id;
  const title = props.feature?.properties.title;
  const date = props.feature?.properties.timestamp;
  const description=  props.feature?.properties.excerpt;
  const format = props.feature?.properties.format;
  const tags = maybeDecodeJson(props.feature?.properties.tag_slugs);

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
