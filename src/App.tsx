"use client";

import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Learners from './app/components/Learners';
import Header from './app/components/Header';
import Tutors from './app/components/Tutors';
import Schools from './app/components/Schools';
import Footer from './app/components/Footer';

function App() {
  return (
    <div className='position-relative menu-header-box'>
      <Header />
      <main className="main">
        <Learners />
        <Tutors />
        <Schools />
      </main>
      <Footer />
    </div>
  );
}

export default App;
