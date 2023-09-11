import React from "react";
import classNames from "classnames";
import { Label,Icon,Popup } from 'semantic-ui-react';
import { useApp } from '../../AppContext';
import { useMap } from './MapContext';

const TermLabel = props => {
  const {getMapTermById} = useMap();
  const { id, ...otherProps } = props;

  const term = getMapTermById(id);

  const tagNameEl = <span>{term.name}</span>;


  return(
    <Label {...otherProps}>
      {
        props.description ?
          <Popup content={term.description} trigger={tagNameEl} />
        :
        tagNameEl
      }
    </Label>
  )
}

const FeatureTags = (props) => {

  return (

    <>
    {
      (props.tags || props.categories || props.formats) &&
        <ul className="feature-terms feature-meta">
        {
          (props.categories || []).map((id,k) => {
            return(
              <li key={k} className="feature-category">
                <TermLabel id={id}/>
              </li>
            )
          })
        }
        {
          (props.formats || []).map((id,k) => {
            return(
              <li key={k} className="feature-format">
                <TermLabel id={id}/>
              </li>
            )
          })
        }
        {
          (props.tags || []).map((id,k) => {
            return(
              <li key={k} className="feature-tag">
                <TermLabel id={id}/>
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
  const {getMapPostById} = useMap();

  const { id, ...otherProps } = props;

  const post = getMapPostById(id);

  const post_tag_ids = post?.tags;
  const post_categories_ids = post?.categories;
  const post_format_ids = post?.formats;

  return(
    <div
    className={classNames({
      'feature-card':  true
    })}
    >
      <div className="feature-header">
        <p className="feature-title">
          <span className="feature-icon" style={{'--point-color': post?.color}}>
            <Icon name="circle"/>
          </span>
          {post?.title}
        </p>
        <FeatureTags
        tags={post_tag_ids}
        categories={post_categories_ids}
        formats={post_format_ids}
        />

      </div>
      {
        post?.excerpt &&
        <div className="feature-description">
          {post?.excerpt}
        </div>
      }
    </div>
  )
}
