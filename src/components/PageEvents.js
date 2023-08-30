import React,{useEffect,useState} from "react";
import { useApp } from './../AppContext';
import DatabaseAPI from "../databaseAPI/api";
import {DEBUG} from "../Constants";
import PagePosts from "./PagePosts";
import {BGAgenda} from "./PageBackgrounds";

const PageEvents = (props) => {

  const {agendaPosts,setAgendaPosts} = useApp();
  const [loading,setLoading] = useState();

  //load events on init
  useEffect(() => {

    let isSubscribed;

    if (agendaPosts === undefined){

      isSubscribed = true;
      setLoading(true);

  		const fetchData = async () => {
  	    const data = await DatabaseAPI.getItems('agenda');
  			if (isSubscribed) {
  				DEBUG && console.info("...EVENTS POSTS LOADED",data);
          setLoading(false);
  	      setAgendaPosts(data);
  	    }
  		}

  	  fetchData();
    }

		//clean up fn
		return () => isSubscribed = false;

  }, [agendaPosts]);

  return(
    <div className="page-container">
      <PagePosts id="agendaPage" title="Événements" posts={agendaPosts}/>
      <BGAgenda/>
    </div>
  )
}

export default PageEvents
