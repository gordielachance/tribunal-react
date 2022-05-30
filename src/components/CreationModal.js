import React, {useState,useEffect,useRef} from 'react';
import { Modal,Dimmer,Loader } from 'semantic-ui-react';
import {getWpIframePostUrl,getFeatureUrl} from "./../Constants";
import { useParams,useNavigate } from 'react-router-dom';
import {DEBUG} from "./../Constants";
import { useMap } from '../MapContext';

//broken: /http://localhost:3000/carte/944/new-demo-map/creation/925/jette-geographie-des-prejuges
//ok: http://localhost:3000/carte/944/new-demo-map/creation/892/prejuquoi

const CreationModal = (props) => {
  const navigate = useNavigate();
  const {mapPostId,mapPostSlug} = useParams();
  const {activeFeature} = useMap();
  const iframeContent = useRef(null);
  const [title,setTitle] = useState('...');
  const [loading,setLoading] = useState(false);
  const [url,setUrl] = useState();

  useEffect(()=>{

    const post_id = activeFeature?.properties.post_id;

    if (post_id){
      setLoading(true);
      const url = getWpIframePostUrl(post_id);
      console.log("LOAD POST ID IN MODAL",post_id,url);
      setUrl(url);
    }else{
      setUrl();
    }

  },[activeFeature])

  const handleLoaded = () => {
    const iframeItem = iframeContent.current;

    try{
      const iFrameTitle = iframeItem.contentWindow.document.title;
      setTitle(iFrameTitle);
    } catch (error) {
      DEBUG && console.log("Error getting iframe title",error);
    }

    setLoading(false);
  }

  const handleClose = () => {
    const url = getFeatureUrl(mapPostId,mapPostSlug,activeFeature.properties.source,activeFeature.properties.id);
    navigate(url);
  }

  return(
    <Modal
      className="marker-modal"
      closeIcon
      open={true}
      onClose={handleClose}
    >
      <Modal.Header>
      {
          <span>{title}</span>
      }
      </Modal.Header>
        <Dimmer.Dimmable as={Modal.Content} dimmed={loading}>
          <Dimmer active={loading} inverted>
            <Loader />
          </Dimmer>
          <Modal.Description>
            {
              url &&
              <iframe
              id="marker-iframe"
              ref={iframeContent}
              src={url}
              onLoad={handleLoaded}
              />
            }

          </Modal.Description>
        </Dimmer.Dimmable>
    </Modal>
  )

}

export default CreationModal
