import React from "react";
import classNames from "classnames";
import { Label,Icon,Popup } from 'semantic-ui-react';
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

  const tagNameEl = <span>{props.label}</span>;


  return(
    <Label
    onMouseEnter={handleHover}
    onMouseLeave={handleOut}
    className={props.highlightTags ? 'clickable' : ''}
    >
      {props.icon &&
        <Icon name={props.icon}/>
      }
      {
        props.description ?
          <Popup content={props.description} trigger={tagNameEl} />
        :
        tagNameEl
      }
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
            featureTags.map((tag,k) => {

              return(
                <li key={k}>
                  <TagLabel highlightTags={props.highlightTags} slug={tag.slug} label={tag.name} description={tag.description}/>
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

  const feature = props.feature;

  const title = feature?.properties?.title;
  const description=  feature?.properties?.excerpt;
  const format = feature?.properties?.format;
  const color = feature?.properties?.color;
  const tags = feature?.properties?.tags;

  return(
    <div
    className={classNames({
      'feature-card':  true
    })}
    data-source={feature.source}
    >
      <div className="feature-header">
        <p className="feature-title">
          <span className="feature-icon" style={{'--point-color': color}}>
            <Icon name="circle"/>
          </span>
          {title}
        </p>
        {
          //TOUFIX URGENT
          /*
          <FeatureTags
          tags={tags}
          format={format}
          highlightTags={props.highlightTags}
          />
          */
        }

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
