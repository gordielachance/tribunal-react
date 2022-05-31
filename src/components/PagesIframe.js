import React,{useState} from "react";
import { Link } from 'react-router-dom';
import {getWpIframePostUrl,WP_POST_ID_HOME,WP_POST_ID_AGENDA,WP_POST_ID_CONTACT} from "./../Constants";
import PageMenu from "./PageMenu";

const PageIframe = (props) => {

  const [loading,setLoading] = useState(true);

  return(
    <div id={props.id} className="page horizontal-page iframe-page">
      <div className="page-content">
        <h1>{props.title}</h1>
        <PageMenu/>
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
  return (
    <PageIframe
      id="homePage"
      title="Présentation"
      url={getWpIframePostUrl(WP_POST_ID_HOME)}
    />
  )

}

export const PageAgenda = (props) => {
  return (
    <PageIframe
      id="agendaPage"
      title="AGENDA PAGE"
      url={getWpIframePostUrl(WP_POST_ID_AGENDA)}
    />
  )
}

export const PageCreations = (props) => {
  return (
    <PageIframe
      id="creationsPage"
      title="CREATIONS PAGE"
      url={getWpIframePostUrl(WP_POST_ID_CONTACT)}
    />
  )
}


export const PageCredits = (props) => {
  return (
    <PageIframe
      id="creditsPage"
      title="CREDITS PAGE"
      url={getWpIframePostUrl(WP_POST_ID_CONTACT)}
    />
  )
}
