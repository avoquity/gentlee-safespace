
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const Terms = () => {
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
        
        <h1 className="text-4xl font-bold text-deep-charcoal mb-8">Terms & Conditions</h1>
        
        <div className="prose prose-lg max-w-none text-deep-charcoal/80">
          <p className="lead">
            Welcome to Gentlee, a digital platform designed to offer a gentle and reflective conversational space. By accessing or using Gentlee, you agree to be bound by these Terms & Conditions. If you do not agree, please discontinue use immediately.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">1. ACCEPTANCE OF TERMS</h2>
          <p>
            Gentlee is owned and operated by Lumi Apollo Ventures Ltd Pty ("Company," "we," "us," or "our"). These Terms govern your use of Gentlee's website, app, and services ("Services"). By using Gentlee, you accept these Terms and agree to comply with them.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">2. GENTLEE IS NOT A REPLACEMENT FOR PROFESSIONAL CARE</h2>
          <ul className="list-disc pl-6">
            <li>Gentlee does not provide medical, psychological, or crisis support.</li>
            <li>Gentlee is not a substitute for professional therapy, mental health treatment, or emergency intervention.</li>
            <li>If you are experiencing distress, self-harm ideation, or crisis, please seek immediate help from licensed professionals or emergency services in your area.</li>
            <li>We do not provide medical advice, diagnosis, or treatment.</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">3. USER ELIGIBILITY</h2>
          <ul className="list-disc pl-6">
            <li>You must be at least 18 years old to use Gentlee. If you are under 18, you may only use Gentlee with parental consent.</li>
            <li>By using Gentlee, you confirm that you are legally capable of entering into these Terms.</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">4. PERMITTED USE & PROHIBITED CONDUCT</h2>
          <p>You agree to use Gentlee solely for personal, non-commercial purposes. You must not:</p>
          <ul className="list-disc pl-6">
            <li>Use Gentlee for unlawful, abusive, harassing, defamatory, or inappropriate purposes.</li>
            <li>Attempt to mislead, impersonate, or exploit others.</li>
            <li>Reverse-engineer, modify, or distribute Gentlee's software.</li>
            <li>Post or transmit harmful content, including viruses, malware, or automated bots.</li>
            <li>Use Gentlee to collect personal information from other users.</li>
            <li>Attempt to bypass security measures or interfere with system integrity.</li>
          </ul>
          <p>Violation of these rules may result in immediate termination of your access to Gentlee.</p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">5. ACCOUNTS & SECURITY</h2>
          <ul className="list-disc pl-6">
            <li>You are responsible for maintaining the security of your account.</li>
            <li>You agree not to share your login credentials or allow unauthorized access.</li>
            <li>If you suspect unauthorized access, notify us immediately at [support email].</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">6. DATA & PRIVACY</h2>
          <ul className="list-disc pl-6">
            <li>By using Gentlee, you consent to our Privacy Policy (see below).</li>
            <li>We take reasonable security measures to protect your data but cannot guarantee complete security.</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">7. INTELLECTUAL PROPERTY</h2>
          <ul className="list-disc pl-6">
            <li>Gentlee and all associated content, branding, trademarks, and services are the exclusive property of Lumi Apollo Ventures Ltd Pty.</li>
            <li>You may not use, reproduce, or distribute our content without written consent.</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">8. LIABILITY LIMITATIONS & DISCLAIMERS</h2>
          <ul className="list-disc pl-6">
            <li>Gentlee is provided "as-is" without warranties.</li>
            <li>We do not guarantee uninterrupted, error-free service.</li>
            <li>We are not responsible for any damages, losses, or adverse effects resulting from the use of Gentlee.</li>
            <li>Our total liability in any claim will not exceed the amount you paid (if any) to use Gentlee.</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">9. TERMINATION OF SERVICE</h2>
          <ul className="list-disc pl-6">
            <li>We reserve the right to suspend or terminate accounts violating these Terms.</li>
            <li>We may discontinue Gentlee at any time without liability.</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">10. DISPUTE RESOLUTION</h2>
          <ul className="list-disc pl-6">
            <li>Any disputes shall be resolved through binding arbitration in Victoria, governed by Australian law.</li>
            <li>Class action lawsuits are waived, and individual arbitration is required.</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">11. CHANGES TO TERMS</h2>
          <p>
            We may update these Terms at any time. Continued use of Gentlee after updates constitutes acceptance.
            For questions, contact hellogentleeme@gmail.com
          </p>
        </div>
      </div>
    </div>
  );
};

export default Terms;
