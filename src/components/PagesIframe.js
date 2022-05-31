import React,{useState} from "react";
import { Link } from 'react-router-dom';
import {getWpIframePostUrl,WP_POST_ID_HOME,WP_POST_ID_AGENDA,WP_POST_ID_CONTACT} from "./../Constants";

const PageIframe = (props) => {

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

export const PageHome = (props) => {

  const before = <ul>
    <li><Link to="/cartes">→Click to go to "/cartes"</Link></li>
    <li><Link to="/agenda">↓Click to go to "/agenda"</Link></li>
    <li><Link to="/creations">↓Click to go to "/creations"</Link></li>
    <li><Link to="/credits">↓Click to go to "/credits"</Link></li>
  </ul>

  return (
    <PageIframe
      id="homePage"
      title="Présentation"
      url={getWpIframePostUrl(WP_POST_ID_HOME)}
      before={before}
    />
  )

}

export const PageAgenda = (props) => {

  const before = <ul>
    <li><Link to="/">↑Click to go to "/"</Link></li>
    <li><Link to="/creations">↓Click to go to "/creations"</Link></li>
    <li><Link to="/credits">↓Click to go to "/credits"</Link></li>
  </ul>

  return (
    <PageIframe
      id="agendaPage"
      title="AGENDA PAGE"
      url={getWpIframePostUrl(WP_POST_ID_AGENDA)}
      before={before}
    />
  )
}

export const PageCreations = (props) => {

  const before = <ul>
    <li><Link to="/">↑Click to go to "/"</Link></li>
    <li><Link to="/agenda">↑Click to go to "/agenda"</Link></li>
    <li><Link to="/credits">↓Click to go to "/credits"</Link></li>
  </ul>

  return (
    <PageIframe
      id="creditsPage"
      title="CREDITS PAGE"
      url={getWpIframePostUrl(WP_POST_ID_CONTACT)}
      before={before}
    />
  )
}


export const PageCredits = (props) => {

  const before = <ul>
    <li><Link to="/">↑Click to go to "/"</Link></li>
    <li><Link to="/creations">↑Click to go to "/creations"</Link></li>
    <li><Link to="/agenda">↑Click to go to "/agenda"</Link></li>
  </ul>

  return (
    <PageIframe
      id="creditsPage"
      title="CREDITS PAGE"
      url={getWpIframePostUrl(WP_POST_ID_CONTACT)}
      before={before}
    />
  )
}
