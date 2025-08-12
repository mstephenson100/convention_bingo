import React from 'react';

export default function SquareDetailModal({ square, onClose }) {
  if (!square) return null;
  return (
    <div className="fixed top-0 left-0 right-0 bottom-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded">
        <h3>{square.label}</h3>
        {square.image_path && <img src={`/${square.image_path}`} alt="Uploaded" className="max-w-xs" />}
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
}
