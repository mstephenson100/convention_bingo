import React, { useState, useEffect } from 'react';
import './index.css';
import UserSelect from './components/UserSelect';
import BingoCard from './components/BingoCard';
import SquareDetailModal from './components/SquareDetailModal';
import { fetchCard, generateCard, uploadImage } from './api';
import Login from './components/Login';

const BASE_IMAGE_URL = process.env.REACT_APP_BASE_IMAGE_URL;

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [card, setCard] = useState([]);
  const [selectedSquare, setSelectedSquare] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      setLoggedIn(true);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchCard(user.id).then(setCard);
    }
  }, [user]);

  const handleLogin = () => {
    setLoggedIn(true);
  };

  const handleGenerate = () => {
    generateCard(user.id).then(() => fetchCard(user.id).then(setCard));
  };

  const handleUpload = (row, col, file) => {
    uploadImage(user.id, row, col, file).then(() => fetchCard(user.id).then(setCard));
  };

  if (!loggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <Login onLogin={handleLogin} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 p-6 flex flex-col items-center">
      <header className="w-full max-w-5xl text-center mb-6">
        <h1
          className="text-3xl font-bold text-gray-800 mb-2 cursor-pointer hover:text-blue-600 transition"
          onClick={() => setUser(null)}
        >
          Hooray Bingo!
        </h1>
        {!user && <p className="text-gray-600">Please select your user to begin</p>}
      </header>

      <main className="w-full max-w-5xl flex flex-col items-center bg-white rounded-xl shadow-lg p-6">
        {!user ? (
          <UserSelect onSelect={setUser} baseImageUrl={BASE_IMAGE_URL} />
        ) : (
          <BingoCard
            card={card}
            onUploadClick={handleUpload}
            onSquareClick={setSelectedSquare}
            canEdit={true}
            userId={user.id}
            username={user.username}
            onRandomize={handleGenerate}
            baseImageUrl={BASE_IMAGE_URL}
          />
        )}
      </main>

      <SquareDetailModal
        square={selectedSquare}
        onClose={() => setSelectedSquare(null)}
      />
    </div>
  );
}

export default App;
