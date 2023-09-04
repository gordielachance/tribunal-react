import React, { useRef,useState,useEffect } from "react";
import { Routes,Route,useLocation,matchRoutes } from 'react-router-dom';
import './Layout.scss';

import PageHome from "./components/PageHome";
import PageMaps from "./components/PageMaps";
import PageCreations from "./components/PageCreations";
import PageEvents from "./components/PageEvents";
import PageCredits from "./components/PageCredits";
import PagePosts from "./components/PagePosts";
import PageSingleMap from "./components/PageSingleMap";
import Page404 from "./components/Page404";
import {DEBUG} from "./Constants";

import classNames from "classnames";
import { useApp } from './AppContext';

export const menuItems = [
  {
    url:'/',
    path:'/',
    name:'Accueil'
  },
  /*
  {
    url:'/cartes',
    name:'Cartes'
  },
  */
  {
    url:'/cartes/85/carte-principale',
    path:'/cartes/*',
    name:'Carte'
  },
  {
    url:'/agenda',
    path:'/agenda/*',
    name:'Événements'
  },
  {
    url:'/creations',
    path:'/creations/*',
    name:'Créations'
  },
  {
    url:'/credits',
    path:'/credits/*',
    name:'Crédits'
  }
]

export const getMenuIndex = location => {

  const routes = menuItems.map(item=>{
    return {path:item.path};
  });

  const routesMatch = matchRoutes(routes, location);
  const match = routesMatch ? routesMatch[0] : undefined;

  if (!match) return;
  const index = routes.findIndex(item=>item.path === match.route.path);

  return index;
}

const Layout = props => {

  const {verticalScreen,mobileScreen} = useApp();

  const singleMapPage = <PageSingleMap />;
  const location = useLocation();
  const previousPagePath = useRef();

  useEffect(()=>{
    //store last visited page for further use
    previousPagePath.current = location.pathname;
    console.log("****UPDATED OLD LOCATION",previousPagePath.current);
  },[location.pathname])

  return (
    <div
    id="layout"
    className={classNames({
      vertical: verticalScreen,
      mobile: mobileScreen
    })}
    >
     <Routes location={location}>
        <Route path="/" element={<PageHome/>} />
        <Route path="/agenda">
          <Route index element={<PageEvents/>} />
          <Route path=":urlPostId" element={<PageEvents/>} />
        </Route>
        <Route path="/creations">
          <Route index element={<PageCreations/>} />
          <Route path=":urlPostId" element={<PageCreations/>} />
        </Route>
        <Route path="/credits" element={<PageCredits/>} />
        <Route path="/cartes">
          <Route index element={<PageMaps/>} />
          <Route path=":mapPostId/:mapPostSlug" element={singleMapPage} />
          <Route path=":mapPostId/:mapPostSlug/:urlSourceId/:urlPostId" element={singleMapPage} />
          <Route path=":mapPostId/:mapPostSlug/:urlSourceId/:urlPostId/:urlFeatureAction" element={singleMapPage} />
        </Route>
        <Route path='*' element={<Page404/>} />
      </Routes>
    </div>
  );
}

export default Layout;
