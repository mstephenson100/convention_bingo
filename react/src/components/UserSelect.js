import React, { useEffect, useState } from 'react';

export default function UserSelect({ onSelect, baseImageUrl }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadingUserId, setUploadingUserId] = useState(null);

  const token = localStorage.getItem('auth_token');

  useEffect(() => {
    fetch('/api/users', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => {
        if (!res.ok) throw new Error("Unauthorized");
        return res.json();
      })
      .then(data => setUsers(data))
      .catch(err => {
        console.error("Failed to load users:", err);
        alert("Failed to load user list.");
      })
      .finally(() => setLoading(false));
  }, [token]);

  const handleImageUpload = (userId, file) => {
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);
    setUploadingUserId(userId);

    fetch(`/api/users/${userId}/upload-avatar`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    })
      .then(res => {
        if (!res.ok) throw new Error("Upload failed");
        return res.json();
      })
      .then(updated => {
        setUsers(prev =>
          prev.map(user =>
            user.id === userId ? { ...user, avatar: updated.avatar } : user
          )
        );
      })
      .catch(err => {
        console.error('Upload failed', err);
        alert("Avatar upload failed.");
      })
      .finally(() => setUploadingUserId(null));
  };

  if (loading) {
    return <div className="text-center mt-8 text-gray-500">Loading users...</div>;
  }

  return (
    <div className="w-full flex justify-center mt-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {users.map(user => (
          <div
            key={user.id}
            className="flex flex-col items-center bg-white shadow rounded p-4 border cursor-pointer hover:ring-2 hover:ring-blue-500"
            onClick={() => onSelect(user)}
          >
            <div className="text-sm font-semibold mb-2">{user.username}</div>
            <img
              src={user.avatar ? `${baseImageUrl}${user.avatar}` : `${baseImageUrl}avatars/default-avatar.png`}
              alt={`${user.username} avatar`}
              className="w-24 h-24 object-cover rounded-full mb-2 border"
            />
            <label
              className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-800 px-2 py-1 rounded cursor-pointer shadow-sm"
              onClick={(e) => e.stopPropagation()}
            >
              {uploadingUserId === user.id ? "Uploading..." : "Upload Image"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => handleImageUpload(user.id, e.target.files[0])}
              />
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}

