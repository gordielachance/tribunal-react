//https://tech.lalilo.com/dynamic-transitions-with-react-router-and-react-transition-group
import React from "react";
import { Routes } from 'react-router-dom';
import { CSSTransition, TransitionGroup } from "react-transition-group";
import {isHorizontalTransition,getMenuAxisItems} from "../Layout";

export const AnimatedRoutes = props => {

  const getTransitionClass = (oldPath,newPath) => {

    let className = undefined;

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

    if (transition){
      if (transition.horizontal){
        if (transition.backwards){
          className = 'slideLeft';
        }else{
          className = 'slideRight';
        }
      }else{
        if (transition.backwards){
          className = 'slideUp';
        }else{
          className = 'slideDown';
        }
      }
    }

    console.log("****TRANSITION CLASS FOR",props.oldPath+' --> '+newPath,className);

    return className;

  }

  /*
  <TransitionGroup
    id="layout-transition-group"
    childFactory={child =>
      React.cloneElement(child, {
        classNames: getTransitionClass(props.oldPath,props.path),
        timeout: 500
      })
    }
  >
  */

  return(
    <TransitionGroup
      childFactory={child =>
        React.cloneElement(child, {
          classNames: getTransitionClass(props.oldPath,props.path),
          timeout: 500
        })
      }
    >
      <CSSTransition key={props.path} classNames="slideUp" timeout={500}>
        <Routes location={props.path}>{props.children}</Routes>
      </CSSTransition>
    </TransitionGroup>
  )
}

export default AnimatedRoutes
