import { Container } from 'semantic-ui-react';

import Map from "./Map";

const SingleMapPage = (props) => {
  return(
    <Container id="singleMapPage" className="page horizontal-page">
      <Map/>
    </Container>
  )
}

export default SingleMapPage
