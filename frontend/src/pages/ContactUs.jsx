import React, { useState } from 'react';
import Navbar from '../components/navbar/Navbar';
import Footer from '../components/footer/Footer';
import './ContactUs.css';

function ContactUs() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would typically send the form data to a backend
    alert('Thank you for your message! We will get back to you soon.');
    setFormData({
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: ''
    });
  };

  return (
    <div className="contact-page">
      <Navbar />
      
      {/* Hero Section */}
      <section className="contact-hero">
        <div className="hero-content">
          <h1>Contact Catherine's Oasis</h1>
          <p className="hero-subtitle">We're here to help. Reach out and let's create unforgettable moments together.</p>
        </div>
      </section>

      {/* Main Content */}
      <section className="contact-content">
        <div className="container">
          <div className="contact-wrapper">
            
            {/* Contact Information */}
            <div className="contact-info-section">
              <h2>Get in Touch</h2>
              
              <div className="contact-block">
                <h3>📍 Address</h3>
                <p>
                  Catherine's Oasis<br />
                  Resort & Entertainment Complex<br />
                  City, Country<br />
                  Postal Code
                </p>
              </div>

              <div className="contact-block">
                <h3>📞 Phone Numbers</h3>
                <p>
                  <strong>Main Office:</strong> +1 (555) 123-4567<br />
                  <strong>Reservations:</strong> +1 (555) 123-4568<br />
                  <strong>Customer Support:</strong> +1 (555) 123-4569
                </p>
              </div>

              <div className="contact-block">
                <h3>📧 Email</h3>
                <p>
                  <strong>General Inquiries:</strong><br />
                  <a href="mailto:info@catherinesoasis.com">info@catherinesoasis.com</a><br />
                  <strong>Reservations:</strong><br />
                  <a href="mailto:bookings@catherinesoasis.com">bookings@catherinesoasis.com</a><br />
                  <strong>Support:</strong><br />
                  <a href="mailto:support@catherinesoasis.com">support@catherinesoasis.com</a>
                </p>
              </div>

              <div className="contact-block">
                <h3>🕐 Business Hours</h3>
                <p>
                  <strong>Monday - Friday:</strong> 8:00 AM - 6:00 PM<br />
                  <strong>Saturday:</strong> 9:00 AM - 5:00 PM<br />
                  <strong>Sunday:</strong> 10:00 AM - 4:00 PM<br />
                  <strong>Emergencies:</strong> Available 24/7
                </p>
              </div>

              <div className="contact-block">
                <h3>🌐 Follow Us On Social Media</h3>
                <div className="social-links">
                  <a href="#facebook" className="social-link">Facebook</a>
                  <a href="#instagram" className="social-link">Instagram</a>
                  <a href="#twitter" className="social-link">Twitter</a>
                  <a href="#youtube" className="social-link">YouTube</a>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="contact-form-section">
              <h2>Send Us a Message</h2>
              <form className="contact-form" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Full Name *</label>
                  <input 
                    type="text" 
                    name="name"
                    placeholder="Your name" 
                    value={formData.name}
                    onChange={handleChange}
                    required 
                  />
                </div>

                <div className="form-group">
                  <label>Email Address *</label>
                  <input 
                    type="email" 
                    name="email"
                    placeholder="your@email.com" 
                    value={formData.email}
                    onChange={handleChange}
                    required 
                  />
                </div>

                <div className="form-group">
                  <label>Phone Number</label>
                  <input 
                    type="tel" 
                    name="phone"
                    placeholder="+1 (555) 000-0000"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label>Subject *</label>
                  <input 
                    type="text" 
                    name="subject"
                    placeholder="How can we help?" 
                    value={formData.subject}
                    onChange={handleChange}
                    required 
                  />
                </div>

                <div className="form-group">
                  <label>Message *</label>
                  <textarea 
                    name="message"
                    placeholder="Your message here..." 
                    rows="5"
                    value={formData.message}
                    onChange={handleChange}
                    required
                  ></textarea>
                </div>

                <button type="submit" className="submit-btn">Send Message</button>
              </form>
            </div>

          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default ContactUs;
