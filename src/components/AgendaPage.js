import { Link } from 'react-router-dom';
import { Container } from 'semantic-ui-react';

const AgendaPage = (props) => {
  return(
    <Container id="agendaPage" className="page horizontal-page">
      <h1>AGENDA PAGE</h1>
      <ul>
        <li><Link to="/">Click to go to "/"</Link></li>
        <li><Link to="/credits">Click to go to "/credits"</Link></li>
      </ul>
    </Container>

  )
}

export default AgendaPage
