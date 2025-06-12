/**
 * VirPal App - AI Assistant with Azure Functions
 * Copyright (c) 2025 Achmad Reihan Alfaiz. All rights reserved.
 *
 * This file is part of VirPal App, a proprietary software application.
 *
 * PROPRIETARY AND CONFIDENTIAL
 *
 * This source code is the exclusive property of Achmad Reihan Alfaiz.
 * No part of this software may be reproduced, distributed, or transmitted
 * in any form or by any means, including photocopying, recording, or other
 * electronic or mechanical methods, without the prior written permission
 * of the copyright holder, except in the case of brief quotations embodied
 * in critical reviews and certain other noncommercial uses permitted by
 * copyright law.
 *
 * For licensing inquiries: reihan3000@gmail.com
 */

import React from 'react';

const AboutUs: React.FC = () => {
  // Styles untuk warna kustom dari CSS Variables (sesuai index.css)
  const virpalPrimaryColor = { color: 'var(--virpal-primary)' };
  const virpalNeutralDarkColor = { color: 'var(--virpal-neutral-dark)' };
  const virpalNeutralLighterBg = {
    backgroundColor: 'var(--virpal-neutral-lighter)',
  };
  const virpalNeutralLighterBorder = {
    borderColor: 'var(--virpal-neutral-lighter)',
  };

  return (
    <div className="space-y-8 p-4 sm:p-6 md:p-8">
      {' '}
      {/* Tambahkan padding untuk responsivitas */}
      {/* Hero Section */}
      <div className="text-center mb-8">
        <h3 className="text-3xl font-bold mb-4" style={virpalPrimaryColor}>
          Tentang VIRPAL
        </h3>
        <p className="text-xl leading-relaxed" style={virpalNeutralDarkColor}>
          Virtual Pal - Teman Virtual yang Memahami Hati Anda
        </p>
      </div>
      {/* Deskripsi: Latar Belakang & Masalah yang Diselesaikan */}
      <div
        className="p-6 rounded-lg border shadow-sm"
        style={{ ...virpalNeutralLighterBg, ...virpalNeutralLighterBorder }}
      >
        <h4 className="text-xl font-semibold mb-3" style={virpalPrimaryColor}>
          📖 Siapa Kami & Mengapa Kami Ada?
        </h4>
        <p
          className="text-base leading-relaxed mb-4"
          style={virpalNeutralDarkColor}
        >
          Di tengah era digital yang serba cepat, banyak dari kita merasakan
          kesepian, tekanan, atau kebutuhan akan pendamping yang memahami.
          Meskipun asisten digital konvensional mampu menjawab pertanyaan,
          mereka seringkali terasa kaku dan tidak mampu menjalin hubungan
          emosional. Pada saat yang sama, layanan chatbot berkarakter lain
          seringkali mahal, berbayar dalam Dolar AS, dan kurang terpersonalisasi
          untuk konteks lokal.
        </p>
        <p className="text-base leading-relaxed" style={virpalNeutralDarkColor}>
          VIRPAL (Virtual Pal) hadir sebagai terobosan: sebuah teman virtual
          berbasis AI yang bukan hanya cerdas secara logika, tetapi juga peka
          emosi, mampu menyesuaikan kepribadian dan gaya interaksinya dengan
          kebutuhan unik Anda. Kami menyediakan ruang aman dan nyaman untuk
          berekspresi, tanpa batasan biaya atau bahasa.
        </p>
      </div>
      {/* Visi Kami */}
      <div className="p-6 rounded-lg shadow-sm" style={virpalNeutralLighterBg}>
        <h4 className="text-xl font-semibold mb-3" style={virpalPrimaryColor}>
          👁️ Visi Kami
        </h4>
        <p className="text-base leading-relaxed" style={virpalNeutralDarkColor}>
          Menjadi pendamping digital terdepan di Indonesia yang menghadirkan
          teknologi AI empatik dan inklusif untuk meningkatkan kesejahteraan
          emosional masyarakat luas, tanpa batasan aksesibilitas dan ekonomi.
        </p>
      </div>
      {/* Misi Kami */}
      <div className="p-6 rounded-lg shadow-sm" style={virpalNeutralLighterBg}>
        <h4 className="text-xl font-semibold mb-3" style={virpalPrimaryColor}>
          🎯 Misi Kami
        </h4>
        <ul className="space-y-3 list-disc pl-6" style={virpalNeutralDarkColor}>
          <li
            className="items-start gap-2 text-base leading-relaxed"
            style={virpalNeutralDarkColor}
          >
            <span className="text-virpal-primary mt-1"></span> Menyediakan akses
            mudah dan terjangkau terhadap dukungan emosional berbasis AI untuk
            semua kalangan di Indonesia.
          </li>
          <li
            className="items-start gap-2 text-base leading-relaxed"
            style={virpalNeutralDarkColor}
          >
            <span className="text-virpal-primary mt-1"></span> Mengembangkan
            teknologi AI yang mampu memberikan respons empatik, personal, dan
            dinamis sesuai kondisi psikologis pengguna.
          </li>
          <li
            className="items-start gap-2 text-base leading-relaxed"
            style={virpalNeutralDarkColor}
          >
            <span className="text-virpal-primary mt-1"></span> Menciptakan
            pengalaman interaksi digital yang terasa manusiawi dan membangun
            keterikatan emosional yang positif.
          </li>
          <li
            className="items-start gap-2 text-base leading-relaxed"
            style={virpalNeutralDarkColor}
          >
            <span className="text-virpal-primary mt-1"></span> Menjadi solusi
            lokal yang relevan secara sosial dan realistis secara finansial bagi
            masyarakat Indonesia.
          </li>
        </ul>
      </div>
      {/* Fitur Utama */}
      <div>
        <h4 className="text-xl font-semibold mb-4" style={virpalPrimaryColor}>
          ✨ Fitur Utama Kami
        </h4>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
          <div
            className="flex items-start gap-3 p-4 rounded-lg shadow-sm"
            style={virpalNeutralLighterBg}
          >
            <span className="text-2xl">🤖</span>
            <div>
              <h5 className="font-semibold mb-1" style={virpalPrimaryColor}>
                AI Berkarakter & Empatik
              </h5>
              <p className="text-sm" style={virpalNeutralDarkColor}>
                Pilih dan sesuaikan kepribadian AI (ceria, kalem, sarkas tapi
                peduli) untuk interaksi yang lebih personal dan relevan.
              </p>
            </div>
          </div>

          <div
            className="flex items-start gap-3 p-4 rounded-lg shadow-sm"
            style={virpalNeutralLighterBg}
          >
            <span className="text-2xl">💖</span>
            <div>
              <h5 className="font-semibold mb-1" style={virpalPrimaryColor}>
                Dukungan Emosional
              </h5>
              <p className="text-sm" style={virpalNeutralDarkColor}>
                Ruang aman untuk berbagi perasaan, mengelola stres, dan merasa
                didengar tanpa dihakimi.
              </p>
            </div>
          </div>

          <div
            className="flex items-start gap-3 p-4 rounded-lg shadow-sm"
            style={virpalNeutralLighterBg}
          >
            <span className="text-2xl">💬</span>
            <div>
              <h5 className="font-semibold mb-1" style={virpalPrimaryColor}>
                Bahasa & Antarmuka Lokal
              </h5>
              <p className="text-sm" style={virpalNeutralDarkColor}>
                Seluruh aplikasi dirancang dengan Bahasa Indonesia agar nyaman
                dan mudah digunakan oleh masyarakat.
              </p>
            </div>
          </div>

          <div
            className="flex items-start gap-3 p-4 rounded-lg shadow-sm"
            style={virpalNeutralLighterBg}
          >
            <span className="text-2xl">💰</span>
            <div>
              <h5 className="font-semibold mb-1" style={virpalPrimaryColor}>
                Akses Terjangkau
              </h5>
              <p className="text-sm" style={virpalNeutralDarkColor}>
                Model freemium yang adil, memberikan akses fitur dasar gratis
                dan fitur premium dengan harga terjangkau.
              </p>
            </div>
          </div>

          <div
            className="flex items-start gap-3 p-4 rounded-lg shadow-sm"
            style={virpalNeutralLighterBg}
          >
            <span className="text-2xl">🔒</span>
            <div>
              <h5 className="font-semibold mb-1" style={virpalPrimaryColor}>
                Privasi & Keamanan Data
              </h5>
              <p className="text-sm" style={virpalNeutralDarkColor}>
                Semua percakapan Anda dienkripsi untuk menjaga kerahasiaan dan
                privasi.
              </p>
            </div>
          </div>

          <div
            className="flex items-start gap-3 p-4 rounded-lg shadow-sm"
            style={virpalNeutralLighterBg}
          >
            <span className="text-2xl">⏰</span>
            <div>
              <h5 className="font-semibold mb-1" style={virpalPrimaryColor}>
                Pendamping 24/7
              </h5>
              <p className="text-sm" style={virpalNeutralDarkColor}>
                VIRPAL selalu ada kapan saja Anda membutuhkan teman bicara,
                siang atau malam.
              </p>
            </div>
          </div>
        </div>
      </div>
      {/* Team Section */}
      <div>
        <h4 className="text-xl font-semibold mb-4" style={virpalPrimaryColor}>
          👥 Tim Pengembang
        </h4>
        <div
          className="text-center p-4 rounded-lg shadow-sm"
          style={virpalNeutralLighterBg}
        >
          <p className="text-base mb-2" style={virpalNeutralDarkColor}>
            VIRPAL dikembangkan oleh talenta-talenta lokal yang peduli dengan
            kesehatan mental dan inovasi teknologi di Indonesia.
          </p>
          <p className="text-sm font-medium" style={virpalPrimaryColor}>
            Bersama Membangun Kesejahteraan Emosional Bangsa
          </p>
        </div>
      </div>{' '}
      {/* Contact Section */}
      <div className="pt-6 border-t" style={virpalNeutralLighterBorder}>
        <h4 className="text-xl font-semibold mb-4" style={virpalPrimaryColor}>
          📞 Kontak Kami
        </h4>
        <div className="grid gap-4 md:grid-cols-3">
          <div
            className="p-4 rounded-lg shadow-sm"
            style={virpalNeutralLighterBg}
          >
            <h5 className="font-semibold mb-2" style={virpalPrimaryColor}>
              📧 Email Support
            </h5>
            <p className="text-sm mb-1" style={virpalNeutralDarkColor}>
              Untuk pertanyaan umum dan dukungan teknis:
            </p>
            <p className="text-sm font-medium" style={virpalPrimaryColor}>
              support@virpal.app
            </p>
          </div>

          <div
            className="p-4 rounded-lg shadow-sm"
            style={virpalNeutralLighterBg}
          >
            <h5 className="font-semibold mb-2" style={virpalPrimaryColor}>
              🏢 Kantor Pusat
            </h5>
            <p className="text-sm mb-1" style={virpalNeutralDarkColor}>
              VIRPAL Technologies
            </p>
            <p className="text-sm" style={virpalNeutralDarkColor}>
              Jakarta, Indonesia
            </p>
          </div>

          <div
            className="p-4 rounded-lg shadow-sm"
            style={virpalNeutralLighterBg}
          >
            <h5 className="font-semibold mb-2" style={virpalPrimaryColor}>
              📱 Media Sosial
            </h5>
            <p className="text-sm" style={virpalNeutralDarkColor}>
              Instagram: @virpal.official
              <br />
              Twitter: @virpal_app
              <br />
              LinkedIn: VIRPAL Technologies
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
