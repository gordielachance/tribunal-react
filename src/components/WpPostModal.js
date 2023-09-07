import React, {useState,useEffect,useRef} from 'react';
import { Modal,Dimmer,Loader } from 'semantic-ui-react';
import he from 'he';

import classNames from "classnames";
import {DEBUG,getWpIframePostUrl} from "../Constants";
import {BGPopup} from "./PageBackgrounds";
import { useApp } from '../AppContext';

//broken: /http://localhost:3000/carte/944/new-demo-map/creation/925/jette-geographie-des-prejuges
//ok: http://localhost:3000/carte/944/new-demo-map/creation/892/prejuquoi

const WpPostModal = (props) => {
  const iframeContent = useRef(null);
  const [loading,setLoading] = useState(false);
  const [url,setUrl] = useState();
  const {verticalScreen,mobileScreen} = useApp();

  const title = he.decode(props.post?.title.rendered);//decode HTML entities

  useEffect(()=>{

    let url;

    if (props.post){
      setLoading(true);
      url = getWpIframePostUrl(props.post.id);
      console.log("LOAD POST ID IN MODAL",props.post.id,url);
    }

    setUrl(url);

  },[props.post])

  const handleLoaded = () => {
    setLoading(false);
  }

  return(
    <Modal
      className={classNames({
        'post-modal': true,
        mobile: mobileScreen
      })}
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
              id="feature-iframe"
              ref={iframeContent}
              src={url}
              onLoad={handleLoaded}
              />
            }
          </Modal.Description>
          <BGPopup/>
        </Dimmer.Dimmable>
    </Modal>
  )

}

export default WpPostModal
