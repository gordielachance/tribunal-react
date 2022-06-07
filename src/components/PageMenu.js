import { Icon } from 'semantic-ui-react';
import { Link,useLocation } from 'react-router-dom';
import {isHorizontalTransition,getMenuAxisItems,getFirstLevelPath} from "../Layout";
import classNames from "classnames";
import {ImageArrow} from "../Constants";
import './PageMenu.scss';

const PageMenu = props => {
  const location = useLocation();
  const currentPath = location.pathname;
  const firstLevelPath = getFirstLevelPath(currentPath);

  const axisMenuItems = getMenuAxisItems(currentPath);
  const axisMenuPaths = axisMenuItems.map(item=>item.path);
  const currentMenuIndex = axisMenuPaths.indexOf(firstLevelPath);

  const getIconClasses = (item) => {
    const index = axisMenuItems.indexOf(item);
    const isCurrent = (index === currentMenuIndex);
    let horizontal = isHorizontalTransition(item.path,currentPath);
    const next = isCurrent ? undefined : (index > currentMenuIndex);

    if (!isCurrent){
      if (horizontal){
        if(next){
          return 'nav-arrow right';
        }else{
          return 'nav-arrow left';
        }
      }else{
        if(next){
          return 'nav-arrow down';
        }else{
          return 'nav-arrow up';
        }
      }
    }

  }

  return(
    <ul id={props.id} className="pageMenu">
    {
      axisMenuItems.map((item,k) => {

        const isCurrentMenu = (k === currentMenuIndex);
        const isHorizontalMenu = isHorizontalTransition(item.path,currentPath)
        const isNextMenu = isCurrentMenu ? undefined : (k > currentMenuIndex);
        const iconClasses = getIconClasses(item);

        const icon = iconClasses ? <img className={iconClasses} src={ImageArrow}/> : undefined;

        return(
          <li
          data-path={item.path}
          key={k}
          className={classNames({
            active:   isCurrentMenu,
            previous: !isNextMenu,
            next: isNextMenu,
            horizontal:isHorizontalMenu,
            vertical:!isHorizontalMenu
          })}
          >
          <Link to={item.path}>
            {item.name}
            {icon}
          </Link>
          </li>
        )
      })
    }
    </ul>
  )
}

export default PageMenu
