import React,{useState,useEffect} from "react";
import { Link } from 'react-router-dom';
import { Container,Dimmer,Loader } from 'semantic-ui-react';
import { useApp } from '../AppContext';

const getMapUrl = post => {
  return `/carte/${post.id}/${post.slug}`;
}

const MapListPage = (props) => {

  const {mapPosts} = useApp();
  const loading = (mapPosts === undefined);

  return(
    <Container id="mapListPage" className="page horizontal-page">
      <h1>MAPS LIST</h1>
      <ul>
        <li><Link to="/">click to go to "/"</Link></li>
        <li><Link to="/carte/creations">click to go to "/carte/creations"</Link></li>
      </ul>
      {
      <Dimmer.Dimmable dimmed={loading} id="maps-list-container">
        <Dimmer active={loading} inverted>
          <Loader />
        </Dimmer>
        {
          <ul>
            {
              (mapPosts || []).map((post,key) => {
                return(
                  <li key={post.id}>
                    <h2><Link to={getMapUrl(post)}>{post.title.react}</Link></h2>
                    <div>
                      {post.excerpt.react}
                    </div>
                  </li>
                )

              })
            }
          </ul>
        }
      </Dimmer.Dimmable>
      }
    </Container>
  )
}

export default MapListPage
