// src/components/Subscription.tsx
import React from 'react';

interface LanggananPlan {
  name: string;
  price: string;
  period: string;
  features: string[];
  isPopular?: boolean;
  emoji: string;
}

const Subscription: React.FC = () => {  // Styles untuk warna kustom dari CSS Variables (sesuai index.css)
  const virpalPrimaryColor = { color: 'var(--virpal-primary)' };
  const virpalNeutralDarkColor = { color: 'var(--virpal-neutral-dark)' };
  const virpalNeutralLighterBg = { backgroundColor: 'var(--virpal-neutral-lighter)' };
  const virpalNeutralLighterBorder = { borderColor: 'var(--virpal-neutral-lighter)' };
  const virpalPrimaryBg = { backgroundColor: 'var(--virpal-primary)' };

  const plans: LanggananPlan[] = [
    {
      name: "Gratis",
      price: "Rp 0",
      period: "/selamanya",
      emoji: "🆓",
      features: [
        "Percakapan dasar dengan VIRPAL AI",
        "Akses 24/7 untuk dukungan mental",
        "Riwayat percakapan 3 hari terakhir (disimpan lokal)", // Batasan riwayat
        "Fitur mood check-in harian",
        "Akses ke karakter AI dasar (netral, ceria)", // Batasan karakter
        "Jumlah pesan harian terbatas", // Batasan jumlah pesan
        "Artikel kesehatan mental gratis"
      ]
    },
    {
      name: "Premium",
      price: "Rp 39.000",
      period: "/bulan",
      emoji: "⭐",
      isPopular: true,
      features: [
        "Semua fitur paket Gratis",
        "Percakapan mendalam & personal dengan AI tanpa batas", // Unlimited message
        "Riwayat percakapan tak terbatas (disimpan di server aman)", // Unlimited history, server storage
        "Voice chat (Text-to-Speech & Speech-to-Text)", // Asumsi fitur premium
        "Pilihan karakter AI yang beragam (kalem, sarkas, humoris)", // More character options
        "Mood tracking & analisis perkembangan pribadi",
        "Sesi relaksasi dan panduan fokus", // Guided meditation/relaxation
        "Dukungan prioritas dari tim VIRPAL"
      ]
    },
    {
      name: "Elite",
      price: "Rp 89.000",
      period: "/bulan",
      emoji: "💎",
      features: [
        "Semua fitur paket Premium",
        "Akses ke mode AI dengan personality therapist khusus", // Advanced character/therapy styles
        "Analisis sentimen percakapan tingkat lanjut", // Advanced analytics
        "Ekspor ringkasan interaksi & progres emosional (terenkripsi)", // Export laporan
        "Prioritas untuk fitur terbaru (early access)",
        "Dukungan integrasi API untuk aplikasi kesehatan mental (opsional)", // If VIRPAL aims to integrate
        "Diskon khusus untuk konsultasi psikolog profesional (melalui partner)" // Clarify this is referral/discount
      ]
    }
  ];  const handleSubscribe = (planName: string) => {
    // Implementasi langganan logic nanti
    alert(`Terima kasih! Fitur langganan untuk paket ${planName} akan segera hadir. Anda akan diarahkan ke halaman pembayaran.`);
  };

  return (
    <div className="space-y-8 p-4 sm:p-6 md:p-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h3 className="text-3xl font-bold mb-2" style={virpalPrimaryColor}>
          Pilih Paket VIRPAL
        </h3>
        <p className="text-lg leading-relaxed" style={virpalNeutralDarkColor}>
          Tingkatkan pengalaman VIRPAL Anda dengan fitur-fitur premium yang lebih personal dan mendalam
        </p>
      </div>

      {/* Plans Grid */}
      <div className="grid gap-6 md:grid-cols-3"> {/* Lebih besar sedikit gapnya */}
        {plans.map((plan, index) => (          <div
            key={index}
            className={`relative p-6 rounded-xl border-2 transition-all duration-200 flex flex-col ${
              plan.isPopular ? 'border-purple-400 shadow-lg scale-105' : 'border-gray-200'
            }`}
            style={{
              backgroundColor: plan.isPopular ? 'rgba(121, 80, 242, 0.05)' : 'var(--virpal-content-bg)',
              borderColor: plan.isPopular ? 'var(--virpal-primary)' : 'var(--virpal-neutral-lighter)'
            }}
          >
            {/* Popular Badge */}
            {plan.isPopular && (
              <div
                className="absolute -top-3 left-1/2 transform -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold text-white"
                style={virpalPrimaryBg}
              >
                PALING POPULER
              </div>
            )}

            {/* Plan Header */}
            <div className="text-center mb-6">
              <div className="text-4xl mb-2">{plan.emoji}</div> {/* Ukuran emoji lebih besar */}
              <h4 className="text-2xl font-bold mb-2" style={virpalPrimaryColor}>
                {plan.name}
              </h4>
              <div className="mb-4">
                <span className="text-3xl font-bold" style={virpalPrimaryColor}>
                  {plan.price}
                </span>
                {plan.period && (
                  <span className="text-base" style={virpalNeutralDarkColor}> {/* Ukuran teks periode lebih besar */}
                    {plan.period}
                  </span>
                )}
              </div>
            </div>

            {/* Features List */}
            <ul className="space-y-3 mb-6 flex-grow"> {/* flex-grow agar tombol selalu di bawah */}
              {plan.features.map((feature, featureIndex) => (
                <li key={featureIndex} className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span className="text-sm" style={virpalNeutralDarkColor}>
                    {feature}
                  </span>
                </li>
              ))}
            </ul>

            {/* Subscribe Button */}            <button
              onClick={() => handleSubscribe(plan.name)}
              className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-200 mt-auto ${
                plan.isPopular
                  ? 'text-white shadow-lg'
                  : 'border-2'
              }`}
              style={{
                backgroundColor: plan.isPopular ? 'var(--virpal-primary)' : 'transparent',
                borderColor: 'var(--virpal-primary)', // Selalu pakai border warna primer
                color: plan.isPopular ? 'white' : 'var(--virpal-primary)'
              }}
              onMouseEnter={(e) => {
                if (!e.currentTarget.disabled) {
                  e.currentTarget.style.backgroundColor = plan.isPopular ? 'var(--virpal-secondary)' : 'var(--virpal-accent)'; // Ganti hover dengan secondary/accent
                  e.currentTarget.style.color = plan.isPopular ? 'white' : 'var(--virpal-primary)';
                  if (!plan.isPopular) e.currentTarget.style.borderColor = 'var(--virpal-primary)'; // Border tetap
                }
              }}
              onMouseLeave={(e) => {
                if (!e.currentTarget.disabled) {
                  e.currentTarget.style.backgroundColor = plan.isPopular ? 'var(--virpal-primary)' : 'transparent';
                  e.currentTarget.style.color = plan.isPopular ? 'white' : 'var(--virpal-primary)';
                  if (!plan.isPopular) e.currentTarget.style.borderColor = 'var(--virpal-primary)';
                }
              }}
            >
              {plan.price === "Rp 0" ? "Mulai Gratis" : "Berlangganan Sekarang"}
            </button>
          </div>
        ))}
      </div>

      {/* FAQ Section */}
      <div className="mt-8 pt-6 border-t" style={virpalNeutralLighterBorder}>
        <h4 className="text-xl font-semibold mb-4" style={virpalPrimaryColor}>
          🤔 Pertanyaan yang Sering Diajukan
        </h4>
        <div className="space-y-4">
          <div className="p-4 rounded-lg shadow-sm" style={virpalNeutralLighterBg}>
            <h5 className="font-semibold mb-2" style={virpalPrimaryColor}>
              Bagaimana cara meng-upgrade atau membatalkan langganan?
            </h5>
            <p className="text-sm" style={virpalNeutralDarkColor}>
              Anda dapat mengelola langganan (upgrade, downgrade, atau pembatalan) kapan saja melalui halaman pengaturan akun Anda. Fitur premium akan tetap aktif hingga akhir periode billing Anda.
            </p>
          </div>

          <div className="p-4 rounded-lg shadow-sm" style={virpalNeutralLighterBg}>
            <h5 className="font-semibold mb-2" style={virpalPrimaryColor}>
              Apakah riwayat percakapan saya aman?
            </h5>
            <p className="text-sm" style={virpalNeutralDarkColor}>
              Ya, privasi dan keamanan data Anda adalah prioritas utama kami. Semua percakapan Anda dienkripsi end-to-end. Untuk paket gratis, riwayat tersimpan lokal di perangkat Anda. Untuk paket Premium/Pro, riwayat disimpan di server aman kami dengan protokol enkripsi terdepan. Kami tidak pernah membagikan data pribadi Anda kepada pihak ketiga.
            </p>
          </div>

          <div className="p-4 rounded-lg shadow-sm" style={virpalNeutralLighterBg}>
            <h5 className="font-semibold mb-2" style={virpalPrimaryColor}>
              Apakah VIRPAL dapat menggantikan terapi psikolog profesional?
            </h5>
            <p className="text-sm" style={virpalNeutralDarkColor}>
              VIRPAL dirancang sebagai pendamping emosional dan alat dukungan untuk kesejahteraan mental sehari-hari. Kami bukan pengganti terapi, diagnosis, atau penanganan medis dari profesional. Untuk kondisi kesehatan mental yang serius, kami sangat menyarankan untuk berkonsultasi dengan psikolog atau psikiater berlisensi.
            </p>
          </div>

          <div className="p-4 rounded-lg shadow-sm" style={virpalNeutralLighterBg}>
            <h5 className="font-semibold mb-2" style={virpalPrimaryColor}>
              Apa perbedaan utama antara paket Gratis dan Premium?
            </h5>
            <p className="text-sm" style={virpalNeutralDarkColor}>
              Paket Premium menawarkan pengalaman VIRPAL tanpa batas dengan percakapan lebih mendalam, riwayat percakapan tak terbatas yang disimpan di server, pilihan karakter AI yang lebih beragam, dan fitur-fitur eksklusif lainnya yang dirancang untuk dukungan emosional yang lebih personal dan komprehensif.
            </p>
          </div>
        </div>
      </div>

      {/* Contact Support */}
      <div className="text-center mt-6 p-4 rounded-lg shadow-sm" style={virpalNeutralLighterBg}>
        <p className="text-sm mb-2" style={virpalNeutralDarkColor}>
          Butuh bantuan memilih paket langganan yang tepat atau pertanyaan lain?
        </p>
        <p className="text-sm font-medium" style={virpalPrimaryColor}>
          📞 Hubungi Support: support@virpal.app
        </p>
        <p className="text-xs mt-2" style={virpalNeutralDarkColor}>
          Tim support kami siap membantu Anda
        </p>
      </div>
    </div>
  );
};

export default Subscription;