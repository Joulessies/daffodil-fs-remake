"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import "./home.scss";

export default function HomePage() {
  const [activeCategory, setActiveCategory] = useState(2);
  const categories = [
    "ALL BOUQUETS",
    "COMPOSITIONS",
    "ARRANGEMENTS",
    "FLOWERS",
  ];

  const toggleFavorite = (heartIcon) => {
    heartIcon.classList.toggle("favorited");
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveCategory((prev) => (prev + 1) % categories.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [categories.length]);

  return (
    <div>
      {/* Hero Section */}
      <motion.section
        className="hero"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
      >
        <motion.div
          className="circle big"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
        ></motion.div>
        <motion.div
          className="circle medium"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
        ></motion.div>
        <motion.div
          className="circle small"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
        ></motion.div>

        <div className="hero-content">
          <motion.h1
            className="hero-title"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
          >
            <span className="red-part">BOU</span>
            <span className="white-part">QUETS</span>
          </motion.h1>
          <motion.h1
            className="hero-title2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
          >
            <span className="red-part">FROM THE</span>
            <span className="red-part"> FLORIST</span>
          </motion.h1>
          <motion.img
            src="/images/home/home1.svg"
            alt="Romantic Bouquet"
            className="hero-image"
            initial={{ scale: 0.5, opacity: 0, rotate: -10 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            transition={{ duration: 1.2, delay: 0.7, ease: "easeOut" }}
          />
          <motion.h3
            className="vertical"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.2, ease: "easeOut" }}
          >
            <Link href="/shop">SELECT BOUQUET</Link>
          </motion.h3>
        </div>

        <motion.div
          className="hero-caption"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.4, ease: "easeOut" }}
        >
          <h2>ROMANTIC BOUQUET</h2>
          <p>
            Made of delicate roses complemented by tender white buds and <br />
            bright-red hypericum berries.
          </p>
        </motion.div>
      </motion.section>

      {/* New Arrivals Section */}
      <motion.section
        className="sell"
        initial={{ opacity: 0, y: 100 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 1, ease: "easeOut" }}
      >
        <motion.div
          className="sell-top"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
        >
          <h2 className="sell-h2">NEW ARRIVALS</h2>
          <p className="sell-text">VIEW ALL</p>
        </motion.div>

        <motion.div
          className="images"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          {/* Pic 1 */}
          <motion.div
            className="pic-item"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
          >
            <motion.img
              src="/images/home/home1.png"
              alt="Bouquet"
              className="pics draggable-pic"
              drag
              dragConstraints={{
                left: -100,
                right: 100,
                top: -100,
                bottom: 100,
              }}
              dragElastic={0.2}
              whileDrag={{ scale: 1.1, cursor: "grabbing" }}
              whileHover={{ scale: 1.02 }}
            />
            <div className="pic-caption-container">
              <p className="pic-caption">Classic Rose Bouquet</p>
              <div
                className="heart-icon"
                onClick={(e) => toggleFavorite(e.target)}
              >
                ♡
              </div>
            </div>
          </motion.div>

          {/* Pic 2 */}
          <motion.div
            className="pic-item"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          >
            <motion.img
              src="/images/home/home2.png"
              alt="Bouquet"
              className="pics draggable-pic"
              drag
              dragConstraints={{
                left: -100,
                right: 100,
                top: -100,
                bottom: 100,
              }}
              dragElastic={0.2}
              whileDrag={{ scale: 1.1, cursor: "grabbing" }}
              whileHover={{ scale: 1.02 }}
            />
            <div className="pic-caption-container">
              <p className="pic-caption">Elegant Lilies & Orchids</p>
              <div
                className="heart-icon"
                onClick={(e) => toggleFavorite(e.target)}
              >
                ♡
              </div>
            </div>
          </motion.div>

          {/* Pic 3 with circle */}
          <motion.div
            className="pic-item"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
          >
            <motion.img
              src="/images/home/home3.png"
              alt="Bouquet"
              className="pics draggable-pic"
              drag
              dragConstraints={{
                left: -100,
                right: 100,
                top: -100,
                bottom: 100,
              }}
              dragElastic={0.2}
              whileDrag={{ scale: 1.1, cursor: "grabbing" }}
              whileHover={{ scale: 1.02 }}
            />
            <div className="pic-caption-container">
              <p className="pic-caption">Mixed Seasonal Bouquet</p>
              <div
                className="heart-icon"
                onClick={(e) => toggleFavorite(e.target)}
              >
                ♡
              </div>
            </div>
          </motion.div>

          {/* Pic 4 */}
          <motion.div
            className="pic-item"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
          >
            <motion.img
              src="/images/home/home4.png"
              alt="Bouquet"
              className="pics draggable-pic"
              drag
              dragConstraints={{
                left: -100,
                right: 100,
                top: -100,
                bottom: 100,
              }}
              dragElastic={0.2}
              whileDrag={{ scale: 1.1, cursor: "grabbing" }}
              whileHover={{ scale: 1.02 }}
            />
            <div className="pic-caption-container">
              <p className="pic-caption">Rustic Sunflower Bouquet</p>
              <div
                className="heart-icon"
                onClick={(e) => toggleFavorite(e.target)}
              >
                ♡
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Categories */}
        <motion.div
          className="categories"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
        >
          <Link
            href="/shop"
            className={`category ${activeCategory === 0 ? "active" : ""}`}
          >
            <motion.span
              animate={{
                color: activeCategory === 0 ? "#b30b2f" : "#e8e8e8",
                opacity: activeCategory === 0 ? 1 : 0.7,
              }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            >
              ALL BOUQUETS
            </motion.span>
          </Link>
          <span className="separator">—</span>
          <Link
            href="/shop"
            className={`category ${activeCategory === 1 ? "active" : ""}`}
          >
            <motion.span
              animate={{
                color: activeCategory === 1 ? "#b30b2f" : "#e8e8e8",
                opacity: activeCategory === 1 ? 1 : 0.7,
              }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            >
              COMPOSITIONS
            </motion.span>
          </Link>
          <span className="separator">—</span>
          <Link
            href="/shop"
            className={`category ${activeCategory === 2 ? "active" : ""}`}
          >
            <motion.span
              animate={{
                color: activeCategory === 2 ? "#b30b2f" : "#e8e8e8",
                opacity: activeCategory === 2 ? 1 : 0.7,
              }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            >
              ARRANGEMENTS
            </motion.span>
          </Link>
          <span className="separator">—</span>
          <Link
            href="/shop"
            className={`category ${activeCategory === 3 ? "active" : ""}`}
          >
            <motion.span
              animate={{
                color: activeCategory === 3 ? "#b30b2f" : "#e8e8e8",
                opacity: activeCategory === 3 ? 1 : 0.7,
              }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            >
              FLOWERS
            </motion.span>
          </Link>
          <div className="category-line"></div>
        </motion.div>
      </motion.section>

      {/* Instructions Section */}
      <motion.section
        className="instructions"
        initial={{ opacity: 0, y: 100 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 1, ease: "easeOut" }}
      >
        <img src="/images/home/home8.svg" alt="Rose" className="rose-pic" />

        <div className="rose-pic2-container">
          <p className="i-p">
            Want to find a gift for a loved one? Especially for you, <br />
            we have created a catalog with <br />
            arrangements starting from 2500 PHP
          </p>

          <div className="rose-text-wrapper">
            <img
              src="/images/home/home3.svg"
              alt="Rose Detail"
              className="rose-pic2"
            />
            <h3 className="i-h3">INSTRUCTIONS HERE</h3>
            <div className="behind-circle"></div>
          </div>
        </div>
      </motion.section>

      {/* Novelties Section */}
      <motion.section
        className="novelties"
        initial={{ opacity: 0, y: 100 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 1, ease: "easeOut" }}
      >
        <div className="novelties-header">
          <h2 className="n-h2">Promotions</h2>
          <div className="catalog-link">
            <span className="catalog-text">VIEW ALL</span>
          </div>
        </div>

        <div className="novelties-content">
          <div className="novelty-item">
            <img
              src="/images/home/home4.svg"
              alt="New Bouquet"
              className="n-pic"
            />
          </div>

          <div className="novelty-text">
            <p className="n-p">
              Spring is an awakening of feelings <br />
              and emotions. <br />
              Choose a novelty to give spring <br />
              mood and create a festive atmosphere.
            </p>
          </div>

          <div className="novelty-item circle-container">
            <img
              src="/images/home/home5.svg"
              alt="New Bouquet"
              className="n-pic2"
            />
            <div className="drag-circle">Drag</div>
          </div>

          <div className="novelty-item">
            <img
              src="/images/home/home6.svg"
              alt="New Bouquet"
              className="n-pic2"
            />
          </div>
        </div>
      </motion.section>

      {/* Last Section */}
      <motion.section
        className="last"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="l-h2">
          {["We", "don't", "just", "sell", "bouquets", "—"].map(
            (word, index) => (
              <motion.span
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{
                  duration: 0.5,
                  delay: 0.2 + index * 0.1,
                  ease: "easeOut",
                }}
                style={{ display: "inline-block", marginRight: "0.3em" }}
              >
                {word}
              </motion.span>
            )
          )}
          <br />
          {["we", "help", "create", "bright,", "unforgettable", "moments!"].map(
            (word, index) => (
              <motion.span
                key={index + 6}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{
                  duration: 0.5,
                  delay: 0.8 + index * 0.1,
                  ease: "easeOut",
                }}
                style={{ display: "inline-block", marginRight: "0.3em" }}
              >
                {word}
              </motion.span>
            )
          )}
        </div>

        <motion.img
          src="/images/home/home7.svg"
          alt="Bride"
          className="bride"
          initial={{ opacity: 0, scale: 0.8, y: 30 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
        />

        <div className="l-h3">
          {[
            "Round-the-clock",
            "delivery",
            "of",
            "fresh",
            "flowers",
            "and",
            "bouquets",
            "for",
            "any",
            "occasion",
          ].map((word, index) => (
            <motion.span
              key={index}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{
                duration: 0.4,
                delay: 1.8 + index * 0.08,
                ease: "easeOut",
              }}
              style={{ display: "inline-block", marginRight: "0.3em" }}
            >
              {word}
            </motion.span>
          ))}
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-logo">
            <img
              src="/images/logo.svg"
              alt="Daffodil"
              className="footer-logo-img"
            />
            <span className="footer-brand">Daffodil</span>
          </div>

          <div className="footer-links">
            <div className="footer-section">
              <h4>Shop</h4>
              <ul>
                <li>
                  <Link href="/shop">All Products</Link>
                </li>
                <li>
                  <Link href="/shop?category=bouquets">Bouquets</Link>
                </li>
                <li>
                  <Link href="/shop?category=wedding">Wedding Flowers</Link>
                </li>
                <li>
                  <Link href="/shop?category=gifts">Gift Collections</Link>
                </li>
              </ul>
            </div>

            <div className="footer-section">
              <h4>Company</h4>
              <ul>
                <li>
                  <Link href="/about">About Us</Link>
                </li>
                <li>
                  <Link href="/contact">Contact</Link>
                </li>
                <li>
                  <Link href="/customize">Custom Orders</Link>
                </li>
              </ul>
            </div>

            <div className="footer-section">
              <h4>Account</h4>
              <ul>
                <li>
                  <Link href="/profile">My Profile</Link>
                </li>
                <li>
                  <Link href="/profile/orders">Order History</Link>
                </li>
                <li>
                  <Link href="/wishlist">Wishlist</Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; 2024 Daffodil. All rights reserved.</p>
          <p>Crafting floral poetry since 2024</p>
        </div>
      </footer>
    </div>
  );
}
