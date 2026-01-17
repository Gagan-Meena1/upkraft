import React from 'react';
import Image from 'next/image';

interface ProfileImageProps {
  username: string;
  profileImage?: string;
  size?: number;
}

const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map((word) => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export const ProfileImage: React.FC<ProfileImageProps> = ({ 
  username, 
  profileImage, 
  size = 100 
}) => {
  const [imageError, setImageError] = React.useState(false);

  if (imageError || !profileImage) {
    return (
      <div
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          backgroundColor: '#7009BA',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: `${size / 3}px`,
          fontWeight: 'bold',
          border: '3px solid #7009BA',
        }}
      >
        {getInitials(username)}
      </div>
    );
  }

  return (
    <Image
      src={profileImage}
      alt={`${username} Profile`}
      width={size}
      height={size}
      style={{ objectFit: 'cover', borderRadius: '50%' }}
      onError={() => setImageError(true)}
    />
  );
};