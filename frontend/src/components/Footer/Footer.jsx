import React from 'react'
import "./Footer.css"
import "../../App.css"

const Footer = () => {
  return (
    <footer className="footer">
        <div className="footer__container container">
            <a href="#top" className="footer__cta">
            <span className="footer__cta-icon">↑</span>
            Back to top
            </a>
        </div>
    </footer>
  )
}

export default Footer