/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,

  // Header keamanan untuk semua halaman
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // Mencegah website Anda dimasukkan ke dalam iframe situs lain (anti-clickjacking)
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
          // Mencegah browser "menebak" jenis file
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Tidak membocorkan alamat lengkap halaman ke situs lain
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Website ini tidak butuh kamera, mikrofon, atau lokasi
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          // Paksa HTTPS
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
        ],
      },
    ];
  },
};

export default nextConfig;
