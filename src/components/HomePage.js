import React,{useState,useEffect} from "react";
import { Link } from 'react-router-dom';
import { Container,Loader } from 'semantic-ui-react';
import {getIframePostUrl} from "./../Constants";

const HomePage = (props) => {

  const [loading,setLoading] = useState(true);

  return(
    <Container id="homePage" className="page horizontal-page">
      <div className="page-content">
        <h1>HOME PAGE</h1>
        <ul>
          <li><Link to="/cartes">Click to go to "/cartes"</Link></li>
          <li><Link to="/agenda">Click to go to "/agenda"</Link></li>
          <li><Link to="/credits">Click to go to "/credits"</Link></li>
        </ul>
        <iframe
        id="home-iframe"
        src={getIframePostUrl(18)}
        onLoad={()=>setLoading(false)}
        />
      </div>
    </Container>

  )
}

export default HomePage
