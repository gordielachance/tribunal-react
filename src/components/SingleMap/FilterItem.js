import { Icon,Label } from 'semantic-ui-react';

const FilterItem = props => {
  return(
    <div
    className={`filter-item-header ${props.active ? 'active ' : ''}`}
    onClick={props.onClick}
    onMouseEnter={props.onMouseEnter}
    onMouseLeave={props.onMouseLeave}
    >
      <span className="filter-item-icon"><Icon name="check"/></span>
      <span className="filter-item-label">
      {props.label}
      </span>
      {
        ((props.count !== undefined)) &&
        <span className="filter-item-count">{props.count}</span>
      }
    </div>
  )
}

export default FilterItem
