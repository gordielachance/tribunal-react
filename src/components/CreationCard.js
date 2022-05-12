import React from "react";
import { Label,Icon } from 'semantic-ui-react';
import {getFormatIcon,getFormatText} from "../Constants";
import { useApp } from '../AppContext';
import { useMap } from '../MapContext';

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
            <TagLabel highlightTags={props.highlightTags} label={formatText} icon={formatIcon}/>
          </li>
        }
        {
            (props.tags || []).map((slug,k) => {

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


  const title = props.feature?.properties.title;
  const description=  props.feature?.properties.excerpt;
  const format = props.feature?.properties.format;
  const tags = maybeDecodeJson(props.feature?.properties.tag_slugs);

  return(
    <div className="feature-card">
      <div className="feature-header">
        <p className="feature-title">{title}</p>
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
