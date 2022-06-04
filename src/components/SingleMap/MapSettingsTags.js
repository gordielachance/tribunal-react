import { Icon,Popup } from 'semantic-ui-react';
import { useApp } from '../../AppContext';
import { useMap } from './MapContext';
import {getFeaturesTags,getIdsForTag} from "./MapFunctions";

const MapSettingsTags = props => {

  const {tags} = useApp();
  const {
    mapData,
    markerTagsDisabled,
    setMarkerTagsDisabled,
    toggleHoverTag
  } = useMap();

  const creationFeatures = mapData?.sources.creations?.data.features || [];
  const annotationFeatures = mapData?.sources.annotations?.data.features || [];
  const allFeatures = creationFeatures.concat(annotationFeatures);

  const handleClick = slug => {

    const newDisabled = [...markerTagsDisabled];
    const index = newDisabled.indexOf(slug);

    if (index > -1) {//exists in array
      newDisabled.splice(index, 1);
    }else{
      newDisabled.push(slug);
    }

    setMarkerTagsDisabled(newDisabled);

  }


  const isDisabled = slug => {
    return markerTagsDisabled.includes(slug);
  }

  return(
    <div id="map-settings-tags">
      <h5>Tags</h5>
      <ul id="tags-list" className="features-selection">
        {
          getFeaturesTags(allFeatures).map(function(slug) {

            const wpTag = tags.find(term=>term.slug===slug);
            const count = getIdsForTag(slug,allFeatures).length;

            const tagNameEl = <span>{wpTag.name}</span>;

            return(
              <>

                <li
                key={slug}
                className={!isDisabled(slug) ? 'active' : ''}
                onClick={e=>{handleClick(slug)}}
                onMouseEnter={e=>toggleHoverTag(slug,true)}
                onMouseLeave={e=>toggleHoverTag(slug,false)}
                >
                  <span><Icon name="check"/></span>
                  {
                    wpTag.description ?
                      <Popup content={wpTag.description} trigger={tagNameEl} />
                    :
                    tagNameEl
                  }
                  <span className="count">{count}</span>
                </li>
              </>

            )
          })
        }
      </ul>
    </div>
  )
}

export default MapSettingsTags
