// src/pages/AboutUs.jsx
// ============================================
// ABOUT US PAGE - Consistent with Home page design
// ============================================

import React from 'react';
// Remove Link import since it's not used
import Navbar from '../components/navbar/Navbar';
import Footer from '../components/footer/Footer';
import './AboutUs.css';

function AboutUs() {
  return (
    <div className="about-page">
      <Navbar />
      
      {/* Hero Section */}
      <section className="about-hero">
        <div className="container">
          <h1>About Catherine's Oasis</h1>
          <p>Discover our story, mission, and commitment to excellence</p>
        </div>
      </section>

      {/* Main Content */}
      <section className="about-content">
        <div className="container">
          
          {/* Our Story */}
          <div className="about-block">
            <h2>Our Story</h2>
            <p>
              Catherine's Oasis was founded with a simple mission: to provide a serene escape from 
              the hustle and bustle of everyday life. What started as a vision has blossomed into 
              one of the most sought-after resort destinations, known for its exceptional service, 
              stunning facilities, and warm hospitality.
            </p>
            <p>
              Over the years, we have hosted thousands of happy guests from around the world, 
              creating unforgettable memories and lasting impressions. Our commitment to excellence 
              has earned us recognition as a premier destination for both leisure and special events.
            </p>
          </div>

          {/* Our Mission */}
          <div className="about-block">
            <h2>Our Mission</h2>
            <p>
              We are committed to creating unforgettable experiences for every guest. Whether you're 
              seeking relaxation, adventure, or celebrating a special milestone, our team is dedicated 
              to exceeding your expectations and making your stay truly memorable.
            </p>
            <p>
              Our mission extends beyond providing accommodation; we strive to be your trusted partner 
              in creating moments that matter, celebrating life's milestones, and building lasting memories.
            </p>
          </div>

          {/* Our Values */}
          <div className="about-block">
            <h2>Our Core Values</h2>
            <div className="values-grid">
              <div className="value-card">
                <h3>Excellence</h3>
                <p>We strive for excellence in every aspect of service and facility management</p>
              </div>
              <div className="value-card">
                <h3>Hospitality</h3>
                <p>Warm, genuine care and attention to detail for all our guests</p>
              </div>
              <div className="value-card">
                <h3>Integrity</h3>
                <p>Honest and transparent in all our dealings and operations</p>
              </div>
              <div className="value-card">
                <h3>Sustainability</h3>
                <p>Committed to environmental responsibility and community welfare</p>
              </div>
              <div className="value-card">
                <h3>Innovation</h3>
                <p>Continuously improving our facilities, services, and guest experiences</p>
              </div>
              <div className="value-card">
                <h3>Community</h3>
                <p>Building strong relationships with our staff, guests, and local communities</p>
              </div>
            </div>
          </div>

          {/* What Sets Us Apart */}
          <div className="about-block">
            <h2>What Sets Us Apart</h2>
            <div className="features-list">
              <p>✓ Two unique oasis venues with distinct charm and character</p>
              <p>✓ Customizable packages for all types of occasions and group sizes</p>
              <p>✓ Professional and attentive staff available 24/7</p>
              <p>✓ Modern facilities combined with natural beauty and serene ambiance</p>
              <p>✓ Flexible booking options and competitive pricing</p>
              <p>✓ Eco-friendly practices and sustainable operations</p>
            </div>
          </div>

          {/* Our Team */}
          <div className="about-block">
            <h2>Our Dedicated Team</h2>
            <p>
              Behind every great experience at Catherine's Oasis is our passionate and dedicated team. 
              Our staff members are carefully selected and trained to ensure that every guest receives 
              the highest level of service and hospitality. From our management team to our support staff, 
              everyone is committed to making your visit exceptional.
            </p>
            <p>
              We believe that our people are our greatest asset. Their expertise, professionalism, and 
              genuine care create an environment where guests feel valued, welcomed, and truly at home.
            </p>
          </div>

        </div>
      </section>

      <Footer />
    </div>
  );
}

export default AboutUs;