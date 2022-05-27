import { Routes,useLocation } from 'react-router-dom';
import { CSSTransition, TransitionGroup } from "react-transition-group";
import React, { useEffect,useRef } from "react";

const dynamicChildFactory = classNames => child => React.cloneElement(child, { classNames });

export const AnimatedSwitch = props => {

  //arrays of pages on the two axis
  const horizontalPaths = [
    '/',
    '/cartes',
    '/carte/:mapPostSlug'
  ]
  const verticalPaths = [
    '/',
    '/agenda',
    '/credits'
  ]

  const location = useLocation();
  const previousPagePath = useRef();
  const transitionClass = useRef();

  const oldPath = previousPagePath.current;
  const newPath = location.pathname;

  const getTransitionClass = (oldPath,newPath) => {

    //returns an object with the transition data
    const getTransitionData = (oldPath,newPath) => {

      if (oldPath === undefined) return;
      if (newPath === undefined) return;
      if (oldPath === newPath) return;

      //Select the axis depending of the page path
      const checkIsHorizontal = (oldPath,newPath) => {
        const checkPage = (newPath==='/') ? oldPath : newPath;
        const xPageIndex = horizontalPaths.indexOf(checkPage);
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


    const transition = getTransitionData(oldPath,newPath);
    if (!transition) return;

    let transitionClass = 'pageTransition';//default

    if (transition.horizontal){
      transitionClass = transitionClass + '-horizontal';
    }else{
      transitionClass = transitionClass + '-vertical';
    }

    if (transition.backwards){
      transitionClass = transitionClass + '-prev';
    }else{
      transitionClass = transitionClass + '-next';
    }

    transitionClass = transitionClass + '-' + transition.steps;

    /*
    if (transition.backwards){
      transitionClass = 'slideUp';
    }else{
      transitionClass = 'slideDown';
    }
    */

    if (transitionClass){
      console.log("!!!TRANSITION",transitionClass,oldPath+" --> "+newPath);
    }

    return transitionClass;

  }

  const newClass = getTransitionClass(oldPath,newPath);
  if (newClass){
    transitionClass.current = newClass;
    console.log("!!!TRANSITION CLASS",transitionClass.current);
  }



  //store last visited page for further use
  previousPagePath.current = location.pathname;


  return(
    <TransitionGroup childFactory={dynamicChildFactory(transitionClass.current)}>
      <CSSTransition
        classNames={transitionClass.current}
        key={newPath}
        timeout={500}
      >
        <Routes location={newPath}>{props.children}</Routes>
      </CSSTransition>
    </TransitionGroup>
  )
}


export default AnimatedSwitch
