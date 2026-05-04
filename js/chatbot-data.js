// js/chatbot-data.js

const CHATBOT_RULES = [
    // Anti-Cheat Rules (Prioritas Tertinggi)
    {
        keywords: ['jawaban soal', 'kunci jawaban', 'jawaban nomor', 'jawaban no', 'jawabannya apa', 'kasih tau jawaban', 'bocoran', 'cheat'],
        answer: 'Silakan pahami konsepnya terlebih dahulu ya, saya bisa membantu menjelaskan materinya secara rinci 😊. Jangan sungkan untuk bertanya tentang fungsi atau rumusnya!'
    },
    
    // Q&A Spesifik & Edukatif (Prioritas Tinggi)
    {
        keywords: ['parameter ke-3 pada vlookup', 'parameter ketiga vlookup', 'parameter ke-3 vlookup', 'parameter vlookup'],
        answer: 'Fungsi VLOOKUP memiliki beberapa parameter, yaitu: 1. lookup_value, 2. table_array, 3. col_index_num, dan 4. range_lookup. Nah, parameter ke-3 adalah col_index_num yang berfungsi untuk menentukan dari kolom tabel referensi nomor berapa nilai hasil akan diambil.'
    },
    {
        keywords: ['rumus untuk menjumlahkan', 'menjumlahkan data', 'fungsi menjumlahkan', 'rumus menjumlahkan'],
        answer: 'Di Excel, menjumlahkan data adalah salah satu operasi matematika paling dasar. Anda bisa menggunakan fungsi khusus untuk ini, yaitu fungsi =SUM() untuk menjumlahkan rentang (range) sel tertentu. Contohnya: =SUM(A1:A10).'
    },
    {
        keywords: ['kolom di excel', 'kolom excel', 'representasi kolom'],
        answer: 'Struktur lembar kerja Excel terdiri dari kotak-kotak (Cell) yang merupakan pertemuan antara baris dan kolom. Baris direpresentasikan dengan Angka (1, 2, 3), sedangkan Kolom di Excel direpresentasikan dengan Huruf (A, B, C).'
    },

    // Sapaan
    {
        keywords: ['halo', 'hai', 'hi', 'pagi', 'siang', 'sore', 'malam'],
        answer: 'Halo! Saya adalah Asisten Belajar Excel Anda. Saya siap menjadi tutor pendamping untuk menjelaskan fungsi dan rumus Excel secara edukatif.'
    },
    {
        keywords: ['apa itu excel', 'pengertian excel', 'fungsi excel'],
        answer: 'Microsoft Excel adalah program spreadsheet (lembar kerja) dari Microsoft yang digunakan untuk mengolah data angka, teks, melakukan perhitungan, dan membuat grafik.'
    },

    // Fungsi Dasar & Edukatif
    {
        keywords: ['sum', 'jumlah', 'total'],
        answer: 'Fungsi SUM digunakan untuk menjumlahkan sekumpulan angka secara otomatis. Contoh penggunaan: =SUM(A1:A10) akan menjumlahkan semua angka dari sel A1 hingga A10.'
    },
    {
        keywords: ['average', 'rata-rata', 'rata'],
        answer: 'Fungsi AVERAGE digunakan untuk mencari nilai rata-rata dari sekumpulan angka. Contoh: =AVERAGE(B1:B5) akan menghasilkan rata-rata dari sel B1 sampai B5.'
    },
    {
        keywords: ['vlookup', 'cari data vertikal', 'mencari data'],
        answer: 'Fungsi VLOOKUP (Vertical Lookup) digunakan untuk mencari data secara vertikal berdasarkan suatu nilai kunci. Rumus dasarnya adalah =VLOOKUP(lookup_value, table_array, col_index_num, FALSE). Anda bisa bertanya tentang parameter spesifiknya kepada saya.'
    },
    {
        keywords: ['hlookup', 'cari horizontal'],
        answer: 'Fungsi HLOOKUP (Horizontal Lookup) mirip dengan VLOOKUP, tetapi pencariannya dilakukan secara horizontal (baris pertama) dan mengambil data pada baris di bawahnya.'
    },
    {
        keywords: ['if', 'logika if', 'jika', 'syarat', 'kondisi'],
        answer: 'Fungsi IF digunakan untuk melakukan uji logika. Jika kondisi benar (TRUE) maka akan mengembalikan nilai tertentu, jika salah (FALSE) nilai lain. Contoh: =IF(A1>=75, "Lulus", "Gagal").'
    },
    
    // Fallback/Standard Konsep Lainnya
    {
        keywords: ['min', 'minimal', 'terkecil', 'paling kecil'],
        answer: 'Fungsi MIN digunakan untuk mencari nilai terkecil/terendah dari sekumpulan data. Contoh: =MIN(C1:C20).'
    },
    {
        keywords: ['max', 'maksimal', 'terbesar', 'paling besar'],
        answer: 'Fungsi MAX digunakan untuk mencari nilai terbesar/tertinggi dari sekumpulan data angka. Contoh: =MAX(D1:D15).'
    },
    {
        keywords: ['count', 'hitung angka'],
        answer: 'Fungsi COUNT digunakan untuk menghitung berapa banyak sel yang berisi ANGKA dalam suatu range. Sel berisi teks akan diabaikan.'
    },
    {
        keywords: ['pivot', 'pivottable', 'tabel pivot', 'rekap data'],
        answer: 'Pivot Table adalah fitur canggih Excel untuk merangkum dan menganalisis ringkasan data besar. Anda dapat membuat laporan interaktif tanpa rumus rumit.'
    },
    {
        keywords: ['absolute', 'absolut', 'kunci sel', '$', 'f4'],
        answer: 'Referensi Absolut (contoh $A$1) digunakan agar posisi sel tidak bergeser saat rumus di-copy ke sel lain. Tekan F4 saat mengedit rumus untuk membuatnya absolut.'
    },
    {
        keywords: ['terima kasih', 'makasih', 'thanks'],
        answer: 'Sama-sama! Jangan ragu untuk bertanya lagi jika ada kebingungan seputar materi Excel ya. Semangat belajarnya!'
    }
];

window.ChatbotData = CHATBOT_RULES;

window.getChatbotResponse = function(query) {
    const text = query.toLowerCase();
    
    // Simple matching scoring
    let bestMatch = null;
    let maxMatches = 0;

    for (const rule of window.ChatbotData) {
        for (const kw of rule.keywords) {
            // Check if keyword is part of the query
            if (text.includes(kw.toLowerCase())) {
                return rule.answer; // Return immediately on first hit (simple rule)
            }
        }
    }

    return "Maaf, saya belum memahami pertanyaan tersebut. Coba gunakan kata kunci lain, seperti: VLOOKUP, IF, Pivot Table, SUM, dll.";
};
