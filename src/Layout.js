import { useState, useEffect } from 'react';
import { Routes,Route, Link,useLocation } from 'react-router-dom';
import AnimatedRoutes from "./components/AnimatedRoutes";
import './Layout.scss';

import {PageHome,PageAgenda,PageCreations,PageCredits} from "./components/PagesIframe";
import PageMaps from "./components/PageMaps";
import PageSingleMap from "./components/PageSingleMap";
import useWindowDimensions from './components/ScreenSize';
import classNames from "classnames";

//arrays of pages on the two axis
export const menuItems = {
  horizontal:[
    {
      path:'/',
      name:'home'
    },
    {
      path:'/cartes',
      name:'Cartes'
    }
  ],
  vertical:[
    {
      path:'/',
      name:'home'
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
  const screenSize = useWindowDimensions();
  const [vertical,setVertical] = useState();
  const [mobile,setMobile] = useState();

  const NotFound = () => (
    <h2>404 Page Not Found</h2>
  );

  //check is vertical
  useEffect(()=>{
    const isVertical = screenSize.height > screenSize.width;
    const isMobile = screenSize.width <= 576;
    setVertical(isVertical);
    setMobile(isMobile);
  },[screenSize]);

  return (
    <div
    id="layout"
    className={classNames({
      vertical: vertical,
      mobile: mobile
    })}
    >
      <div id="site-logo">
        <Link to="/">
          <img src="https://www.tribunaldesprejuges.org/wordpress/wp-content/themes/tribunaldesprejuges/_inc/images/logo-tdp.png"/>
        </Link>
      </div>
       <Routes location={location}>
          <Route path="/" element={<PageHome />} />
          <Route path="/agenda" element={<PageAgenda/>} />
          <Route path="/creations" element={<PageCreations/>} />
          <Route path="/credits" element={<PageCredits/>} />
          <Route path="/cartes">
            <Route index element={<PageMaps />} />
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
