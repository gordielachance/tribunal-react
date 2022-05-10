import React,{useState,useEffect} from "react";
import { Link } from 'react-router-dom';
import { Container,Dimmer,Loader,Segment } from 'semantic-ui-react';
import { useApp } from '../AppContext';
import {getMapUrl} from "./../Constants";

const MapListPage = (props) => {

  const {mapPosts} = useApp();
  const loading = (mapPosts === undefined);

  return(
    <Container id="mapListPage" className="page horizontal-page padding-page">
      <div className="page-content">
        <h1>MAPS LIST</h1>
        <ul>
          <li><Link to="/">click to go to "/"</Link></li>
          <li><Link to="/carte/creations">click to go to "/carte/creations"</Link></li>
        </ul>
        {

        <>
          {
            loading ?
            <Loader active />
            :
            <ul>
              {
                (mapPosts || []).map((post,key) => {
                  return(
                    <li key={post.id}>
                      <h2><Link to={getMapUrl(post.id,post.slug)}>{post.title.react}</Link></h2>
                      <div>
                        {post.excerpt.react}
                      </div>
                    </li>
                  )

                })
              }
            </ul>
          }

        </>
        }
      </div>
    </Container>
  )
}

export default MapListPage
