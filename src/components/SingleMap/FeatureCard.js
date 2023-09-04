import React from "react";
import classNames from "classnames";
import { Label,Icon,Popup } from 'semantic-ui-react';
import { useApp } from '../../AppContext';
import { useMap } from './MapContext';

const TermLabel = props => {

  const tagNameEl = <span>{props.label}</span>;


  return(
    <Label
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

  const {getTermsFromSlugs} = useMap();

  const featureTags = getTermsFromSlugs('post_tag',props.tags);
  const featureCategories = getTermsFromSlugs('category',props.categories);
  const featureFormats = getTermsFromSlugs('tdp_format',props.formats);

  return (

    <>
    {
      (featureTags || featureFormats || featureCategories) &&
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
          featureFormats.map((term,k) => {

            return(
              <li key={k} className="feature-format">
                <TermLabel id={term.term_id} label={term.name} description={term.description}/>
              </li>
            )
          })
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
        tags={feature?.properties.tags}
        categories={feature?.properties.categories}
        formats={feature?.properties.formats}
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
