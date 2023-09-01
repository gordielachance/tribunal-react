import React from "react";
import classNames from "classnames";
import { Label,Icon,Popup } from 'semantic-ui-react';
import { useApp } from '../../AppContext';
import { useMap } from './MapContext';
import {getFormatIcon,getFormatText} from "./MapFunctions";

const TermLabel = props => {

  const {
    toggleIsolateTermId
  } = useMap();

  const handleHover = e => {
    toggleIsolateTermId(props.id,true);
  }

  const handleOut = e => {
    toggleIsolateTermId(props.id,false);
  }

  const tagNameEl = <span>{props.label}</span>;


  return(
    <Label
    onMouseEnter={handleHover}
    onMouseLeave={handleOut}
    className={props.className}
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

  const {getTagsFromSlugs,categories,getCategoriesFromSlugs} = useMap();

  const featureTags = getTagsFromSlugs(props.tags);
  const featureCategories = getCategoriesFromSlugs(props.categories);

  const featureFormat = props.format;
  const formatIcon = featureFormat ? getFormatIcon(featureFormat) : undefined;
  const formatText = featureFormat ? getFormatText(featureFormat) : undefined;

  return (

    <>
    {
      (featureTags || formatText || featureCategories) &&
        <ul className="feature-terms feature-meta">
        {
          featureCategories.map((term,k) => {

            return(
              <li key={k} className="feature-category">
                <TermLabel id={term.term_id} label={term.name} description={term.description}/>
              </li>
            )
          })
        }
        {
          formatText &&
          <li className="feature-format">
            <TermLabel label={formatText} icon={formatIcon}/>
          </li>
        }
        {
          featureTags.map((term,k) => {

            return(
              <li key={k} className="feature-tag">
                <TermLabel id={term.term_id} label={term.name} description={term.description}/>
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
        <FeatureTags
        tags={feature?.properties?.tags}
        categories={feature?.properties?.categories}
        format={format}
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
