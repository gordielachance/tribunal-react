import { Routes ,Route, Link, useLocation } from 'react-router-dom';
import { Container } from 'semantic-ui-react';
import { TransitionGroup, CSSTransition } from "react-transition-group";
import type { FC } from "react";
import './App.scss';

import HomePage from "./components/HomePage";
import MapListPage from "./components/MapListPage";
import SingleMapPage from "./components/SingleMapPage";

/*
import Map from "./components/Map";
*/

function App() {
  const location = useLocation();

  return (
    <div className="App">
      <TransitionGroup component={null}>
        <CSSTransition key={location.key} classNames="fade" timeout={300}>
          <Routes location={location}>
            <Route path="/cartes" element={<MapListPage/>} />
            <Route path="/carte/:mapName" element={<SingleMapPage/>} />
            <Route path="/carte/:mapName/marker/:markerId/:markerName" element={<SingleMapPage/>} />
            <Route path="*" element={<HomePage />} />
          </Routes>
        </CSSTransition>
      </TransitionGroup>
    </div>
  );
}

export default App;
