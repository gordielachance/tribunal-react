import React, {useState,useEffect,useRef} from 'react';
import { Modal,Dimmer,Loader } from 'semantic-ui-react';
import {getWpIframePostUrl} from "./../Constants";
import { useParams,useNavigate } from 'react-router-dom';
import {DEBUG,getMapUrl} from "./../Constants";


//broken: /http://localhost:3000/carte/944/new-demo-map/creation/925/jette-geographie-des-prejuges
//ok: http://localhost:3000/carte/944/new-demo-map/creation/892/prejuquoi

const CreationModal = (props) => {
  const navigate = useNavigate();
  const {mapPostId,mapPostSlug,featurePostId} = useParams();
  const iframeContent = useRef(null);
  const [title,setTitle] = useState('...');
  const [loading,setLoading] = useState(false);
  const [open,setOpen] = useState(false);
  const [url,setUrl] = useState();


  useEffect(()=>{
    console.log("!!!MODAL ID:",featurePostId);
    const hasId = (featurePostId!==undefined);

    if (hasId){
      setOpen(true);
      setLoading(true);
      const url = getWpIframePostUrl(featurePostId);
      console.log("!!!MODAL URL:",url);
      setUrl(url)
    }else{
      setOpen(false);
      setUrl();
    }

  },[featurePostId])

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

  const handleClose = () => {
    const mapUrl = getMapUrl(mapPostId,mapPostSlug);
    navigate(mapUrl);
    setOpen(false);
  }

  return(
    <Modal
      className="marker-modal"
      closeIcon
      open={open}
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
