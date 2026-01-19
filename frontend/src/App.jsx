import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ShowcaseLayout from './components/ShowcaseLayout';
import Home from './pages/Showcase/Home';
import Features from './pages/Showcase/Features';
import Gallery from './pages/Showcase/Gallery';
import About from './pages/Showcase/About';
import GroundStation from './pages/GroundStation';

function App() {
  return (
    <Router>
      <Routes>
        <Route element={<ShowcaseLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/features" element={<Features />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/about" element={<About />} />
        </Route>
        <Route path="/app" element={<GroundStation />} />
      </Routes>
    </Router>
  );
}

export default App;
