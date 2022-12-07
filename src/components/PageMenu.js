import { Link,useLocation } from 'react-router-dom';
import {isHorizontalTransition,getMenuIndex,getMenuAxisItems} from "../Layout";
import classNames from "classnames";
import {ImageArrow} from "../Constants";
import './PageMenu.scss';

const PageMenu = props => {

  const location = useLocation();
  const currentPath = location.pathname;
  const allMenuItems = getMenuAxisItems('/');
  const axisMenuItems = getMenuAxisItems(currentPath);
  const currentMenuIndex = getMenuIndex(currentPath);

  const getIconClasses = (item) => {

    const index = allMenuItems.indexOf(item);
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

      axisMenuItems.map((item) => {

        const index = allMenuItems.indexOf(item);
        const isCurrentMenu = (index === currentMenuIndex);
        const isHorizontalMenu = isHorizontalTransition(item.path,currentPath)
        const isNextMenu = isCurrentMenu ? undefined : (index > currentMenuIndex);
        const iconClasses = getIconClasses(item);

        const icon = iconClasses ? <img className={iconClasses} src={ImageArrow}/> : undefined;

        return(
          <li
          data-path={item.path}
          key={index}
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
