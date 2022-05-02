import { Link } from 'react-router-dom';
import { Container } from 'semantic-ui-react';

const CreditsPage = (props) => {
  return(
    <Container id="creditsPage" className="page horizontal-page">
      <h1>CREDITS PAGE</h1>
      <ul>
        <li><Link to="/">Click to go to "/"</Link></li>
        <li><Link to="/agenda">Click to go to "/agenda"</Link></li>
      </ul>
    </Container>

  )
}

export default CreditsPage
