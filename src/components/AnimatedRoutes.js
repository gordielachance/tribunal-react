import { Routes } from 'react-router-dom';
import { CSSTransition, TransitionGroup } from "react-transition-group";
import React, { useRef,useState,useEffect } from "react";
import {menuItems,isHorizontalTransition,getMenuAxisItems} from "../Layout";

const dynamicChildFactory = classNames => child => React.cloneElement(child, { classNames });

export const AnimatedRoutes = props => {

  const location = props.location;

  const previousPagePath = useRef();
  const [transitionClass,setTransitionClass] = useState();
  const [updateTransition,setUpdateTransition] = useState(0);
  const [hasEnterTransition,setHasEnterTransition] = useState(true);
  const [hasExitTransition,setHasExitTransition] = useState(true);

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

  useEffect(()=>{
    if (!previousPagePath.current) return;

    let transClass = getTransitionClass(previousPagePath.current,newPath);

    transClass = 'slideRight';

    if (previousPagePath.current === '/credits'){
      transClass = undefined;
    }

    if (transClass){
      console.log("!!!TRANSITION CLASS FOR",previousPagePath.current+' --> '+newPath,transitionClass);
      setUpdateTransition(updateTransition+1);
    }

    setTransitionClass(transClass);

  },[previousPagePath.current])

  //store last visited page for further use
  previousPagePath.current = location.pathname;

  return(
    <TransitionGroup key={updateTransition} enter={hasEnterTransition} exit={hasExitTransition}>
      <CSSTransition
      classNames={transitionClass}
      key={newPath}
      timeout={500}>
        <Routes location={newPath}>{props.children}</Routes>
      </CSSTransition>
    </TransitionGroup>
  )
}


export default AnimatedRoutes
