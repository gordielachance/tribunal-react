import React, {useState,useEffect,useRef} from 'react';
import { Modal,Dimmer,Loader } from 'semantic-ui-react';
import {WP_URL} from "./../Constants";

const MarkerPost = (props) => {
  const iframeContent = useRef(null);
  const [title,setTitle] = useState('...');
  const [loading,setLoading] = useState(true);
  const iframeUrl = WP_URL + '/?p=' + props.post_id + '&iframe';

  const handleLoaded = () => {
    const iframeItem = iframeContent.current;

    console.log("IFRAME",iframeItem);

    try{
      const iFrameTitle = iframeItem.contentWindow.document.title;
      setTitle(iFrameTitle);
    } catch (error) {
      console.log("error getting iframe title",error);
    }

    setLoading(false);
  }

  return(
    <Modal
      className="marker-modal"
      closeIcon
      open={(props.post_id !== undefined)}
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
            <iframe
            id="marker-iframe"
            ref={iframeContent}
            src={iframeUrl}
            onLoad={handleLoaded}
            />
          </Modal.Description>
        </Dimmer.Dimmable>
    </Modal>
  )

}

export default MarkerPost
