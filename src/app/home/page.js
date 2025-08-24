import React from "react";
import "./home.scss";

export default function HomePage() {
  return (
    <div>
      <h1 className="home-title">Welcome to Daffodil</h1>
      <p className="home-description">
        Daffodil is a platform for creating and sharing your ideas.
      </p>
      <button className="home-button">Get Started</button>
    </div>
  );
}
