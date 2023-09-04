import { Icon,Label } from 'semantic-ui-react';

const FilterItem = props => {
  return(
    <li
    className={!props.disabled ? 'active' : ''}
    onClick={props.onClick}
    onMouseEnter={props.onMouseEnter}
    onMouseLeave={props.onMouseLeave}
    >

      <div className="filter-item-header">
        <span className="filter-item-icon"><Icon name="check"/></span>
        <span className="filter-item-label">
        {props.label}
        </span>
        {
          ((props.count !== undefined)) &&
          <span className="filter-item-count">{props.count}</span>
        }
      </div>
      {
        props.description &&
        <div className="filter-item-description"><small>{props.description}</small></div>
      }
    </li>
  )
}

export default FilterItem
