import { setRequestLocale } from "next-intl/server";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Janta Medicare",
  description: "Privacy Policy for Janta Medicare",
};

export default async function PrivacyPolicyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="container py-12 md:py-20">
      <div className="mx-auto max-w-4xl prose prose-slate prose-headings:font-heading prose-headings:text-primary-deep prose-a:text-primary hover:prose-a:text-primary-strong">
        <h1>Privacy Policy</h1>
        <p className="text-sm text-muted">Last Updated: August 2026</p>

        <p>
          Welcome to Janta Medicare. We value your privacy and are committed to protecting your personal data in compliance with the Digital Personal Data Protection (DPDP) Act, 2023, and the Information Technology (Intermediary Guidelines) Rules, 2021 of India.
        </p>

        <h2>1. Data Collection and Usage</h2>
        <p>
          We do not collect unnecessary personal data. When you visit our website, you can browse medicines, rate charts, and doctor information anonymously. 
        </p>
        <ul>
          <li><strong>AI Chatbot:</strong> Our AI chatbot is provided for informational purposes. We do not store your chat logs or queries in any persistent database linked to your identity.</li>
          <li><strong>Forms:</strong> Any contact form or booking form data is processed securely strictly for providing the requested medical or pharmacy service.</li>
        </ul>

        <h2>2. Cookies Policy</h2>
        <p>
          We strictly use <strong>Essential Cookies only</strong> to ensure the website functions correctly. Under current regulations, these do not require a disruptive consent banner as they do not track your activity across other sites.
        </p>
        <ul>
          <li><strong>jm_admin_session:</strong> An httpOnly secure cookie used exclusively for authenticating administrators in the backend portal.</li>
          <li><strong>NEXT_LOCALE:</strong> A functional cookie used to remember your preferred language (English, Bengali, Hindi, etc.) for your next visit.</li>
        </ul>

        <h2>3. Third-Party Services</h2>
        <p>
          We may use secure third-party APIs (such as Groq for AI services and Supabase for secure database hosting) to provide you with fast and accurate responses. These services are strictly compliant with data privacy laws and do not train their public models on your personal inputs.
        </p>

        <h2>4. Data Security</h2>
        <p>
          We implement strong security measures to protect against unauthorized access or alteration of your data.
        </p>

        <h2>5. Grievance Officer</h2>
        <p>
          In accordance with the IT Rules, 2021, if you have any discrepancies or grievances regarding data processing, please contact our Grievance Officer:
        </p>
        <p>
          <strong>Name:</strong> Grievance Officer<br />
          <strong>Email:</strong> legal@jantamedicare.com<br />
          <strong>Address:</strong> 493/C/A, G. T. Road (South), Fazir Bazar More, Vivek Vihar Phase-II, Shop No. 4, P.O. &amp; P.S. Shibpur, Dist. Howrah, Pin: 711101
        </p>
      </div>
    </div>
  );
}
