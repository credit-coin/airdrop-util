import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import { Airdrop } from './components/Airdrop';

class App extends Component {
  render() {
    return (
      <div className="App">
        <Airdrop />
      </div>
    );
  }
}

export default App;
