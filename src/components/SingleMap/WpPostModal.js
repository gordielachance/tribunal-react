import React, {useState,useEffect,useRef} from 'react';
import { Modal,Dimmer,Loader } from 'semantic-ui-react';

import {DEBUG,getWpIframePostUrl} from "../../Constants";
import { useMap } from './MapContext';

//broken: /http://localhost:3000/carte/944/new-demo-map/creation/925/jette-geographie-des-prejuges
//ok: http://localhost:3000/carte/944/new-demo-map/creation/892/prejuquoi

const WpPostModal = (props) => {
  const iframeContent = useRef(null);
  const [title,setTitle] = useState('...');
  const [loading,setLoading] = useState(false);
  const [url,setUrl] = useState();

  useEffect(()=>{

    if (props.postId){
      setLoading(true);
      const url = getWpIframePostUrl(props.postId);
      console.log("LOAD POST ID IN MODAL",props.postId,url);
      setUrl(url);
    }else{
      setUrl();
    }

  },[props.postId])

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

  return(
    <Modal
      className="marker-modal"
      closeIcon
      open={true}
      onClose={props.onClose}
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

export default WpPostModal
