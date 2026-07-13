// frontend/src/pages/Home.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay, EffectFade } from "swiper/modules";
import Navbar from "../components/navbar/Navbar";
import Footer from "../components/footer/Footer";
import ReviewsSection from "../components/home/ReviewsSection";
import { BOOKING_RULES } from "../constants/packages";
import { getGalleryImages } from "../services/admin/gallery";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-fade";
import "./Home.css";

const heroImages = [
  {
    url: '/images/hero/welcome.jpg',
    title: "Welcome to Catherine's Oasis",
    subtitle: 'Your premier destination for relaxation and unforgettable memories',
    buttonText: 'Explore Now',
    buttonLink: '/oasis-1'
  },
  {
    url: '/images/hero/oasis1.jpg',
    title: 'Oasis 1',
    subtitle: 'Perfect for intimate gatherings and family outings',
    buttonText: 'Explore Now',
    buttonLink: '/oasis-1'
  },
  {
    url: '/images/hero/oasis2.jpg',
    title: 'Oasis 2',
    subtitle: 'Spacious grounds ideal for larger events and celebrations',
    buttonText: 'Explore Now',
    buttonLink: '/oasis-2'
  }
];

const oasisCards = [
  {
    id: 1,
    name: "Oasis 1",
    image: "/images/oasis1-card.jpg",
    description: "Cozy retreat designed for smaller groups seeking a peaceful escape. Perfect for family reunions, intimate celebrations, and romantic getaways.",
    features: ["🌊 Private Pool", "👥 Up to 20 Guests", "🍽️ Catering", "🎉 Events"],
    link: "/oasis-1",
  },
  {
    id: 2,
    name: "Oasis 2",
    image: "/images/oasis2-card.jpg",
    description: "Expansive gardens and spacious facilities perfect for large gatherings. Ideal for grand celebrations, corporate events, and weddings.",
    features: ["🏛️ Grand Hall", "👥 Up to 100 Guests", "🍽️ Full Catering", "🎪 Event Planning"],
    link: "/oasis-2",
  },
];

const whyChooseUs = [
  { title: "Swimming Pool",    description: "With bubble jacuzzi and fountain" },
  { title: "Cozy Cottages",   description: "Gazebo and kubo cottages available" },
  { title: "Free WiFi",       description: "Stay connected throughout your visit" },
  { title: "Portable Griller",description: "Perfect for family cookouts" },
  { title: "Karaoke",         description: "Add-on for fun entertainment" },
  { title: "Stove Rental",    description: "Cook your favorite meals" },
  { title: "Smart TV",        description: "With Netflix on selected packages" },
  { title: "Cooler/Fridge",   description: "Keep your drinks cold" },
];

const faqs = [
  {
    id: 1,
    question: "What time is check-in and check-out?",
    answer: "Day session: 8AM - 5PM | Night session: 6PM - 6AM | 22-hour session: Flexible based on your arrival time.",
  },
  {
    id: 2,
    question: "How do I book and pay?",
    answer: "You can book online through our website. A downpayment is required to secure your reservation. Balance can be paid upon arrival.",
  },
  {
    id: 3,
    question: "Can I bring outside food?",
    answer: "Yes, you can bring outside food. We also have stove rental available if you want to cook.",
  },
  {
    id: 4,
    question: "Is there a corkage fee?",
    answer: "Please contact us for corkage fees and special arrangements for events.",
  },
];

// Static fallback in case the API is empty
const FALLBACK_GALLERY = [
  { id: 1, url: "/images/gallery/pool.jpg",         title: "Swimming Pool" },
  { id: 2, url: "/images/gallery/cottage.jpg",      title: "Cozy Cottages" },
  { id: 3, url: "/images/gallery/family-room.jpg",  title: "Family Room" },
  { id: 4, url: "/images/gallery/events.jpg",       title: "Event Spaces" },
  { id: 5, url: "/images/gallery/garden.jpg",       title: "Lush Gardens" },
  { id: 6, url: "/images/gallery/superior-room.jpg",title: "Superior Room" },
];

function Home() {
  const [openFaq, setOpenFaq] = useState(null);

  // ── Gallery from API ──────────────────────────
  const [galleryImages, setGalleryImages] = useState([]);
  const [galleryLoading, setGalleryLoading] = useState(true);

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const images = await getGalleryImages();
        // API returns array of { _id, url, title, ... }; take first 6 active ones
        const active = (images || []).filter(img => img.isActive !== false);
        setGalleryImages(active.length > 0 ? active.slice(0, 6) : FALLBACK_GALLERY);
      } catch (err) {
        console.error("Failed to load gallery:", err);
        setGalleryImages(FALLBACK_GALLERY);
      } finally {
        setGalleryLoading(false);
      }
    };
    fetchGallery();
  }, []);

  const toggleFaq = (id) => setOpenFaq(openFaq === id ? null : id);

  return (
    <div className="home">
      <Navbar />

      {/* ===== HERO CAROUSEL ===== */}
      <section className="hero-carousel">
        <Swiper
          modules={[Navigation, Pagination, Autoplay, EffectFade]}
          effect="fade"
          navigation={true}
          pagination={{ clickable: true }}
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          loop={true}
          speed={1000}
          className="hero-swiper"
        >
          {heroImages.map((image, index) => (
            <SwiperSlide key={index}>
              <div className="hero-slide">
                <img
                  src={image.url}
                  alt={image.title}
                  className="hero-image"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = `https://via.placeholder.com/1920x1080?text=${encodeURIComponent(image.title)}`;
                  }}
                />
                <div className="hero-overlay" />
                <div className="hero-content">
                  <h1 className="hero-title">{image.title}</h1>
                  <p className="hero-subtitle">{image.subtitle}</p>
                  <a href={image.buttonLink} className="hero-btn">{image.buttonText}</a>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </section>

      {/* ===== OASIS CARDS ===== */}
      <section className="oasis-cards-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Choose Your Oasis</h2>
          </div>
          <div className="oasis-cards-grid">
            {oasisCards.map((oasis) => (
              <div key={oasis.id} className="oasis-card">
                <div className="oasis-card-image">
                  <img src={oasis.image} alt={oasis.name} />
                  <div className="oasis-card-badge">{oasis.name}</div>
                </div>
                <div className="oasis-card-content">
                  <h3>{oasis.name}</h3>
                  <p>{oasis.description}</p>
                  <div className="oasis-features">
                    {oasis.features.map((feature, idx) => (
                      <span key={idx} className="feature-tag">{feature}</span>
                    ))}
                  </div>
                  <Link to={oasis.link} className="oasis-card-btn">Explore {oasis.name} →</Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== GALLERY PREVIEW — live from API ===== */}
      <section className="gallery-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Photo Gallery</h2>
          </div>

          {galleryLoading ? (
            <div className="gallery-loading">
              <div className="gallery-spinner" />
            </div>
          ) : (
            <div className="gallery-grid">
              {galleryImages.map((image, idx) => (
                <div key={image._id || image.id || idx} className="gallery-item">
                  <img
                    src={image.url || image.src}
                    alt={image.title || ''}
                    onError={(e) => { e.target.onerror = null; e.target.src = '/images/placeholder.jpg'; }}
                  />
                  <div className="gallery-overlay">
                    <span>{image.title}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="text-center">
            <Link to="/gallery" className="view-all-btn">View Full Gallery →</Link>
          </div>
        </div>
      </section>

      {/* ===== WHY CHOOSE US ===== */}
      <section className="why-choose-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Why Choose Catherine's Oasis?</h2>
          </div>
          <div className="features-grid">
            {whyChooseUs.map((feature, index) => (
              <div key={index} className="feature-card">
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== DYNAMIC REVIEWS ===== */}
      <ReviewsSection />

      {/* ===== FAQ ===== */}
      <section className="faq-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Frequently Asked Questions</h2>
          </div>
          <div className="faq-grid">
            {faqs.map((faq) => (
              <div key={faq.id} className="faq-item">
                <button
                  className={`faq-question ${openFaq === faq.id ? "active" : ""}`}
                  onClick={() => toggleFaq(faq.id)}
                >
                  <span>{faq.question}</span>
                  <i className={`fas fa-chevron-${openFaq === faq.id ? "up" : "down"}`} />
                </button>
                {openFaq === faq.id && (
                  <div className="faq-answer"><p>{faq.answer}</p></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== BOOKING RULES ===== */}
      <section className="rules-section">
        <div className="container">
          <h2 className="rules-title">Booking Information</h2>
          <div className="rules-grid">
            {BOOKING_RULES.map((rule, index) => (
              <div key={index} className="rule-card">
                <div className="rule-icon">{rule.icon}</div>
                <h3 className="rule-title">{rule.title}</h3>
                <p className="rule-desc">{rule.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="cta-section">
        <div className="container">
          <h2 className="cta-title">Ready to Book Your Stay?</h2>
          <p className="cta-text">Choose your preferred oasis and package, then complete your reservation</p>
          <Link to="/oasis-1" className="cta-btn">View Packages</Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default Home;