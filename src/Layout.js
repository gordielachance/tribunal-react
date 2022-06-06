import { Routes,Route,useLocation } from 'react-router-dom';
import AnimatedRoutes from "./components/AnimatedRoutes";
import './Layout.scss';

import PageHome from "./components/PageHome";
import PageMaps from "./components/PageMaps";
import PageCreations from "./components/PageCreations";
import PageAgenda from "./components/PageAgenda";
import PageCredits from "./components/PageCredits";
import PagePosts from "./components/PagePosts";
import PageSingleMap from "./components/PageSingleMap";
import Page404 from "./components/Page404";
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
  const match = pagePath.match(new RegExp('^/([^/]+)?'));
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

const Layout = props => {

  const location = useLocation();
  const {verticalScreen,mobileScreen} = useApp();

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
        <Route path="/" element={<PageHome/>} />
        <Route path="/agenda">
          <Route index element={<PageAgenda/>} />
          <Route path=":urlPostId" element={<PageAgenda/>} />
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
