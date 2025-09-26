"use client";

import React, { useEffect, useState } from "react";
import NavigationBar from "@/components/navigationbar";
import "./about.scss";

// Animated Counter Component
const AnimatedCounter = ({ end, duration = 2000, suffix = "" }) => {
  const [count, setCount] = useState(0);
  const [countersVisible, setCountersVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const statsSection = document.querySelector(".stats-section");
      if (statsSection) {
        const rect = statsSection.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          setCountersVisible(true);
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!countersVisible) return;

    let startTime = null;
    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);

      setCount(Math.floor(progress * end));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [countersVisible, end, duration]);

  return (
    <span>
      {count}
      {suffix}
    </span>
  );
};

export default function AboutPage() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="about-container">
      <NavigationBar />

      {/* Enhanced Hero Section */}
      <section className={`hero-section ${isVisible ? "visible" : ""}`}>
        <div className="hero-background">
          <div className="floating-petal petal-1">🌸</div>
          <div className="floating-petal petal-2">🌺</div>
          <div className="floating-petal petal-3">🌷</div>
        </div>
        <div className="hero-content">
          <div className="hero-heading">
            <h1 className="hero-title">
              <span className="title-line-1">Crafting</span>
              <span className="title-line-2">Floral Poetry</span>
              <span className="title-line-3">Since 2025</span>
            </h1>
            <p className="hero-subtitle">
              Where every bloom tells a story and every arrangement speaks the
              language of love
            </p>
          </div>
          <div className="hero-cta">
            <a href="#our-story" className="scroll-down">
              <span>Discover Our Story</span>
              <div className="arrow-down">↓</div>
            </a>
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section id="our-story" className="story-section">
        <div className="container">
          <div className="story-content">
            <div className="story-image">
              <div className="image-frame">
                <div className="image-placeholder">
                  <span className="placeholder-icon">🌻</span>
                </div>
              </div>
              <div className="accent-circle"></div>
            </div>
            <div className="story-text">
              <h2 className="section-title">Our Story</h2>
              <p className="lead-text">
                Daffodil was born from a simple belief: flowers have the power
                to transform moments into memories.
              </p>
              <p>
                This project began as a school assignment for our Web Systems
                course, where we were challenged to create a comprehensive
                e-commerce platform. What started as an academic exercise has
                evolved into a fully-featured floral marketplace, showcasing
                modern web development techniques and technologies.
              </p>
              <p>
                Our team has remade and enhanced this system with better
                architecture, improved APIs, and a more intuitive user
                experience. This project demonstrates our commitment to learning
                cutting-edge web development while creating something beautiful
                and functional.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Philosophy Section */}
      <section className="philosophy-section">
        <div className="container">
          <div className="philosophy-content">
            <h2 className="philosophy-title">
              More Than Flowers — We Create Emotions
            </h2>
            <div className="philosophy-grid">
              <div className="philosophy-card">
                <div className="card-icon">🎨</div>
                <h3>Artistry</h3>
                <p>
                  Each arrangement is a unique masterpiece, designed with an
                  artist's eye and a craftsman's precision. We blend colors,
                  textures, and forms to create visual poetry.
                </p>
              </div>
              <div className="philosophy-card">
                <div className="card-icon">💚</div>
                <h3>Sustainability</h3>
                <p>
                  We partner with local growers and use eco-friendly practices.
                  Every stem is sourced responsibly, ensuring beauty that
                  doesn't cost the earth.
                </p>
              </div>
              <div className="philosophy-card">
                <div className="card-icon">✨</div>
                <h3>Excellence</h3>
                <p>
                  From water temperature to stem cutting angles, we obsess over
                  details others overlook. This dedication ensures your flowers
                  stay fresh longer.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-number">
                <AnimatedCounter end={15000} suffix="+" />
              </div>
              <div className="stat-label">Happy Customers</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">
                <AnimatedCounter end={98} suffix="%" />
              </div>
              <div className="stat-label">Customer Satisfaction</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">
                <AnimatedCounter end={6} />
              </div>
              <div className="stat-label">Years of Excellence</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">
                <AnimatedCounter end={250} suffix="+" />
              </div>
              <div className="stat-label">Unique Designs</div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="team-section">
        <div className="container">
          <h2 className="section-title">Meet Our Passionate Team</h2>
          <p className="section-subtitle">
            The creative minds and caring hearts behind every Daffodil
            arrangement
          </p>
          <div className="team-grid">
            <div className="team-member">
              <div className="member-image">
                <div className="image-placeholder">
                  <span className="placeholder-icon">👨‍💼</span>
                </div>
              </div>
              <h3>Shawn Agres</h3>
              <p className="member-role">Admin Frontend Developer</p>
              <p className="member-bio">
                Shawn develops and maintains our administrative systems,
                ensuring smooth backend operations and management interfaces.
              </p>
            </div>
            <div className="team-member">
              <div className="member-image">
                <div className="image-placeholder">
                  <span className="placeholder-icon">👩‍🎨</span>
                </div>
              </div>
              <h3>Kimberly Bombita</h3>
              <p className="member-role">Home Page Developer & Assets</p>
              <p className="member-bio">
                Kimberly crafts our beautiful home page experience and manages
                digital assets, bringing our floral vision to life online.
              </p>
            </div>
            <div className="team-member">
              <div className="member-image">
                <div className="image-placeholder">
                  <span className="placeholder-icon">👨‍💻</span>
                </div>
              </div>
              <h3>Julius San Jose</h3>
              <p className="member-role">Owner & Website Operations</p>
              <p className="member-bio">
                Julius is the owner of Daffodil and operates the entire website,
                overseeing all aspects of our digital presence and business
                operations.
              </p>
            </div>
            <div className="team-member">
              <div className="member-image">
                <div className="image-placeholder">
                  <span className="placeholder-icon">👨‍🌾</span>
                </div>
              </div>
              <h3>Sean Rikcel Catapang</h3>
              <p className="member-role">Home Page Developer & Assets</p>
              <p className="member-bio">
                Sean Rikcel focuses on home page development and asset
                management, ensuring our website showcases our floral offerings
                beautifully.
              </p>
            </div>
            <div className="team-member">
              <div className="member-image">
                <div className="image-placeholder">
                  <span className="placeholder-icon">👨‍🚚</span>
                </div>
              </div>
              <h3>Lee Andre Sumayod</h3>
              <p className="member-role">Home Page Developer & Assets</p>
              <p className="member-bio">
                Lee Andre develops our home page functionality and manages
                visual assets, creating an engaging user experience for our
                customers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section">
        <div className="container">
          <h2 className="section-title">What Our Customers Say</h2>
          <div className="testimonials-grid">
            <div className="testimonial-card">
              <div className="quote-mark">"</div>
              <p className="testimonial-text">
                Daffodil transformed our wedding into a fairytale. Every
                arrangement was beyond our dreams. They truly understood our
                vision and brought it to life!
              </p>
              <div className="testimonial-author">
                <strong>Sarah & Michael</strong>
                <span>Wedding Clients</span>
              </div>
            </div>
            <div className="testimonial-card">
              <div className="quote-mark">"</div>
              <p className="testimonial-text">
                I've been ordering from Daffodil for 3 years. The quality and
                creativity never cease to amaze me. They're my go-to for every
                special occasion.
              </p>
              <div className="testimonial-author">
                <strong>Jennifer Liu</strong>
                <span>Regular Customer</span>
              </div>
            </div>
            <div className="testimonial-card">
              <div className="quote-mark">"</div>
              <p className="testimonial-text">
                The corporate arrangements for our office are always stunning.
                Daffodil understands our brand and delivers consistency with
                creativity.
              </p>
              <div className="testimonial-author">
                <strong>Robert Thompson</strong>
                <span>Corporate Client</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Values Section */}
      <section className="values-section">
        <div className="container">
          <div className="values-content">
            <h2 className="section-title">Our Core Values</h2>
            <div className="values-showcase">
              <div className="value-item">
                <div className="value-icon">
                  <img src="/images/home/home3.svg" alt="Love" />
                </div>
                <h3>Love</h3>
                <p>In every petal we place</p>
              </div>
              <div className="value-item">
                <div className="value-icon">✨</div>
                <h3>Beauty</h3>
                <p>In every design we create</p>
              </div>
              <div className="value-item">
                <div className="value-icon">🌿</div>
                <h3>Freshness</h3>
                <p>In every bloom we deliver</p>
              </div>
              <div className="value-item">
                <div className="value-icon">🎨</div>
                <h3>Creativity</h3>
                <p>In every arrangement we craft</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Experience the Daffodil Difference?</h2>
            <p>
              Let us help you express your emotions through the timeless beauty
              of flowers
            </p>
            <div className="cta-buttons">
              <a href="/shop" className="btn btn-primary">
                Explore Our Collection
              </a>
              <a href="/contact" className="btn btn-secondary">
                Get in Touch
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
