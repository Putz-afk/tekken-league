// src/app/rules/page.tsx
import Link from 'next/link';
import { FaArrowLeft } from 'react-icons/fa';

export default function RulesPage() {
  return (
    <div className="max-w-4xl mx-auto text-slate-200">
      <Link href="/" className="flex items-center gap-2 text-sm text-yellow-400 hover:underline mb-8">
        <FaArrowLeft /> Back to Home
      </Link>

      <div className="space-y-6 bg-slate-800 border border-slate-700 rounded-lg p-6 md:p-8">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-yellow-400 border-b border-slate-700 pb-4 mb-6">
          Liga Tekken 8: Peraturan Resmi (Round Robin)
        </h1>
        <p className="text-slate-300">
          Dokumen ini menguraikan semua peraturan dan regulasi untuk memastikan permainan yang adil, integritas kompetitif, dan pengalaman yang menyenangkan bagi semua peserta.
        </p>

        {/* Section 1 */}
        <section className="space-y-2">
          <h2 className="text-2xl font-bold text-slate-100">1. Gambaran Umum Liga</h2>
          <ul className="list-disc list-inside space-y-1 text-slate-300 pl-4">
            <li><strong>Format:</strong> Single Round Robin. Setiap pemain akan bertanding melawan setiap pemain lain tepat satu kali.</li>
            <li><strong>Jumlah Peserta:</strong> 8 Pemain.</li>
            <li><strong>Tujuan:</strong> Mengumpulkan poin terbanyak sepanjang liga untuk menjadi Juara Liga.</li>
          </ul>
        </section>

        {/* Section 2 */}
        <section className="space-y-3">
          <h2 className="text-2xl font-bold text-slate-100">2. Struktur & Pengaturan Pertandingan</h2>
          <p className="text-slate-300">Setiap pertandingan antar pemain akan terdiri dari tepat dua (2) set game.</p>
          <div>
            <h3 className="text-xl font-semibold text-slate-200 mb-2">2.1 Pengaturan Dalam Game untuk Setiap Game:</h3>
            <ul className="list-disc list-inside space-y-1 text-slate-300 pl-4">
              <li><strong>Game:</strong> Tekken 8</li>
              <li><strong>Mode:</strong> Versus Battle</li>
              <li><strong>Ronde:</strong> Best of 3 Round (Pemain pertama yang memenangkan 2 ronde individu memenangkan set tersebut).</li>
              <li><strong>Match:</strong> Pemain bertarung dalam 2 set game.</li>
              <li><strong>Batas Waktu Ronde:</strong> 90 Detik</li>
              <li><strong>Skala Kerusakan (Damage Scale):</strong> Default</li>
              <li><strong>Kustomisasi Karakter:</strong> MATI (OFF). Hanya kostum/preset karakter default yang diizinkan.</li>
              <li><strong>Pemilihan Arena (Stage Select):</strong> ACAK (RANDOM). Pemain harus memilih "Random" untuk arena sebelum setiap game.</li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-slate-200 mb-2">2.2 Aturan Pemilihan Karakter:</h3>
            <ul className="list-disc list-inside space-y-1 text-slate-300 pl-4">
              <li><strong>Pemenang Harus Mempertahankan Karakter:</strong> Jika seorang pemain memenangkan sebuah set, mereka harus terus menggunakan karakter yang sama untuk set berikutnya dalam pertandingan tersebut.</li>
              <li><strong>Pemain Kalah Dapat Mengganti Karakter:</strong> Jika seorang pemain kalah dalam sebuah set, mereka memiliki opsi untuk beralih ke karakter yang berbeda untuk set berikutnya dalam pertandingan tersebut.</li>
            </ul>
          </div>
        </section>

        {/* Section 3 */}
        <section className="space-y-2">
          <h2 className="text-2xl font-bold text-slate-100">3. Sistem Penilaian (Poin)</h2>
          <p className="text-slate-300">Poin akan diberikan berdasarkan hasil setiap pertandingan 2 game:</p>
          <ul className="list-disc list-inside space-y-1 text-slate-300 pl-4">
            <li><strong>Menang (Skor Game 2-0): 3 Poin</strong><br />Diberikan jika seorang pemain memenangkan kedua set dalam pertandingan.</li>
            <li><strong>Seri (Skor Game 1-1): 1 Poin</strong><br />Diberikan kepada kedua pemain jika masing-masing pemain memenangkan satu set.</li>
            <li><strong>Kalah (Skor Game 0-2): 0 Poin</strong><br />Diberikan jika seorang pemain kalah dalam kedua set.</li>
          </ul>
        </section>

        {/* Section 4 */}
        <section className="space-y-2">
          <h2 className="text-2xl font-bold text-slate-100">4. Klasemen Liga & Prosedur Tie-Breaker</h2>
          <p className="text-slate-300">Pemain akan diberi peringkat berdasarkan poin yang mereka kumpulkan. Jika terjadi seri dalam total poin, kriteria pemecah seri berikut akan diterapkan secara berurutan hingga seri terpecahkan:</p>
          <ol className="list-decimal list-inside space-y-2 text-slate-300 pl-4">
            <li><strong>Total Poin:</strong> Pemain dengan total poin tertinggi memenangkan seri.</li>
            <li><strong>Total Ronde yang Dimenangkan:</strong> Pemain yang memenangkan jumlah total ronde individu tertinggi dari seluruh pertandingan liganya akan memenangkan seri.</li>
            <li><strong>Selisih Ronde (Total Ronde Dimenangkan - Total Ronde Kalah):</strong> Jika masih seri, pemain dengan selisih positif yang lebih tinggi akan memenangkan seri.</li>
            <li><strong>Undian Koin / Random Draw:</strong> Dalam skenario yang sangat tidak mungkin di mana pemain masih seri, metode acak akan digunakan.</li>
          </ol>
        </section>

        {/* Section 5 */}
        <section className="space-y-2">
          <h2 className="text-2xl font-bold text-slate-100">5. Kebijakan Tournament Organizer (TO)</h2>
          <p className="text-slate-300">Tournament Organizer (TO) memegang otoritas terakhir dalam semua perselisihan dan keadaan yang tidak terduga. TO berhak membuat keputusan demi kepentingan terbaik integritas kompetitif dan keadilan liga.</p>
        </section>
      </div>
    </div>
  );
}