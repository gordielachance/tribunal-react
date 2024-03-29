import React, { useEffect,useState }  from "react";
import { Accordion,Icon,Popup } from 'semantic-ui-react';
import { useMap } from './MapContext';
import FilterItem from './FilterItem';

const TermItem = props => {

  const { termId, ...otherProps } = props;


  const {
    mapData,
    disabledTermIds,
    toggleHoverTerm,
    toggleTermId,
    selectSoloTermId,
    getRenderedFeaturesByTermId,
    getMapTermById
  } = useMap();

  const term = getMapTermById(termId);
  const featureCount = (getRenderedFeaturesByTermId(term.term_id) || []).length;


  const handleClick = (e,term) => {
    e.stopPropagation();
    if (e.shiftKey) {
      //solo
      selectSoloTermId(term.term_id)
    }else{
      toggleTermId(term.term_id)
    }
  }

  const isDisabled = term => {
    return (disabledTermIds || []).includes(term.term_id);
  }

  return(
    <FilterItem
    label={term.name}
    description={term.description}
    active={!isDisabled(term)}
    onClick={e=>handleClick(e,term)}
    onMouseEnter={e=>toggleHoverTerm(term,true)}
    onMouseLeave={e=>toggleHoverTerm(term,false)}
    count={featureCount}
    />
  )

}

const TermsList = (props) => {
  const { terms = [], level = 0, parent = 0, active = false, taxonomy='', ...otherProps } = props;

  const [activeIds, setActiveIds] = useState([]);

  const {
    getTermChildren
  } = useMap();

  const rootItems = getTermChildren(parent,taxonomy) || [];

  const toggleOpen = (term, bool) => {
    const termId = term.term_id;
    if (bool) {
      setActiveIds([...activeIds, termId]);
    } else {
      setActiveIds(activeIds.filter((id) => id !== termId));
    }
  };

  //from prop
  useEffect(()=>{
    const children = getTermChildren(parent,taxonomy) || [];
    const childrenIds = children.map(term=>term.term_id);

    if (active){
      setActiveIds([...activeIds, ...childrenIds]);
    }else{
      setActiveIds(activeIds.filter(id => !childrenIds.includes(id)));
    }
  },[active])

  return (
    <ul data-level={level} data-parent={parent} {...otherProps}>
      {rootItems.map((term, k) => {
        const children = getTermChildren(term.term_id,term.taxonomy,true) || [];
        const hasChildren = children.length > 0;
        const isActive = activeIds.includes(term.term_id);

        return (
          <Accordion
            key={k}
            as="li"
            data-id={term.term_id}
            className={hasChildren ? "parent-accordion" : ""}
          >
            <Accordion.Title
              active={isActive}
              onClick={() => toggleOpen(term,!isActive)}
            >
              <TermItem termId={term.term_id} />
              {hasChildren && (
                <Icon
                  name={`angle ${isActive ? "up" : "down"}`}
                  className="accordion-handle"
                />
              )}
            </Accordion.Title>
            <Accordion.Content active={isActive}>
              <TermsList
                taxonomy={taxonomy}
                terms={children}
                parent={term.term_id}
                level={level + 1}
                active={isActive}
              />
            </Accordion.Content>
          </Accordion>
        );
      })}
    </ul>
  );
};


const FilterTerms = props => {
  const { items, taxonomy, ...otherProps } = props;
  return (
    <TermsList terms={items} taxonomy={taxonomy} active={true} className="map-filter-terms" {...otherProps}/>
  );
}

export default FilterTerms
