import { Routes,Route, Link,useLocation } from 'react-router-dom';
import AnimatedRoutes from "./components/AnimatedRoutes";
import './Layout.scss';

import {PageHome,PageAgenda,PageCreations,PageCredits} from "./components/PagesIframe";
import PageMaps from "./components/PageMaps";
import PageSingleMap from "./components/PageSingleMap";

function Layout() {

  const location = useLocation();

  const NotFound = () => (
    <h2>404 Page Not Found</h2>
  );

  return (
    <div id="layout">
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
