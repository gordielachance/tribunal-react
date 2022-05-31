import { Routes } from 'react-router-dom';
import { CSSTransition, TransitionGroup } from "react-transition-group";
import React, { useRef } from "react";
import {menuItems,isHorizontalTransition,getMenuAxisItems} from "../Layout";

const dynamicChildFactory = classNames => child => React.cloneElement(child, { classNames });

export const AnimatedRoutes = props => {

  const location = props.location;

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

      const isHorizontal = isHorizontalTransition(oldPath,newPath);

      //How much steps
      const getSteps = (oldPath,newPath) => {

        const getPaths = () => {
          let items = getMenuAxisItems(newPath);
          if (newPath === '/'){
            items = getMenuAxisItems(oldPath);
          }
          return items.map(item => item.path);
        }

        const axisPaths = getPaths();
        const pageIndex = axisPaths.indexOf(newPath);
        const oldPathIndex = axisPaths.indexOf(oldPath);
        return pageIndex - oldPathIndex;
      }

      const steps = getSteps(oldPath,newPath);

      if (!steps) return;


      return {
        horizontal: isHorizontal,
        backwards:  (steps < 0),
        steps:      Math.abs(steps),
      }
    }

    const transition = getTransitionData(oldPath,newPath);
    if (!transition) return;

    if (transition.horizontal){
      if (transition.backwards){
        return 'slideLeft';
      }else{
        return 'slideRight';
      }
    }else{
      if (transition.backwards){
        return 'slideUp';
      }else{
        return 'slideDown';
      }
    }

  }



  if (previousPagePath.current){
    const newClass = getTransitionClass(oldPath,newPath);
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


export default AnimatedRoutes
