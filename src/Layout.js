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
     <Routes location={location}>
        <Route path="/" element={<HomePage />} />
        <Route path="/agenda" element={<AgendaPage/>} />
        <Route path="/credits" element={<CreditsPage/>} />
        <Route path="/cartes">
          <Route index element={<MapListPage />} />
          <Route path=":mapPostId/:mapPostSlug" element={<SingleMapPage />} />
          <Route path=":mapPostId/:mapPostSlug/:urlSourceId/:urlFeatureId" element={<SingleMapPage />} />
          <Route path=":mapPostId/:mapPostSlug/:urlSourceId/:urlFeatureId/:urlFeatureAction" element={<SingleMapPage />} />
        </Route>

        <Route path='*' component={NotFound} />
      </Routes>
    </div>
  );
}

export default Layout;
