import React,{useState} from "react";
import {getWpIframePostUrl,WP_POST_ID_HOME,WP_POST_ID_CONTACT} from "./../Constants";
import PageMenu from "./PageMenu";
import {DEBUG,ImageLogo} from "../Constants";

const PageIframe = (props) => {

  const [loading,setLoading] = useState(true);

  return(
    <div id={props.id} className="page iframe-page">
      <div className="page-content">
        <div className="page-header">
          <h1>{props.title}</h1>
          <PageMenu/>
        </div>
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

/*
</div>
<PageIframe
  id="homePage"
  title="Présentation"
  url={getWpIframePostUrl(WP_POST_ID_HOME)}
/>
*/

  return (
    <div id="homePage" className="page">
      <div id="homeLogo">
        <img src={ImageLogo}/>
      </div>
      <div id="homeContent">
        <div id="homeText">

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam imperdiet nulla nec mollis dignissim. Praesent in felis a nunc aliquet mattis ut in nibh. Suspendisse potenti. Aenean massa tellus, rhoncus quis lacus at, ultricies cursus neque. Nunc mollis sapien eu dolor faucibus, vel tristique lectus pellentesque. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Mauris ultrices dui at leo eleifend tempor. Suspendisse accumsan, magna eu posuere congue, justo elit pretium enim, nec pretium lacus ex eget quam. Vestibulum porta eu leo rhoncus finibus. Proin lacinia ante vel vulputate sollicitudin. Donec ac lectus justo.
          </div>
        <PageMenu id="homeMenu"/>
      </div>
    </div>

  )

}

export const PageCredits = (props) => {
  return (
    <PageIframe
      id="creditsPage"
      title="Crédits"
      url={getWpIframePostUrl(WP_POST_ID_CONTACT)}
    />
  )
}
