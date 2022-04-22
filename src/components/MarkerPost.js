import React, {useState,useEffect} from 'react';
import axios from 'axios';
import { Modal,Dimmer,Loader } from 'semantic-ui-react';
import {WP_URL} from "./../Constants";

const MarkerPost = (props) => {
  const [loading,setLoading] = useState(false);
  const [post,setPost] = useState();

  const getMarkerPost = async(post_id) => {
    const url = WP_URL + "/wp-json/geoposts/v1/marker/" + post_id;
    return axios.get(url);
  }

  useEffect(() => {

    if (props.post_id === undefined) return;

    setPost();
    setLoading(true);

    getMarkerPost(props.post_id)
    .then(response => response.data)
    .then(response => {
      console.log("BACKEND POST RESPONSE",response);
      setPost(response);
    })
    .catch(error => {
      console.error(error);
    })
    .finally(function(){
      setLoading(false);
    })

  },[props.post_id]);

  return(
    <Modal
      className="marker-modal"
      closeIcon
      open={(props.post_id !== undefined)}
      onClose={props.onClose}
    >
      <Modal.Header>
      {
        post ?
          <span>{post.post_title}</span>
        :
          <span>...</span>
      }
      </Modal.Header>
        <Dimmer.Dimmable as={Modal.Content} dimmed={loading}>
          <Dimmer active={loading} inverted>
            <Loader />
          </Dimmer>
          <Modal.Description>
          {
            post &&
            <div
              dangerouslySetInnerHTML={{
                __html: post.post_content
              }}>
            </div>
          }
          </Modal.Description>
        </Dimmer.Dimmable>
    </Modal>
  )

}

export default MarkerPost
