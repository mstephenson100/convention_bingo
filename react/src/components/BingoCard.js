import React, { useState, useEffect } from 'react';

export default function BingoCard({
  card,
  onUploadClick,
  canEdit,
  userId,
  onRandomize,
  username,
  baseImageUrl
}) {
  const [locked, setLocked] = useState(null);
  const [modalImage, setModalImage] = useState(null);

  const token = localStorage.getItem('auth_token');

  const fetchLockStatus = () => {
    fetch(`/api/card/${userId}/lock-status`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch lock status');
        return res.json();
      })
      .then(data => setLocked(data.locked))
      .catch(err => {
        console.error(err);
        setLocked(false);
      });
  };

  useEffect(() => {
    if (userId) fetchLockStatus();
  }, [userId]);

  const lockCard = () => {
    fetch(`/api/card/${userId}/lock`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to lock card');
        return res.json();
      })
      .then(() => setLocked(true))
      .catch(err => console.error('Lock failed:', err));
  };

  const unlockCard = () => {
    fetch(`/api/card/${userId}/unlock`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to unlock card');
        return res.json();
      })
      .then(() => setLocked(false))
      .catch(err => console.error('Unlock failed:', err));
  };

  const handleSquareClick = (square) => {
    if (square?.image_path) {
      setModalImage(`${baseImageUrl}${square.image_path}`);
    }
  };

  const closeModal = () => setModalImage(null);

  const renderSquare = (row, col) => {
    const square = card.find(sq => sq.row === row && sq.col === col);
    if (!square) return (
      <div key={`${row}-${col}`} className="aspect-square w-full border bg-gray-200" />
    );

    const isMarked = !!square.image_path;
    const imageUrl = isMarked ? `${baseImageUrl}${square.image_path}` : null;

    return (
      <div
        key={`${row}-${col}`}
        className="relative w-full aspect-square border border-gray-300 bg-gray-100 flex flex-col justify-between text-center overflow-hidden hover:shadow"
      >
        {isMarked && (
          <img
            src={imageUrl}
            alt="uploaded"
            className="absolute inset-0 object-cover w-full h-full opacity-60"
          />
        )}

        <div
          className="relative z-10 p-1 sm:p-2 text-xs sm:text-sm font-semibold cursor-pointer overflow-auto break-words"
          onClick={() => handleSquareClick(square)}
        >
          {square.label || (isMarked ? '✓' : '')}
        </div>

        {canEdit && (
          <div className="relative z-10 p-1 sm:p-2 mt-auto">
            <label className="block text-[10px] sm:text-xs bg-white bg-opacity-80 px-2 py-1 rounded cursor-pointer hover:bg-opacity-100 shadow">
              Upload
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => onUploadClick(row, col, e.target.files[0])}
              />
            </label>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <h2 className="text-xl font-bold text-center">Bingo Card for {username}</h2>

      <div className="grid grid-cols-5 gap-2 w-full max-w-xl sm:max-w-4xl">
        {Array.from({ length: 5 }).map((_, row) =>
          Array.from({ length: 5 }).map((_, col) => renderSquare(row, col))
        )}
      </div>

      {canEdit && locked !== null && (
        <div className="flex flex-wrap justify-center gap-4 mt-4">
          {locked ? (
            <button
              onClick={unlockCard}
              className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
            >
              Unlock Card
            </button>
          ) : (
            <>
              <button
                onClick={onRandomize}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Randomize Card
              </button>
              <button
                onClick={lockCard}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Lock Card
              </button>
            </>
          )}
        </div>
      )}

      {canEdit && locked === true && (
        <div className="mt-2 text-red-500 font-bold">Card is locked</div>
      )}

      {modalImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50"
          onClick={closeModal}
        >
          <div
            className="bg-white p-4 rounded shadow-lg max-w-[90%] max-h-[90%]"
            onClick={(e) => e.stopPropagation()}
          >
            <img src={modalImage} alt="Square Detail" className="max-w-full max-h-[80vh]" />
          </div>
        </div>
      )}
    </div>
  );
}

