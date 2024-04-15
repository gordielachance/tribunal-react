import React, {useState,useEffect,useRef} from 'react';
import { Modal,Dimmer,Loader } from 'semantic-ui-react';
import classNames from "classnames";
import {createRoot} from 'react-dom/client'
import Markdown from 'react-markdown';
import {DEBUG,getWpIframePostUrl} from "../Constants";
import {BGPopup} from "./PageBackgrounds";
import { useApp } from '../AppContext';
import StrapiAPI from "../strapiAPI/api";

//broken: /http://localhost:3000/carte/944/new-demo-map/creation/925/jette-geographie-des-prejuges
//ok: http://localhost:3000/carte/944/new-demo-map/creation/892/prejuquoi

const PostModal = (props) => {
  const [loading,setLoading] = useState(false);
  const [feature,setFeature] = useState();
  const {verticalScreen,mobileScreen} = useApp();

  useEffect(()=>{

    let url;

    if (props.id){

      setLoading(true);

      StrapiAPI.getSingleFeature(props.id,{geojson:true})
      .then(resp => resp.data)
      .then(resp=>setFeature(resp))
      .catch(error=>console.error(`ERROR GETTING 'ITEM`,props.id,error))
      .finally(() => {
         setLoading(false);
       });
    }

  },[props.id])

  useEffect(()=>{
    if (feature === undefined) return;
    console.log("FEATURE YO",feature);
  },[feature])

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
          <span>{props.title}</span>
      }
      </Modal.Header>
        <Dimmer.Dimmable as={Modal.Content} dimmed={loading}>
          <Dimmer active={loading} inverted>
            <Loader />
          </Dimmer>
          <Modal.Description>
            {
              feature &&
              <xmp>{feature.properties.post}</xmp>
            }
            {
              feature &&
              <Markdown>{feature.properties.post}</Markdown>

            }
          </Modal.Description>
          <BGPopup/>
        </Dimmer.Dimmable>
    </Modal>
  )

}

export default PostModal
