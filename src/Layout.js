import React, { useState,useEffect,useRef }  from "react";
import { Routes ,Route, Link, useLocation } from 'react-router-dom';
import { Container } from 'semantic-ui-react';
import { TransitionGroup, CSSTransition } from "react-transition-group";
import type { FC } from "react";
import './Layout.scss';

import HomePage from "./components/HomePage";
import MapListPage from "./components/MapListPage";
import SingleMapPage from "./components/SingleMapPage";
import AgendaPage from "./components/AgendaPage";
import CreditsPage from "./components/CreditsPage";

function Layout() {

  const location = useLocation();

  //arrays of pages on the two axis
  const horizontalPaths = [
    '/',
    '/cartes',
    '/carte/:mapName'
  ]
  const verticalPaths = [
    '/',
    '/agenda',
    '/credits'
  ]

  const previousPagePath = useRef();
  const [isFirstPage,setIsFirstPage] = useState(true);//wether or this is the first page accessed (user is landing)
  const [transitionHorizontal,setTransitionHorizontal] = useState();
  const [transitionBackwards,setTransitionBackwards] = useState();
  const [transitionSteps,setTransitionSteps] = useState();
  const [transitionClass,setTransitionClass] = useState();

  //returns an object with the transition data
  const getTransitionData = (oldPath,newPath) => {

    if (oldPath === undefined){
      throw "Missing 'oldPath' parameter.";
    }

    if (newPath === undefined){
      throw "Missing 'newPath' parameter.";
    }

    //Select the axis depending of the page path
    const checkIsHorizontal = (oldPath,newPath) => {
      const checkPage = (newPath==='/') ? oldPath : newPath;
      const xPageIndex = horizontalPaths.indexOf(checkPage);
      const yPageIndex = verticalPaths.indexOf(checkPage);
      return xPageIndex > -1;
    }

    const isHorizontal = checkIsHorizontal(oldPath,newPath);
    const paths = isHorizontal ? horizontalPaths : verticalPaths;

    //How much steps and which direction
    const getSteps = (paths,oldPath,newPath) => {
      const pageIndex = paths.indexOf(newPath);
      const oldPathIndex = paths.indexOf(oldPath);
      return pageIndex - oldPathIndex;
    }

    const steps = getSteps(paths,oldPath,newPath);
    if (!steps) return;


    return {
      horizontal: isHorizontal,
      backwards:  (steps < 0),
      steps:      Math.abs(steps),
    }
  }

  useEffect(()=>{

    const oldPath = previousPagePath.current;
    const newPath = location.pathname;

    //we're transiting; update states for transition data
    if (oldPath){

      const transition = getTransitionData(oldPath,newPath);

      console.log("TRANSITION",transition);

      setTransitionHorizontal(transition?.horizontal);
      setTransitionBackwards(transition?.backwards);
      setTransitionSteps(transition?.steps);

    }

    //store last visited page for further use
    previousPagePath.current = location.pathname;
  },[location.pathname])

  //select transition
  useEffect(()=>{

    const getTransition = (horizontal,backwards) => {

      if (horizontal){
        if (!backwards){
          return 'slideHorizontalNext';
        }else{
          return 'slideHorizontalPrevious';
        }
      }else{
        if (!backwards){
          return 'slideVerticalNext';
        }else{
          return 'slideVerticalPrevious';
        }
      }
    }

    const transition = getTransition(transitionHorizontal,transitionBackwards);
    setTransitionClass(transition);

    console.log("NEW TRANSITION",transition);

  },[transitionHorizontal,transitionBackwards])

  return (
    <div id="layout">
    <TransitionGroup
    >
        <CSSTransition
        key={location.key}
        classNames={transitionClass}
        timeout={{ enter: 5000, exit: 5000 }}
        >
          <Routes location={location}>
            <Route path="/cartes" element={<MapListPage/>} />
            <Route path="/agenda" element={<AgendaPage/>} />
            <Route path="/credits" element={<CreditsPage/>} />
            <Route path="/carte/:mapId/:mapName" element={<SingleMapPage/>} />
            <Route path="/carte/:mapId/:mapName/marker/:markerId/:markerName" element={<SingleMapPage/>} />
            <Route path="*" element={<HomePage />} />
          </Routes>
        </CSSTransition>
      </TransitionGroup>
    </div>
  );
}

export default Layout;
