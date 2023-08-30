import { Link,useLocation } from 'react-router-dom';
import {menuItems,getMenuIndex} from "../Layout";
import classNames from "classnames";
import './PageMenu.scss';

const PageMenu = props => {

  const location = useLocation();
  const currentPath = location.pathname;
  const currentMenuIndex = getMenuIndex(currentPath);


  return(
    <ul id={props.id} className="pageMenu">
    {

      menuItems.map((item) => {

        const index = menuItems.indexOf(item);
        const isCurrentMenu = (index === currentMenuIndex);

        return(
          <li
          data-url={item.url}
          key={index}
          className={classNames({
            active:   isCurrentMenu
          })}
          >
          <Link to={item.url}>
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
