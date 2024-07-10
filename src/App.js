import React, { useState } from 'react';
import Header from './components/Header';
import Figure from './components/Figure';
import WrongLetters from './components/WrongLetters';
import Word from './components/Word';
import Popup from './components/Popup';
import Notification from './components/Notification';

import './App.css';

const words = ['application', 'hello', 'wizard'];

let selectedWord = words[Math.floor(Math.random() * words.length)];

let playable = true;

const correctLetters = [];
const wrongLetters = [];

function App() {
  const [playable, setPlayable] = useState(true);
  const [correctLetters, setCorrectLetters] = useState([]);
  const [wrongLetters, setWrongLetters] = useState([]);

  useEffect(() => {
    const handleKeydown = event => {
      // fetch letter from event
      const { key, keyCode } = event;

      // check if it is a letter key 
      if (playable && keyCode >= 65 && keyCode <= 90) {
        const letter = key.toLowerCase();
        if (selectedWord.includes(letter)) {
          // if correct letter does not include letter
          if (!correctLetters.includes(letter)) {
            setCorrectLetters(currentLetters => [...currentLetters, letter]);
          } else {
            show(setShowNotification);
          }
        } else {
          // if wrong letters does not include letter
          if (!wrongLetters.includes(letter)) {
            setWrongLetters(currentLetters => [...currentLetters, letter]);
          } else {
            show(setShowNotification);
          }
        }
      }
    }
    window.addEventListener('keydown', handleKeydown);

    return () => window.removeEventListener('keydown', handleKeydown);

  }, [correctLetters, wrongLetters, playable]);

  return (
    <>
      <Header />
      <div className="game-container">
        <Figure />
        <WrongLetters />
        <Word selectedWord={selectedWord} correctLetters={correctLetters} />
        <Popup />
        <Notification />
      </div>
    </>
  );
}

export default App;
