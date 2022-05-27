import { Routes,Route, Link,useLocation } from 'react-router-dom';
import AnimatedRoutes from "./components/AnimatedRoutes";
import './Layout.scss';

import {HomePage,AgendaPage,CreditsPage} from "./components/IframePages";
import MapListPage from "./components/MapListPage";
import SingleMapPage from "./components/SingleMapPage";

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
     <AnimatedRoutes location={location}>
        <Route path="/" element={<HomePage />} />
        <Route path="/cartes" element={<MapListPage/>} />
        <Route path="/agenda" element={<AgendaPage/>} />
        <Route path="/credits" element={<CreditsPage/>} />
        <Route path="/carte/:mapPostId/:mapPostSlug" element={<SingleMapPage/>} />
        <Route path="/carte/:mapPostId/:mapPostSlug/creation/:featurePostId/:featurePostSlug" element={<SingleMapPage/>} />
        <Route path='*' component={NotFound} />
      </AnimatedRoutes>
    </div>
  );
}

export default Layout;
