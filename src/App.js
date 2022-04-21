import { Routes ,Route } from 'react-router-dom';
import { Container } from 'semantic-ui-react';

import './App.scss';
import Map from "./components/Map";

function App() {
  return (
    <div className="App">
      <Container id="page-content">
        <Routes>
          <Route
          path="/markers/:markerId/:markerName"
          exact
          element={<Map url="/"/>}
          />
          <Route
          path="/"
          exact
          element={<Map url="/"/>}
          />
        </Routes>
      </Container>
    </div>
  );
}

export default App;
