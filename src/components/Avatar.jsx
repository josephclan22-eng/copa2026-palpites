import { useState } from 'react';

function Avatar({ user, size = 32, className = '' }) {
  const [imgError, setImgError] = useState(false);

  if (!user) {
    return (
      <span className={`avatar-placeholder ${className}`} style={{ width: size, height: size, fontSize: size * 0.45 }}>
        ?
      </span>
    );
  }

  const letter = user.name ? user.name[0].toUpperCase() : '?';
  const avatarUrl = user.avatarUrl && !imgError ? user.avatarUrl : null;

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={user.name}
        className={`avatar-img ${className}`}
        style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover' }}
        onError={() => setImgError(true)}
      />
    );
  }

  const bg = letter.charCodeAt(0) % 5;
  const colors = [
    'linear-gradient(135deg, var(--green-brasil), var(--blue-brasil))',
    'linear-gradient(135deg, #FF6B35, #D62828)',
    'linear-gradient(135deg, #7209B7, #3F37C9)',
    'linear-gradient(135deg, #F77F00, #FCBF49)',
    'linear-gradient(135deg, #457B9D, #1D3557)',
  ];

  return (
    <span
      className={`avatar-letter ${className}`}
      style={{
        width: size,
        height: size,
        fontSize: size * 0.45,
        background: colors[bg],
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '50%',
        fontWeight: 700,
        color: 'white',
        flexShrink: 0,
      }}
    >
      {letter}
    </span>
  );
}

export default Avatar;
