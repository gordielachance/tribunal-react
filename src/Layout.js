import { useState, useEffect } from 'react';
import { Routes,Route, Link,useLocation } from 'react-router-dom';
import AnimatedRoutes from "./components/AnimatedRoutes";
import './Layout.scss';

import {PageHome,PageAgenda,PageCreations,PageCredits} from "./components/PagesIframe";
import PagePosts from "./components/PagePosts";
import PageSingleMap from "./components/PageSingleMap";
import {DEBUG} from "./Constants";

import classNames from "classnames";
import { useApp } from './AppContext';

//arrays of pages on the two axis
export const menuItems = {
  horizontal:[
    {
      path:'/',
      name:'menu'
    },
    {
      path:'/cartes',
      name:'Cartes'
    }
  ],
  vertical:[
    {
      path:'/',
      name:'menu'
    },
    {
      path:'/agenda',
      name:'Agenda'
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
}

//Select the axis depending of the page path
export const isHorizontalPage = pagePath => {
  const horizontalPaths = menuItems.horizontal.map(item=>item.path);
  const xPageIndex = horizontalPaths.indexOf(pagePath);
  return xPageIndex > -1;
}
export const isHorizontalTransition = (path,currentPath) => {
  return (path === '/') ? isHorizontalPage(currentPath) : isHorizontalPage(path);
}

export const getMenuAxisItems = path => {
  const horizontal = isHorizontalPage(path);
  if (path === '/'){
    const allItems = menuItems.horizontal.concat(menuItems.vertical.slice(1));
    const allPaths = [...new Set(allItems.map(item=>item.path))];
    return allItems;
  }else{
    return horizontal ? menuItems.horizontal : menuItems.vertical;
  }
}

function Layout() {

  const location = useLocation();
  const {verticalScreen,mobileScreen} = useApp();


  const NotFound = () => (
    <h2>404 Page Not Found</h2>
  );

  const {mapPosts,creationPosts} = useApp();



  return (
    <div
    id="layout"
    className={classNames({
      vertical: verticalScreen,
      mobile: mobileScreen
    })}
    >
     <Routes location={location}>
        <Route path="/" element={<PageHome />} />
        <Route path="/agenda" element={<PageAgenda/>} />
        <Route path="/creations" element={<PagePosts id="creationsPage" title="Créations" posts={creationPosts}/>} />
        <Route path="/credits" element={<PageCredits/>} />
        <Route path="/cartes">
          <Route index element={<PagePosts id="mapListPage" title="Cartes" posts={mapPosts}/>} />
          <Route path=":mapPostId/:mapPostSlug" element={<PageSingleMap />} />
          <Route path=":mapPostId/:mapPostSlug/:urlSourceId/:urlFeatureId" element={<PageSingleMap />} />
          <Route path=":mapPostId/:mapPostSlug/:urlSourceId/:urlFeatureId/:urlFeatureAction" element={<PageSingleMap />} />
        </Route>

        <Route path='*' component={NotFound} />
      </Routes>
    </div>
  );
}

export default Layout;
