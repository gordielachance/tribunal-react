import React,{useState,useEffect} from "react";
import { Link } from 'react-router-dom';
import { Container } from 'semantic-ui-react';
import {getIframePostUrl} from "./../Constants";

const AgendaPage = (props) => {

  const [loading,setLoading] = useState(true);

  return(
    <Container id="agendaPage" className="page horizontal-page">
      <div className="page-content">
        <h1>AGENDA PAGE</h1>
        <ul>
          <li><Link to="/">Click to go to "/"</Link></li>
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

export default AgendaPage
