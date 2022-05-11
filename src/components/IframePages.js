import React,{useState,useEffect} from "react";
import { Link } from 'react-router-dom';
import { Container } from 'semantic-ui-react';
import {getWpIframeUrl,getWpIframePostUrl,WP_URL,WP_POST_ID_HOME,WP_POST_ID_AGENDA,WP_POST_ID_CONTACT} from "./../Constants";

const IframePage = (props) => {

  const [loading,setLoading] = useState(true);

  return(
    <Container id={props.post_id} className="page horizontal-page iframe-page">
      <div className="page-content">
        <h1>{props.title}</h1>
        {props.before}
        <iframe
        id={"iframe-" + props.post_id}
        src={props.url}
        onLoad={()=>setLoading(false)}
        />
        {props.after}
      </div>
    </Container>

  )
}

export const HomePage = (props) => {

  const before = <ul>
    <li><Link to="/cartes">Click to go to "/cartes"</Link></li>
    <li><Link to="/agenda">Click to go to "/agenda"</Link></li>
    <li><Link to="/credits">Click to go to "/credits"</Link></li>
  </ul>

  return (
    <IframePage
      title="Présentation"
      url={getWpIframePostUrl(WP_POST_ID_HOME)}
      before={before}
    />
  )

}

export const MapListPage = (props) => {

  const before =         <ul>
            <li><Link to="/">click to go to "/"</Link></li>
            <li><Link to="/carte/creations">click to go to "/carte/creations"</Link></li>
          </ul>

  return (
    <IframePage
      id="mapListPage"
      title="Liste des cartes"
      url={getWpIframeUrl( WP_URL + '/?post_type=tdp_map')}
      before={before}
    />
  )

}

export const AgendaPage = (props) => {

  const before = <ul>
    <li><Link to="/">Click to go to "/"</Link></li>
    <li><Link to="/credits">Click to go to "/credits"</Link></li>
  </ul>

  return (
    <IframePage
      title="AGENDA PAGE"
      url={getWpIframePostUrl(WP_POST_ID_AGENDA)}
      before={before}
    />
  )
}

export const CreditsPage = (props) => {

  const before = <ul>
            <li><Link to="/">Click to go to "/"</Link></li>
            <li><Link to="/agenda">Click to go to "/agenda"</Link></li>
          </ul>

  const after = undefined;

  return (
    <IframePage
      title="CREDITS PAGE"
      url={getWpIframePostUrl(WP_POST_ID_CONTACT)}
      before={before}
    />
  )
}
