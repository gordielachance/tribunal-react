import React,{useState,useEffect} from "react";
import { Link } from 'react-router-dom';
import { Container,Dimmer,Loader } from 'semantic-ui-react';
import {WP_URL} from "./../Constants";
import axios from 'axios';

const getMapUrl = post => {
  return `/carte/${post.id}/${post.slug}`;
}

const getMapPosts = () => {
  return axios.get(
    WP_URL + '/wp-json/wp/v2/maps', //URL
    {
    headers: {
      'Content-Type': 'application/json'
    }
  })
  .then(response => response.data)
}

const MapListPage = (props) => {

  const [loading,setLoading] = useState();
  const [posts,setPosts] = useState();

  //load map posts
  useEffect(()=>{
    setLoading(true);
    getMapPosts()
    .then(posts => {
      console.log("MAPS POPULATED",posts);
      setPosts(posts);

    })
    .catch(error => {
      // react on errors.
      console.error("error while loading maps",error);
    })
    .finally(()=>{
      setLoading(false);
    })
  },[])


  return(
    <Container id="mapListPage" className="page horizontal-page">
      <h1>MAPS LIST</h1>
      <ul>
        <li><Link to="/">click to go to "/"</Link></li>
        <li><Link to="/carte/creations">click to go to "/carte/creations"</Link></li>
      </ul>
      <Dimmer.Dimmable dimmed={loading}>
        <Dimmer active={loading} inverted>
          <Loader />
        </Dimmer>
        {
          ( (posts || []).length > 0 ) &&
          <ul>
            {
              posts.map((post,key) => {
                return(
                  <li key={post.id}>
                    <h2><Link to={getMapUrl(post)}>{post.title.rendered}</Link></h2>
                    <div>
                      {post.excerpt.rendered}
                    </div>
                  </li>
                )

              })
            }
          </ul>
        }
      </Dimmer.Dimmable>
    </Container>
  )
}

export default MapListPage
