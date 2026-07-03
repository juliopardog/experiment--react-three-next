import { LegalPage } from "@/components/legal/LegalPage";

export const metadata = { title: "Privacy Policy — PolloLabs" };

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" updated="[DATE — fill in on publish]">
      <p className="callout">
        <strong>This is a template, not legal advice.</strong>{" "}
        PolloLabs processes personal data about two different groups — your account
        data, and data about the third-party leads you search for or upload.
        The second category carries real GDPR/CCPA exposure if any of your
        customers&rsquo; leads are in the EU/UK or California. Have a lawyer confirm
        this policy matches what your backend actually does before publishing.
      </p>

      <h2>1. Who This Policy Covers</h2>
      <p>
        This Privacy Policy explains how <strong>[COMPANY NAME]</strong>{" "}
        (&ldquo;PolloLabs,&rdquo; &ldquo;we&rdquo;) collects, uses, and shares information through the
        PolloLabs website and application (the &ldquo;Service&rdquo;). It covers two kinds
        of personal data: (a) data about you, our customer, and (b) data about
        the business leads you search for, upload, or contact through the
        Service.
      </p>

      <h2>2. Information We Collect</h2>
      <h3>Account information</h3>
      <ul>
        <li>Name, email address, password (stored hashed), company name</li>
        <li>Billing information — handled directly by Stripe; we do not store your card number</li>
        <li>Usage data: campaigns created, emails sent, feature usage, log/device data</li>
      </ul>
      <h3>Lead data (third-party business contacts)</h3>
      <ul>
        <li>Business contact details you upload directly (CSV, manual entry)</li>
        <li>Business contact details found via our lead-search feature, sourced from publicly available business listings (e.g., search engines, OpenStreetMap, public business websites)</li>
        <li>Email engagement data for leads you contact: opens, clicks, bounces, replies, unsubscribes</li>
      </ul>

      <h2>3. How We Use Information</h2>
      <ul>
        <li>To provide the Service — running searches, generating drafts, sending your approved emails, tracking delivery and engagement</li>
        <li>To operate your account — authentication, billing, plan enforcement, customer support</li>
        <li>To improve the Service — aggregated, de-identified usage analytics</li>
        <li>To comply with legal obligations and enforce our <a href="/terms">Terms</a> and <a href="/acceptable-use">Acceptable Use Policy</a></li>
      </ul>
      <p>
        We do not use your customer persona descriptions or lead lists to
        train AI models for other customers.
      </p>

      <h2>4. Third Parties We Share Data With</h2>
      <p>We use the following categories of subprocessors to run the Service:</p>
      <ul>
        <li><strong>Payments:</strong> Stripe (billing, checkout, subscription management)</li>
        <li><strong>Hosting/infrastructure:</strong> our cloud and database providers</li>
        <li><strong>Email delivery:</strong> our transactional/outbound email provider, to send approved emails on your behalf and track opens/bounces/replies</li>
        <li><strong>AI providers:</strong> large language model providers, to generate email drafts from the information you supply</li>
      </ul>
      <p>
        We do not sell personal data, and we do not share lead data across
        customer accounts.
      </p>

      <h2>5. Recipients&rsquo; Rights — Unsubscribe</h2>
      <p>
        Every email sent through PolloLabs includes a way for the recipient to
        opt out of future emails. Once a lead unsubscribes, we mark them as
        such and no further automated emails will be sent to them through the
        Service. Recipients who want a lead removed from our systems entirely
        can contact <strong>[SUPPORT EMAIL]</strong>.
      </p>

      <h2>6. Data Retention</h2>
      <p>
        We retain account data for as long as your account is active, and for
        a reasonable period afterward to comply with legal, tax, and dispute
        obligations. We retain lead data for as long as your campaign is
        active or as needed to honor opt-outs and suppress future contact.
        You can delete leads, campaigns, or your entire account at any time;
        deletion requests are processed within a reasonable timeframe.
      </p>

      <h2>7. Your Rights</h2>
      <p>
        Depending on where you (or, where applicable, your leads) are
        located, you may have rights to access, correct, delete, or export
        personal data, and to object to or restrict certain processing
        (e.g., under the GDPR, UK GDPR, or CCPA/CPRA). To exercise these
        rights, contact <strong>[SUPPORT EMAIL]</strong>.{" "}
        We may need to verify your identity before fulfilling a request.
      </p>

      <h2>8. Cookies</h2>
      <p>
        We use essential cookies to keep you signed in and remember your
        preferences. We may use analytics cookies to understand product
        usage. You can control cookies through your browser settings.
      </p>

      <h2>9. Security</h2>
      <p>
        We use industry-standard measures — encryption in transit, hashed
        passwords, access controls — to protect data. No system is perfectly
        secure, and we cannot guarantee absolute security.
      </p>

      <h2>10. International Transfers</h2>
      <p>
        We may process and store data in the United States and other
        countries. Where required, we rely on appropriate safeguards (such as
        Standard Contractual Clauses) for transfers of personal data out of
        the EU/UK.
      </p>

      <h2>11. Children</h2>
      <p>
        The Service is not directed to children under 16, and we do not
        knowingly collect personal data from them.
      </p>

      <h2>12. Changes to This Policy</h2>
      <p>
        We may update this Privacy Policy from time to time. We will post the
        updated version here with a new &ldquo;Last updated&rdquo; date.
      </p>

      <h2>13. Contact</h2>
      <p>
        Questions about this Privacy Policy or a data request:{" "}
        <strong>[SUPPORT EMAIL]</strong>
      </p>
    </LegalPage>
  );
}
