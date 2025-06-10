import React from 'react';
import type { AvatarExpression } from '../types'; // Pastikan tipe ini sudah ada

interface AvatarProps {
  expression?: AvatarExpression;
  imageUrl?: string; // URL gambar spesifik jika ada (misal dari user profile)
  altText?: string;
}

const Avatar: React.FC<AvatarProps> = ({
  expression = 'neutral',
  imageUrl, // Jika ini diberikan, akan diutamakan
  altText = "Virpal Avatar",
}) => {
  // Fungsi untuk menentukan path gambar berdasarkan ekspresi
  // Asumsi gambar ada di public/images/nama-ekspresi.png
  const getDynamicImageUrl = (): string => {
    if (imageUrl) return imageUrl; // Jika imageUrl spesifik diberikan, gunakan itu

    switch (expression) {
      case 'happy':
        return '/images/avatar-happy.png';
      case 'thinking':
        return '/images/avatar-thinking.png';
      case 'sad':
        return '/images/avatar-sad.png';
      case 'listening':
        return '/images/avatar-listening.png';
      case 'neutral':
      default:
        return '/images/avatar-neutral.png';
    }
  };

  const finalImageUrl = getDynamicImageUrl();

  const avatarBorderStyle = {
    borderColor: 'var(--virpal-primary)', // Menggunakan warna primer untuk border
  };

  const placeholderStyle = {
    backgroundColor: 'var(--virpal-neutral-lighter)',
    color: 'var(--virpal-neutral-dark)',
  };

  return (
    <div
      className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden border-4 shadow-lg flex items-center justify-center"
      style={avatarBorderStyle} // Terapkan gaya border di sini
    >
      <img
        key={finalImageUrl} // Tambahkan key jika gambar berubah agar React me-render ulang
        src={finalImageUrl}
        alt={altText}
        className="w-full h-full object-cover"
        // Error handling sederhana jika gambar tidak ditemukan
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          // Ganti dengan placeholder jika gambar error, atau biarkan style parent mengambil alih
          target.style.display = 'none'; // Sembunyikan gambar yang error
          const parent = target.parentElement;
          if (parent && !parent.querySelector('.avatar-placeholder-text')) { // Hindari duplikasi placeholder
            parent.style.backgroundColor = placeholderStyle.backgroundColor; // Atur bg dari style parent
            const placeholderText = document.createElement('span');
            placeholderText.className = 'avatar-placeholder-text text-xs font-semibold';
            placeholderText.style.color = placeholderStyle.color;
            placeholderText.textContent = expression.substring(0,3).toUpperCase(); // Misal: NEU, HAP
            parent.appendChild(placeholderText);
          }
        }}
      />
    </div>
  );
};

export default Avatar;