import { LegalPage } from "@/components/legal/LegalPage";

export const metadata = { title: "Acceptable Use Policy — PolloLabs" };

export default function AcceptableUsePage() {
  return (
    <LegalPage title="Acceptable Use Policy" updated="[DATE — fill in on publish]">
      <p className="callout">
        <strong>This is a template, not legal advice.</strong>{" "}
        This is the
        document that does the most to protect PolloLabs if a customer sends
        illegal spam through the platform — it puts the compliance obligation
        explicitly on the customer and gives you clear grounds to suspend
        them. A lawyer should confirm it's enforceable in your jurisdiction
        and lines up with your actual moderation process.
      </p>

      <h2>1. Purpose</h2>
      <p>
        PolloLabs exists to help you send outreach that people actually want
        to read — approved by you, one email at a time. This policy sets the
        rules for using the Service responsibly. Violating it is a breach of
        our <a href="/terms">Terms of Service</a>{" "}
        and may result in suspension or termination of your account, with or
        without notice depending on severity.
      </p>

      <h2>2. You Are Responsible for What You Send</h2>
      <p>
        PolloLabs generates draft emails and automates delivery, but{" "}
        <strong>you</strong>{" "}
        approve every message before it sends. That means you — not PolloLabs
        — are the sender of record under laws like
        CAN-SPAM and CASL, and you bear responsibility for the content,
        legality, and targeting of every email sent from your account.
      </p>

      <h2>3. Required Practices</h2>
      <p>When using PolloLabs to send email, you agree to:</p>
      <ul>
        <li>Only contact business email addresses relevant to a legitimate commercial offer — not personal/consumer addresses for unrelated solicitation</li>
        <li>Use accurate sender names, subject lines, and reply-to addresses — never spoof or mislead about who is sending</li>
        <li>Honor every unsubscribe or opt-out request promptly, and never re-contact someone who has unsubscribed</li>
        <li>Stop contacting a lead who asks you to stop, even outside a formal unsubscribe link</li>
        <li>Comply with all anti-spam, telemarketing, and data protection laws that apply to you and your recipients</li>
      </ul>

      <h2>4. Prohibited Uses</h2>
      <p>You may not use PolloLabs to:</p>
      <ul>
        <li>Send unsolicited email in violation of CAN-SPAM, CASL, GDPR/PECR, or any other applicable law</li>
        <li>Send content that is fraudulent, deceptive, defamatory, harassing, threatening, or hateful</li>
        <li>Distribute malware, phishing links, or deceptive redirects</li>
        <li>Scrape or import contact data obtained through illegal means (e.g., hacked databases, data acquired in violation of a website&rsquo;s terms in a way that breaches applicable law)</li>
        <li>Impersonate any person or organization, or misrepresent your affiliation with one</li>
        <li>Contact individuals who have previously opted out, whether through PolloLabs or another channel you're aware of</li>
        <li>Use the Service to send anything unrelated to a legitimate business offer (e.g., political spam, chain letters, pyramid schemes)</li>
        <li>Attempt to circumvent usage limits, reverse-engineer the Service, or resell access without our written permission</li>
        <li>Overload, scrape, or attack the Service's infrastructure</li>
      </ul>

      <h2>5. Lead Data You Bring or Find</h2>
      <p>
        Whether you upload your own lead list or use our lead-search feature,
        you are responsible for confirming you have a lawful basis to contact
        each lead. Our lead-search feature surfaces publicly listed business
        information; it is not a guarantee that contacting every result is
        lawful for your specific offer or jurisdiction. When in doubt, don&rsquo;t
        send.
      </p>

      <h2>6. Monitoring &amp; Enforcement</h2>
      <p>
        We monitor aggregate signals like bounce rates, spam complaints, and
        unsubscribe rates, and we may review account activity if we receive a
        complaint or detect a pattern consistent with abuse. If we determine
        you&rsquo;ve violated this policy, we may, at our discretion:
      </p>
      <ul>
        <li>Warn you and require corrective action</li>
        <li>Pause sending on your account</li>
        <li>Suspend or terminate your account, with limited or no refund</li>
        <li>Report unlawful activity to relevant authorities</li>
      </ul>
      <p>
        Serious violations — clear spam campaigns, fraud, harassment — may
        result in immediate termination without prior warning.
      </p>

      <h2>7. Reporting Abuse</h2>
      <p>
        If you receive an email sent through PolloLabs that you believe
        violates this policy, contact <strong>[ABUSE EMAIL]</strong>{" "}
        with the email headers or a forwarded copy. We investigate all reports.
      </p>

      <h2>8. Changes to This Policy</h2>
      <p>
        We may update this policy as regulations or our practices evolve. The
        current version always applies to your use of the Service.
      </p>
    </LegalPage>
  );
}
