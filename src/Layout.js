import React, { useRef,useState,useEffect } from "react";
import { Routes,Route,useLocation,matchRoutes } from 'react-router-dom';
import AnimatedRoutes from "./components/AnimatedRoutes";
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

export const axisPaths = {
  root:{
    path:'/'
  },
  horizontal:[
    {
      path:'/cartes/*'
    }
  ],
  vertical:[
    {
      path:'/evenements/*'
    },
    {
      path:'/creations/*'
    },
    {
      path:'/credits/*'
    }
  ]
}

export const menuItems = [
  {
    path:'/',
    name:'menu'
  },
  /*
  {
    path:'/cartes',
    name:'Cartes'
  },
  */
  {
    path:'/cartes/944/carte-principale',
    name:'Carte'
  },
  {
    path:'/evenements',
    name:'Événements'
  },
  {
    path:'/creations',
    name:'Créations'
  },
  {
    path:'/credits',
    name:'Crédits'
  }
]

export const getMenuIndex = location => {

  const routes = [axisPaths.root].concat(axisPaths.horizontal).concat(axisPaths.vertical);
  const routesMatch = matchRoutes(routes, location);
  const match = routesMatch ? routesMatch[0] : undefined;
  if (!match) return;
  const index = routes.indexOf(match.route);
  return index;
}

//Select the axis depending of the page path
export const isHorizontalPage = location => {
  const routes = axisPaths.horizontal;
  const routesMatch = matchRoutes(routes, location);
  return routesMatch ? true : false;
}

export const isHorizontalTransition = (path,currentPath) => {
  return (path === '/') ? isHorizontalPage(currentPath) : isHorizontalPage(path);
}

export const getMenuAxisItems = location => {

  if (location === '/'){
    return menuItems;
  }else{
    const horizontalItems = menuItems.filter(item => {
      return ( isHorizontalPage(item.path) && (item.path !== '/') )
    });
    const verticalItems = menuItems.filter(item => {
      return ( !isHorizontalPage(item.path) && (item.path !== '/') )
    });

    let items = isHorizontalPage(location) ? horizontalItems : verticalItems;

    //add root
    return [
      menuItems[0],
      ...items
    ]

  }

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
      {
        /* ANIMATED ROUTES
        <AnimatedRoutes path={location.pathname} oldPath={previousPagePath.current}>
        */
      }
     <Routes location={location}>
        <Route path="/" element={<PageHome/>} />
        <Route path="/evenements">
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
          <Route path=":mapPostId/:mapPostSlug/:urlSourceId/:urlFeatureId" element={singleMapPage} />
          <Route path=":mapPostId/:mapPostSlug/:urlSourceId/:urlFeatureId/:urlFeatureAction" element={singleMapPage} />
        </Route>
        <Route path='*' element={<Page404/>} />
      </Routes>
    </div>
  );
}

export default Layout;
