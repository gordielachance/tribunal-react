import { Link } from 'react-router-dom';
import { Container } from 'semantic-ui-react';

const MapListPage = (props) => {
  return(
    <Container id="mapListPage" className="page horizontal-page">
    <h1>MAPS LIST</h1>
    <ul>
      <li><Link to="/">click to go to "/"</Link></li>
      <li><Link to="/carte/creations">click to go to "/carte/creations"</Link></li>
    </ul>
    </Container>
  )
}

export default MapListPage
