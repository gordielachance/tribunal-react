import React, {useState,useEffect} from 'react';
import axios from 'axios';
import { Modal,Dimmer,Loader } from 'semantic-ui-react';
import {WP_URL} from "./../Constants";

const MarkerPost = (props) => {
  const [loading,setLoading] = useState(true);
  const [post,setPost] = useState();

  const getPostData = async(post_id) => {
    const url = WP_URL + "/wp-json/wp/v2/posts/?filter[p]=" + post_id;
    return axios.get(url);
  }

  useEffect(() => {

    if (props.post_id === undefined) return;

    setPost();
    setLoading(true);

    getPostData(props.post_id)
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
      className="marker-post"
      closeIcon
      open={props.open}
      onClose={props.onClose}
    >
      <Modal.Header>Login</Modal.Header>
        <Dimmer.Dimmable as={Modal.Content} dimmed={loading}>
          <Dimmer active={loading} inverted>
            <Loader />
          </Dimmer>
          <Modal.Description>
            TOTO
          </Modal.Description>
        </Dimmer.Dimmable>
    </Modal>
  )

}

export default MarkerPost
