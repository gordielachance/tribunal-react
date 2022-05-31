import React from "react";
import classNames from "classnames";
import { Label,Icon } from 'semantic-ui-react';
import { useApp } from '../../AppContext';
import { useMap } from './MapContext';
import {getFormatIcon,getFormatText} from "./MapFunctions";

function maybeDecodeJson(value){
  return (typeof value === 'string') ? JSON.parse(value) : value;
}

const TagLabel = props => {

  const {
    toggleHoverTag
  } = useMap();

  const handleHover = e => {
    if (!props.highlightTags) return;
    toggleHoverTag(props.slug,true);
  }

  const handleOut = e => {
    if (!props.highlightTags) return;
    toggleHoverTag(props.slug,false);
  }


  return(
    <Label
    title={props.description}
    onMouseEnter={handleHover}
    onMouseLeave={handleOut}
    className={props.highlightTags ? 'clickable' : ''}
    >
      {props.icon &&
        <Icon name={props.icon}/>
      }
      {props.label}
    </Label>
  )
}

const FeatureTags = (props) => {

  const featureTags = (props.tags || []);
  const featureFormat = props.format;
  const formatIcon = featureFormat ? getFormatIcon(featureFormat) : undefined;
  const formatText = featureFormat ? getFormatText(featureFormat) : undefined;

  const {tags} = useApp();

  return (
    <>
    {
      (featureTags || formatText) &&
        <ul className="feature-tags feature-meta">
        {
          formatText &&
          <li>
            <TagLabel highlightTags={props.highlightTags} label={formatText} icon={formatIcon}/>
          </li>
        }
        {
            featureTags.map((slug,k) => {

              const tag = (tags || []).find(term => term.slug === slug);
              const name = tag?.name || slug;
              const desc = tag?.description;

              return(
                <li key={k}>
                  <TagLabel highlightTags={props.highlightTags} slug={slug} label={name} description={desc}/>
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

  const feature = props.feature;
  const title = feature?.properties.title;
  const description=  feature?.properties.excerpt;
  const format = feature?.properties.format;
  const tags = maybeDecodeJson(feature?.properties.tag_slugs);
  const post_type = feature?.properties.post_type;

  return(
    <div
    className={classNames({
      'feature-card':  true,
      creation:   (post_type==='tdp_creation'),
      annotation:   (post_type==='tdp_annotation')
    })}
    data-source={feature.source}
    >
      <div className="feature-header">
        <p className="feature-title">
          <span className="feature-icon">
            <Icon name="circle"/>
          </span>
          {title}
        </p>
        <FeatureTags
        tags={tags}
        format={format}
        highlightTags={props.highlightTags}
        />
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
