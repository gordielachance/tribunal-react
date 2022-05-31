import { Icon } from 'semantic-ui-react';
import { Link,useLocation } from 'react-router-dom';
import {menuItems,isHorizontalPage,isHorizontalTransition,getMenuAxisItems} from "../Layout";
import classNames from "classnames";

const PageMenu = props => {
  const location = useLocation();
  const currentPath = location.pathname;
  const isHorizontal = isHorizontalPage(currentPath);
  const axisMenuItems = getMenuAxisItems(currentPath);
  const axisMenuPaths = axisMenuItems.map(item=>item.path);
  const currentMenuIndex = axisMenuPaths.indexOf(currentPath);

  const getMenuIcon = (item) => {
    const index = axisMenuItems.indexOf(item);
    const isCurrent = (index === currentMenuIndex);
    let horizontal = isHorizontalTransition(item.path,currentPath);
    const next = isCurrent ? undefined : (index > currentMenuIndex);

    if (isCurrent){
      return 'circle';
    }else{

      if (horizontal){
        if(next){
          return 'arrow right';
        }else{
          return 'arrow left';
        }
      }else{
        if(next){
          return 'arrow down';
        }else{
          return 'arrow up';
        }
      }
    }


  }

  return(
    <ul id="pageMenu">
    {
      axisMenuItems.map((item,k) => {

        const isCurrentMenu = (k === currentMenuIndex);
        const isHorizontalMenu = isHorizontalTransition(item.path,currentPath)
        const isNextMenu = isCurrentMenu ? undefined : (k > currentMenuIndex);
        const iconName = getMenuIcon(item);

        return(
          <li
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
            {
              (iconName) &&
              <Icon name={iconName}/>
            }

            {item.name}
          </Link>
          </li>
        )
      })
    }
    </ul>
  )
}

export default PageMenu
