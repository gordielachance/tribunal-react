import React,{useState} from "react";
import { Link } from 'react-router-dom';
import { Container } from 'semantic-ui-react';
import {getWpIframePostUrl,WP_POST_ID_HOME,WP_POST_ID_AGENDA,WP_POST_ID_CONTACT} from "./../Constants";

const IframePage = (props) => {

  const [loading,setLoading] = useState(true);

  return(
    <div id={props.id} className="page horizontal-page iframe-page">
      <div className="page-content">
        <h1>{props.title}</h1>
        {props.before}
        <iframe
        id={"iframe-" + props.id}
        title={props.title}
        src={props.url}
        onLoad={()=>setLoading(false)}
        />
      </div>
    </div>

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
      id="homePage"
      title="Présentation"
      url={getWpIframePostUrl(WP_POST_ID_HOME)}
      before={before}
    />
  )

}

export const AgendaPage = (props) => {

  const before = <ul>
    <li><Link to="/credits">Click to go to "/credits"</Link></li>
  </ul>

  return (
    <IframePage
      id="agendaPage"
      title="AGENDA PAGE"
      url={getWpIframePostUrl(WP_POST_ID_AGENDA)}
      before={before}
    />
  )
}

export const CreditsPage = (props) => {

  const before = <ul>
    <li><Link to="/agenda">Click to go to "/agenda"</Link></li>
  </ul>

  return (
    <IframePage
      id="creditsPage"
      title="CREDITS PAGE"
      url={getWpIframePostUrl(WP_POST_ID_CONTACT)}
      before={before}
    />
  )
}
