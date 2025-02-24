
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const Privacy = () => {
  return (
    <div className="min-h-screen bg-soft-ivory px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-deep-charcoal hover:text-muted-sage transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to home</span>
        </Link>
        
        <h1 className="text-4xl font-bold text-deep-charcoal mb-8">Privacy Policy</h1>
        
        <div className="prose prose-lg max-w-none text-deep-charcoal/80">
          <p className="lead">
            Gentlee values your privacy. This policy explains how we collect, use, store, and protect your information.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">1. INFORMATION WE COLLECT</h2>
          <ul className="list-disc pl-6">
            <li>Personal Data: Name, email, and login credentials.</li>
            <li>Chat Data: Conversations with Gentlee (processed for theme recognition, reflection, and enhancement of the user experience).</li>
            <li>Device Data: IP address, device type, and usage analytics.</li>
            <li>Authentication Data: If you log in via Google, Apple, Meta, or X, we may collect associated authentication data.</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">2. HOW WE USE YOUR DATA</h2>
          <ul className="list-disc pl-6">
            <li>To provide and improve Gentlee's functionality.</li>
            <li>To personalize responses and enhance user experience.</li>
            <li>For security, analytics, and service maintenance.</li>
            <li>To comply with legal obligations.</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">3. DATA STORAGE & SECURITY</h2>
          <ul className="list-disc pl-6">
            <li>Your data is stored on secure, encrypted servers.</li>
            <li>We do not sell your data to third parties.</li>
            <li>Conversations with Gentlee are private and not accessible to other users.</li>
            <li>If legally required, we may disclose data to comply with authorities.</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">4. THIRD-PARTY SERVICES</h2>
          <p>
            Gentlee may integrate with third-party authentication providers (Google, Apple, Meta, X). These services are governed by their respective privacy policies.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">5. USER RIGHTS & DATA ACCESS</h2>
          <ul className="list-disc pl-6">
            <li>You can request to access, modify, or delete your personal data.</li>
            <li>You may opt out of data processing for non-essential features.</li>
            <li>You can deactivate your account at any time.</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">6. COOKIES & TRACKING</h2>
          <ul className="list-disc pl-6">
            <li>We use cookies to improve user experience.</li>
            <li>You can control cookie settings in your browser.</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">7. DATA RETENTION</h2>
          <ul className="list-disc pl-6">
            <li>User data is stored only as long as necessary for providing Gentlee's services.</li>
            <li>Chat data may be retained for personal reflection and theme analysis unless deleted by the user.</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">8. CHILDREN'S PRIVACY</h2>
          <p>
            Gentlee is not intended for children under 13. If we discover children's data was collected, it will be deleted.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">9. UPDATES TO THIS POLICY</h2>
          <p>
            We may modify this Privacy Policy to reflect new legal or security requirements. Users will be notified of major updates.
            For privacy inquiries, contact hellogentleeme@gmail.com
          </p>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
