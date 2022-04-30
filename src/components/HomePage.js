import { Link } from 'react-router-dom';
import { Container } from 'semantic-ui-react';

const HomePage = (props) => {
  return(
    <Container>
      <ul>
        <li><Link to="/cartes">Click to go to "/cartes"</Link></li>
        <li><Link to="/agenda">Click to go to "/agenda"</Link></li>
        <li><Link to="/credits">Click to go to "/credits"</Link></li>
      </ul>
    </Container>

  )
}

export default HomePage
