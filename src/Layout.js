import { useState, useEffect } from 'react';
import { Routes,Route, Link,useLocation } from 'react-router-dom';
import AnimatedRoutes from "./components/AnimatedRoutes";
import './Layout.scss';

import {PageHome,PageCredits} from "./components/PagesIframe";
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

//get the first-level path; like '/cartes' from '/cartes/944/test'
export const getFirstLevelPath = pagePath => {
  const match = pagePath.match(/^\/([^\/]+)?/);
  return match[0];
}

//Select the axis depending of the page path
export const isHorizontalPage = pagePath => {
  const firstLevelPath = getFirstLevelPath(pagePath);

  const horizontalPaths = menuItems.horizontal.map(item=>item.path);
  const xPageIndex = horizontalPaths.indexOf(firstLevelPath);
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

  const {mapPosts,creationPosts,agendaPosts} = useApp();

  const agendaPage = <PagePosts id="agendaPage" title="Agenda" posts={agendaPosts}/>;
  const creationPage = <PagePosts id="creationsPage" title="Créations" posts={creationPosts}/>;
  const singleMapPage = <PageSingleMap />;

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
        <Route path="/agenda">
          <Route index element={agendaPage} />
          <Route path=":urlPostId" element={agendaPage} />
        </Route>
        <Route path="/creations">
          <Route index element={creationPage} />
          <Route path=":urlPostId" element={creationPage} />
        </Route>
        <Route path="/credits" element={<PageCredits/>} />
        <Route path="/cartes">
          <Route index element={<PagePosts id="mapListPage" title="Cartes" posts={mapPosts}/>} />
          <Route path=":mapPostId/:mapPostSlug" element={singleMapPage} />
          <Route path=":mapPostId/:mapPostSlug/:urlSourceId/:urlFeatureId" element={singleMapPage} />
          <Route path=":mapPostId/:mapPostSlug/:urlSourceId/:urlFeatureId/:urlFeatureAction" element={singleMapPage} />
        </Route>
        <Route path='*' component={NotFound} />
      </Routes>
    </div>
  );
}

export default Layout;
