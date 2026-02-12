"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import {
  Zap,
  Trophy,
  Activity,
  Search,
  Play,
  ChevronRight,
  ArrowRight,
  User,
  Users,
  Database,
  Target,
  Menu,
  X,
  MapPin,
  Phone,
  Mail,
} from "lucide-react";

// Utility function for class merging
function cn(...inputs: (string | undefined | null | boolean)[]) {
  return twMerge(clsx(inputs));
}

// ============================================
// NAVBAR COMPONENT
// ============================================
function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "#sorotan", label: "SOROTAN" },
    { href: "#data", label: "DATA" },
    { href: "#atlet", label: "ATLET" },
    { href: "#tentang", label: "TENTANG" },
  ];

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
        isScrolled
          ? "bg-koni-dark/95 backdrop-blur-md shadow-2xl shadow-black/50"
          : "bg-transparent"
      )}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-24 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative h-28 w-28 transition-transform duration-300 group-hover:scale-110">
              <Image
                src="/img/logo/koni-1.svg"
                alt="KONI Surabaya"
                fill
                className="object-contain"
                priority
              />
            </div>
            <span className="hidden sm:block text-white font-black text-xl tracking-tight">
              KONI <span className="text-koni-gold">SURABAYA</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-white font-bold text-sm tracking-wider hover:text-koni-gold transition-colors duration-300 relative group"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-koni-gold transition-all duration-300 group-hover:w-full" />
              </Link>
            ))}
          </div>

          {/* CTA Button */}
          <div className="flex items-center gap-4">
            <Link
              href="/lapor-prestasi"
              className="hidden sm:flex items-center justify-center bg-transparent border-2 border-koni-gold px-4 py-2.5 rounded-full text-koni-gold font-bold text-sm tracking-wider hover:bg-koni-gold hover:text-koni-dark transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-koni-gold/50 mr-2"
            >
              LAPOR PRESTASI
            </Link>

            <Link
              href="/login"
              className="hidden sm:flex items-center justify-center bg-koni-red p-2.5 rounded-full text-white hover:bg-red-700 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-koni-red/50"
              aria-label="Login Pengurus"
            >
              <User className="h-5 w-5" />
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden text-white p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={cn(
            "md:hidden overflow-hidden transition-all duration-300",
            isMobileMenuOpen ? "max-h-96 pb-6" : "max-h-0"
          )}
        >
          <div className="flex flex-col gap-4 pt-4 border-t border-white/10">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-white font-bold text-sm tracking-wider hover:text-koni-gold transition-colors py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/lapor-prestasi"
              className="flex items-center justify-center gap-2 bg-transparent border-2 border-koni-gold px-6 py-3 text-koni-gold font-bold text-sm tracking-wider hover:bg-koni-gold hover:text-koni-dark transition-colors mt-2 rounded-lg"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              LAPOR PRESTASI
              <Trophy className="h-4 w-4" />
            </Link>
            <Link
              href="/login"
              className="flex items-center justify-center gap-2 bg-koni-red px-6 py-3 text-white font-bold text-sm tracking-wider hover:bg-red-700 transition-colors rounded-lg"
            >
              LOGIN PENGURUS
              <User className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

// ============================================
// HERO SECTION
// ============================================
function HeroSection() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-koni-dark">
      {/* Background Image Layer */}
      <div className="absolute inset-0 z-0">
        {/* Placeholder for high-impact background image */}
        <Image
          src="/hero-bg.jpg"
          alt="Athletes in action"
          fill
          className="object-cover object-center"
          priority
          onError={(e) => {
            // Fallback if image doesn't exist
            e.currentTarget.style.display = 'none';
          }}
        />
        {/* Fallback gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-neutral-900 via-koni-dark to-neutral-800" />
      </div>

      {/* Heavy Gradient Overlays for Text Readability */}
      <div className="absolute inset-0 z-[1]">
        {/* Left-side heavy overlay for text area */}
        <div className="absolute inset-0 bg-gradient-to-r from-neutral-950 via-neutral-950/80 to-transparent" />
        {/* Top overlay for navbar blend */}
        <div className="absolute inset-0 bg-gradient-to-b from-neutral-950/60 via-transparent to-transparent" />
        {/* Bottom overlay for stats area */}
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-transparent" />
      </div>

      {/* Decorative Elements */}
      <div className="absolute inset-0 z-[2] pointer-events-none">
        {/* Geometric pattern overlay */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwxOTksNDQsMC4wMykiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-40" />
        {/* Dynamic accent shapes */}
        <div className="absolute top-1/4 -right-32 w-96 h-96 bg-koni-red/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/3 -left-32 w-80 h-80 bg-koni-gold/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 right-1/4 w-64 h-64 bg-koni-red/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col justify-center min-h-screen pb-40 pt-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-4xl">
            {/* Tag */}
            {/* <div
              className={cn(
                "inline-flex items-center gap-2 bg-koni-red/20 border border-koni-red/50 px-4 py-2 mb-6 transition-all duration-700",
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-4"
              )}
            >
              <Zap className="h-4 w-4 text-koni-gold" />
              <span className="text-koni-gold font-bold text-sm tracking-widest uppercase">
                KONI Kota Surabaya
              </span>
            </div> */}

            {/* Main Headline */}
            <h1
              className={cn(
                "relative z-10 text-5xl sm:text-7xl lg:text-8xl font-black text-white uppercase leading-[0.9] mb-8 transition-all duration-700 delay-200",
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
              )}
            >
              <span className="block">WANI</span>
              <span className="block">WANI</span>
              <span className="block text-koni-red drop-shadow-[0_0_40px_rgba(184,22,28,0.6)]">
                JUARA
              </span>
              {/* <span className="block relative inline-block">
                SURABAYA
                <span className="absolute -bottom-3 left-0 w-1/3 h-1.5 bg-koni-gold" />
              </span> */}
            </h1>

            {/* Subheadline */}
            <p
              className={cn(
                "text-lg sm:text-xl text-white/80 max-w-xl mb-12 leading-relaxed transition-all duration-700 delay-400",
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
              )}
            >
              Mengobarkan semangat patriot olahraga menuju prestasi dunia.
              Bersatu dalam keunggulan, bergerak dalam kemenangan.
            </p>

            {/* CTA Buttons */}
            <div
              className={cn(
                "flex flex-wrap gap-4 transition-all duration-700 delay-600",
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
              )}
            >
              <Link
                href="#data"
                className="group inline-flex items-center gap-3 bg-koni-red px-8 py-4 text-white font-bold text-lg tracking-wider hover:bg-red-700 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-koni-red/50"
              >
                JELAJAHI EKOSISTEM
                <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="#sorotan"
                className="inline-flex items-center gap-3 border-2 border-white/30 px-8 py-4 text-white font-bold text-lg tracking-wider hover:border-koni-gold hover:text-koni-gold transition-all duration-300 backdrop-blur-sm"
              >
                <Play className="h-5 w-5" />
                LIHAT AKSI
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Bar - Pinned to Bottom */}
      <div className="absolute bottom-0 left-0 right-0 z-20">
        {/* Separator line with glow */}
        <div className="h-px bg-gradient-to-r from-transparent via-koni-gold/50 to-transparent" />

        {/* Stats container with backdrop blur */}
        <div className="bg-neutral-950/70 backdrop-blur-md">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
              {[
                { value: "0", label: "CABOR", icon: Activity },
                { value: "0", label: "ATLET", icon: Users },
                { value: "0", label: "MEDALI", icon: Trophy },
                { value: "0", label: "PELATIH", icon: Target },
              ].map((stat, index) => (
                <div
                  key={index}
                  className="text-center group cursor-default relative"
                >
                  {/* Hover background effect */}
                  <div className="absolute inset-0 bg-koni-red/0 group-hover:bg-koni-red/10 transition-colors rounded-lg -m-2" />

                  <div className="relative">
                    <stat.icon className="h-5 w-5 text-koni-gold mx-auto mb-2 group-hover:scale-110 transition-transform" />
                    <div className="text-2xl sm:text-3xl md:text-4xl font-black text-white group-hover:text-koni-gold transition-colors">
                      {stat.value}
                    </div>
                    <div className="text-[10px] sm:text-xs text-white/50 tracking-widest font-medium mt-1">
                      {stat.label}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator - positioned above stats */}
      <div className="absolute bottom-36 left-1/2 -translate-x-1/2 z-20 animate-bounce hidden md:block">
        <div className="w-7 h-11 border-2 border-white/20 rounded-full flex justify-center pt-2">
          <div className="w-1 h-2.5 bg-koni-gold rounded-full animate-scroll" />
        </div>
      </div>
    </section>
  );
}

// ============================================
// SOROTAN AKSI SECTION (Dynamic Grid)
// ============================================
function SorotanSection() {
  const cards = [
    {
      title: "ROAD TO PORPROV",
      category: "EVENT",
      description: "Persiapan intensif menuju Pekan Olahraga Provinsi 2026",
      size: "large",
      featured: true,
    },
    {
      title: "FINAL BASKET WALIKOTA CUP",
      category: "HIGHLIGHT",
      description: "Momen kemenangan dramatis di detik-detik akhir",
      size: "medium",
      hasVideo: true,
    },
    {
      title: "SISTEM DATABASE BARU DILUNCURKAN",
      category: "BERITA",
      description: "KONI modernisasi sistem pendataan atlet digital",
      size: "medium",
    },
    {
      title: "PROGRAM PEMBINAAN USIA DINI",
      category: "PROGRAM",
      description: "Menciptakan bibit juara dari usia dini",
      size: "small",
    },
    {
      title: "PRESTASI ATLET INTERNASIONAL",
      category: "PRESTASI",
      description: "Harumkan nama Surabaya di kancah Asia",
      size: "small",
    },
  ];

  return (
    <section id="sorotan" className="relative py-24 bg-koni-light">
      {/* Section Header */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-12">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <span className="text-koni-red font-bold text-sm tracking-widest uppercase">
              Berita & Update
            </span>
            <h2 className="text-4xl sm:text-5xl font-black text-koni-dark uppercase mt-2">
              SOROTAN <span className="text-koni-red">AKSI</span>
            </h2>
          </div>
          <Link
            href="#"
            className="inline-flex items-center gap-2 text-koni-dark font-bold hover:text-koni-red transition-colors group"
          >
            LIHAT SEMUA
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>

      {/* Bento Grid */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Large Featured Card */}
          <div className="lg:col-span-2 lg:row-span-2 group relative overflow-hidden bg-koni-dark min-h-[400px] lg:min-h-[500px] cursor-pointer">
            <div className="absolute inset-0 bg-gradient-to-t from-koni-dark via-koni-dark/50 to-transparent z-10" />
            <div className="absolute inset-0 bg-koni-red/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10" />

            {/* Content */}
            <div className="absolute inset-0 z-20 flex flex-col justify-end p-8">
              <span className="inline-block bg-koni-gold text-koni-dark font-bold text-xs px-3 py-1 mb-4 w-fit tracking-widest">
                {cards[0].category}
              </span>
              <h3 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white uppercase mb-3 group-hover:text-koni-gold transition-colors">
                {cards[0].title}
              </h3>
              <p className="text-white/70 text-lg max-w-md mb-6">
                {cards[0].description}
              </p>
              <div className="flex items-center gap-2 text-koni-gold font-bold group-hover:gap-4 transition-all">
                <span>SELENGKAPNYA</span>
                <ArrowRight className="h-5 w-5" />
              </div>
            </div>

            {/* Decorative corner */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-koni-red clip-diagonal opacity-80" />
          </div>

          {/* Video Highlight Card */}
          <div className="group relative overflow-hidden bg-koni-dark min-h-[240px] cursor-pointer">
            <div className="absolute inset-0 bg-gradient-to-t from-koni-dark via-koni-dark/70 to-koni-dark/30 z-10" />

            {/* Play Button */}
            <div className="absolute inset-0 z-20 flex items-center justify-center">
              <div className="w-20 h-20 bg-koni-gold rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-2xl shadow-koni-gold/50">
                <Play className="h-8 w-8 text-koni-dark ml-1" fill="currentColor" />
              </div>
            </div>

            {/* Content */}
            <div className="absolute bottom-0 left-0 right-0 z-20 p-6">
              <span className="inline-block bg-koni-gold/20 border border-koni-gold text-koni-gold font-bold text-xs px-3 py-1 mb-2 tracking-widest">
                {cards[1].category}
              </span>
              <h3 className="text-xl font-black text-white uppercase group-hover:text-koni-gold transition-colors">
                {cards[1].title}
              </h3>
            </div>
          </div>

          {/* News Card */}
          <div className="group relative overflow-hidden bg-white border-2 border-koni-dark/10 min-h-[240px] cursor-pointer hover:border-koni-red transition-colors">
            <div className="absolute top-0 left-0 w-1 h-full bg-koni-red group-hover:w-2 transition-all" />

            <div className="p-6 h-full flex flex-col justify-between">
              <div>
                <span className="inline-block bg-koni-red/10 text-koni-red font-bold text-xs px-3 py-1 mb-4 tracking-widest">
                  {cards[2].category}
                </span>
                <h3 className="text-xl font-black text-koni-dark uppercase mb-3 group-hover:text-koni-red transition-colors">
                  {cards[2].title}
                </h3>
                <p className="text-koni-dark/60">
                  {cards[2].description}
                </p>
              </div>
              <div className="flex items-center gap-2 text-koni-red font-bold mt-4 group-hover:gap-4 transition-all">
                <span className="text-sm">BACA</span>
                <ArrowRight className="h-4 w-4" />
              </div>
            </div>
          </div>

          {/* Small Cards */}
          {cards.slice(3).map((card, index) => (
            <div
              key={index}
              className="group relative overflow-hidden bg-koni-dark min-h-[200px] cursor-pointer"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-koni-red/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

              <div className="p-6 h-full flex flex-col justify-end relative z-10">
                <span className="inline-block text-koni-gold font-bold text-xs mb-2 tracking-widest">
                  {card.category}
                </span>
                <h3 className="text-lg font-black text-white uppercase group-hover:text-koni-gold transition-colors">
                  {card.title}
                </h3>
              </div>

              {/* Corner accent */}
              <div className="absolute top-0 right-0 w-16 h-16 border-t-4 border-r-4 border-koni-gold opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================
// DIGITAL CORE SECTION (System Gateway)
// ============================================
function DigitalCoreSection() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <section id="data" className="relative py-24 bg-koni-dark overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        {/* Circuit pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="circuit" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
                <path d="M 50 0 L 50 30 M 50 70 L 50 100 M 0 50 L 30 50 M 70 50 L 100 50"
                  stroke="#FFC72C" strokeWidth="0.5" fill="none" opacity="0.3" />
                <circle cx="50" cy="50" r="3" fill="#FFC72C" opacity="0.2" />
                <circle cx="50" cy="30" r="2" fill="#B8161C" opacity="0.3" />
                <circle cx="50" cy="70" r="2" fill="#B8161C" opacity="0.3" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#circuit)" />
          </svg>
        </div>

        {/* Glowing orbs */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-koni-red/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-koni-gold/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          {/* <div className="inline-flex items-center gap-2 bg-koni-gold/10 border border-koni-gold/30 px-4 py-2 mb-6">
            <Database className="h-4 w-4 text-koni-gold" />
            <span className="text-koni-gold font-bold text-sm tracking-widest uppercase">
              Sistem Digital
            </span>
          </div> */}
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white uppercase mb-4">
            PUSAT DATA
            <span className="block text-koni-red drop-shadow-[0_0_20px_rgba(184,22,28,0.3)]">
              PRESTASI DIGITAL
            </span>
          </h2>
          <p className="text-white/60 max-w-2xl mx-auto text-lg">
            Akses database atlet, pencapaian, dan statistik olahraga Kota Surabaya dalam satu platform terintegrasi.
          </p>
        </div>

        {/* Search Component */}
        <div className="max-w-3xl mx-auto mb-16">
          <div className="relative group">
            {/* Outer glow effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-koni-red via-koni-gold to-koni-red opacity-30 blur-lg group-hover:opacity-50 transition-opacity" />

            <div className="relative flex">
              <div className="relative flex-1">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-6 w-6 text-white/40" />
                <input
                  type="text"
                  placeholder="Cari atlet, cabor, atau prestasi..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-koni-dark/80 border-2 border-white/20 text-white placeholder-white/40 pl-14 pr-6 py-5 text-lg font-medium focus:outline-none focus:border-koni-gold transition-colors"
                />
              </div>
              <button className="bg-koni-red px-8 sm:px-12 font-bold text-white text-lg tracking-wider hover:bg-red-700 transition-all flex items-center gap-3 group/btn">
                <span className="hidden sm:inline">CARI</span>
                <Search className="h-6 w-6 group-hover/btn:scale-110 transition-transform" />
              </button>
            </div>
          </div>

          {/* Quick filters */}
          <div className="flex flex-wrap justify-center gap-3 mt-6">
            {["Semua", "Atlet", "Cabor", "Pelatih", "Prestasi"].map((filter) => (
              <button
                key={filter}
                className="px-4 py-2 text-sm font-bold text-white/60 hover:text-koni-gold border border-white/10 hover:border-koni-gold/50 transition-all"
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: Users,
              title: "DATABASE ATLET",
              description: "Profil lengkap seluruh atlet binaan KONI Surabaya",
              stat: "0",
              statLabel: "Atlet Terdaftar",
            },
            {
              icon: Trophy,
              title: "REKAM PRESTASI",
              description: "Dokumentasi pencapaian di tingkat nasional & internasional",
              stat: "0",
              statLabel: "Medali Tercatat",
            },
            {
              icon: Activity,
              title: "STATISTIK LIVE",
              description: "Monitoring performa dan perkembangan atlet real-time",
              stat: "0",
              statLabel: "Cabang Olahraga",
            },
          ].map((feature, index) => (
            <div
              key={index}
              className="group relative bg-white/5 border border-white/10 p-8 hover:border-koni-gold/50 transition-all hover:bg-white/10 cursor-pointer"
            >
              <div className="absolute top-0 left-0 w-1 h-0 bg-koni-gold group-hover:h-full transition-all duration-500" />

              <feature.icon className="h-10 w-10 text-koni-gold mb-6" />
              <h3 className="text-xl font-black text-white uppercase mb-3 group-hover:text-koni-gold transition-colors">
                {feature.title}
              </h3>
              <p className="text-white/60 mb-6">{feature.description}</p>

              <div className="flex items-end justify-between">
                <div>
                  <div className="text-3xl font-black text-koni-red">{feature.stat}</div>
                  <div className="text-xs text-white/40 tracking-wider">{feature.statLabel}</div>
                </div>
                <ArrowRight className="h-6 w-6 text-white/20 group-hover:text-koni-gold group-hover:translate-x-2 transition-all" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================
// PARA PATRIOT SECTION (Athlete Spotlight)
// ============================================
function AtletSection() {
  const athletes = [
    { name: "<<nama>>", cabor: "BADMINTON", achievement: "Emas PON XXI" },
    { name: "<<nama>>", cabor: "ATLETIK", achievement: "Rekor Nasional" },
    { name: "<<nama>>", cabor: "RENANG", achievement: "Juara Asia" },
    { name: "<<nama>>", cabor: "TAEKWONDO", achievement: "Medali SEA Games" },
    { name: "<<nama>>", cabor: "SEPAK BOLA", achievement: "Top Scorer Liga" },
    { name: "<<nama>>", cabor: "VOLI", achievement: "MVP Nasional" },
  ];

  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <section id="atlet" className="relative py-24 bg-koni-light overflow-hidden">
      {/* Background accent */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-koni-dark clip-diagonal-br opacity-5" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-12">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12">
          <div>
            <span className="text-koni-gold font-bold text-sm tracking-widest uppercase flex items-center gap-2">
              <Zap className="h-4 w-4" /> Atlet Unggulan
            </span>
            <h2 className="text-4xl sm:text-5xl font-black text-koni-dark uppercase mt-2">
              PARA <span className="text-koni-red">PATRIOT</span>
            </h2>
          </div>
          <Link
            href="#"
            className="inline-flex items-center gap-2 text-koni-dark font-bold hover:text-koni-red transition-colors group"
          >
            LIHAT SEMUA ATLET
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>

      {/* Horizontal Scroll Container */}
      <div className="relative">
        <div
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto pb-8 px-4 sm:px-6 lg:px-8 scrollbar-hide snap-x snap-mandatory"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {athletes.map((athlete, index) => (
            <div
              key={index}
              className="group flex-shrink-0 w-72 snap-start"
            >
              <div className="relative bg-koni-dark h-96 overflow-hidden cursor-pointer">
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-koni-dark via-koni-dark/50 to-transparent z-10" />

                {/* Hover accent */}
                <div className="absolute inset-0 bg-koni-red/20 opacity-0 group-hover:opacity-100 transition-opacity z-10" />

                {/* Placeholder for athlete image */}
                <div className="absolute inset-0 bg-gradient-to-br from-koni-dark to-gray-800 flex items-center justify-center">
                  <Users className="h-24 w-24 text-white/10" />
                </div>

                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 z-20 p-6">
                  <div className="text-koni-gold font-bold text-sm tracking-widest mb-2">
                    {athlete.cabor}
                  </div>
                  <h3 className="text-2xl font-black text-white uppercase group-hover:text-koni-gold transition-colors">
                    {athlete.name}
                  </h3>
                  <div className="flex items-center gap-2 text-white/60 text-sm mt-2">
                    <Trophy className="h-4 w-4 text-koni-gold" />
                    {athlete.achievement}
                  </div>
                </div>

                {/* Corner decoration */}
                <div className="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 border-koni-gold opacity-0 group-hover:opacity-100 transition-opacity z-20" />
              </div>
            </div>
          ))}
        </div>

        {/* Scroll fade indicators */}
        <div className="absolute left-0 top-0 bottom-8 w-20 bg-gradient-to-r from-koni-light to-transparent pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-8 w-20 bg-gradient-to-l from-koni-light to-transparent pointer-events-none" />
      </div>
    </section>
  );
}

// ============================================
// FOOTER
// ============================================
function Footer() {
  return (
    <footer className="bg-koni-dark border-t border-white/10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="relative h-28 w-28">
                <Image
                  src="/img/logo/koni-1.svg"
                  alt="KONI Surabaya"
                  fill
                  className="object-contain"
                />
              </div>
              <span className="text-white font-black text-xl tracking-tight">
                KONI <span className="text-koni-gold">SURABAYA</span>
              </span>
            </div>
            <p className="text-white/60 max-w-md mb-6">
              Komite Olahraga Nasional Indonesia Kota Surabaya. Mengembangkan dan memajukan prestasi olahraga demi kejayaan bangsa.
            </p>
            <div className="flex gap-4">
              {["facebook", "instagram", "twitter", "youtube"].map((social) => (
                <Link
                  key={social}
                  href="#"
                  className="w-10 h-10 bg-white/10 hover:bg-koni-red flex items-center justify-center transition-colors"
                >
                  <span className="text-white text-xs font-bold uppercase">
                    {social[0]}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold text-sm tracking-widest uppercase mb-6">
              TAUTAN CEPAT
            </h4>
            <ul className="space-y-3">
              {["Tentang Kami", "Cabang Olahraga", "Berita", "Galeri", "Kontak"].map(
                (link) => (
                  <li key={link}>
                    <Link
                      href="#"
                      className="text-white/60 hover:text-koni-gold transition-colors"
                    >
                      {link}
                    </Link>
                  </li>
                )
              )}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-bold text-sm tracking-widest uppercase mb-6">
              KONTAK
            </h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-white/60">
                <MapPin className="h-5 w-5 text-koni-gold flex-shrink-0 mt-0.5" />
                <span>jl. Bogen no.1</span>
              </li>
              <li className="flex items-center gap-3 text-white/60">
                <Phone className="h-5 w-5 text-koni-gold flex-shrink-0" />
                <span>(031) 123456789</span>
              </li>
              <li className="flex items-center gap-3 text-white/60">
                <Mail className="h-5 w-5 text-koni-gold flex-shrink-0" />
                <span>gmail koni</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-white/40 text-sm">
            © 2026 KONI Kota Surabaya. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm">
            <Link href="#" className="text-white/40 hover:text-white transition-colors">
              Kebijakan Privasi
            </Link>
            <Link href="#" className="text-white/40 hover:text-white transition-colors">
              Syarat & Ketentuan
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ============================================
// MAIN PAGE EXPORT
// ============================================
export default function Home() {
  return (
    <div className="min-h-screen bg-koni-dark">
      <Navbar />
      <HeroSection />
      <SorotanSection />
      <DigitalCoreSection />
      <AtletSection />
      <Footer />
    </div>
  );
}
