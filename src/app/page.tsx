import Link from 'next/link';
import { CaseVaultLogo } from '@/components/ui/casevault-logo';
import { Shield, Lock, Search, FileText, Users, Award } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-brand-gradient">
      <nav className="border-b border-brand-darkBorder bg-brand-darkCard/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <CaseVaultLogo size={48} animated />
            <div className="flex gap-4">
              <Link
                href="/sign-in"
                className="px-4 py-2 text-white hover:text-brand-accent transition"
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                className="px-6 py-2 bg-brand-secondary hover:bg-brand-secondary/90 text-white rounded-lg font-semibold transition"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main>
        <section className="container mx-auto px-6 py-20 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-6xl font-bold text-white mb-6">
              Enterprise Evidence
              <span className="block bg-gradient-to-r from-brand-secondary to-brand-accent bg-clip-text text-transparent">
                Intelligence Platform
              </span>
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              Professional forensics tool for law enforcement, legal teams, and compliance. Secure evidence analysis with cryptographic chain of custody.
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                href="/sign-up"
                className="px-8 py-4 bg-brand-secondary hover:bg-brand-secondary/90 text-white rounded-lg text-lg font-semibold transition"
              >
                Start Free Trial
              </Link>
              <Link
                href="/sign-in"
                className="px-8 py-4 border border-brand-secondary text-brand-secondary hover:bg-brand-secondary/10 rounded-lg text-lg font-semibold transition"
              >
                Sign In
              </Link>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-6 py-20">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-brand-darkCard p-8 rounded-xl border border-brand-darkBorder">
              <Shield className="w-12 h-12 text-brand-secondary mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Cryptographic Chain of Custody</h3>
              <p className="text-gray-400">
                Blockchain-style immutable audit trail with digital signatures for every evidence interaction.
              </p>
            </div>

            <div className="bg-brand-darkCard p-8 rounded-xl border border-brand-darkBorder">
              <Lock className="w-12 h-12 text-brand-accent mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Client-Side Processing</h3>
              <p className="text-gray-400">
                All file analysis happens in your browser. No data ever leaves your device.
              </p>
            </div>

            <div className="bg-brand-darkCard p-8 rounded-xl border border-brand-darkBorder">
              <Search className="w-12 h-12 text-brand-secondary mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Advanced Search</h3>
              <p className="text-gray-400">
                Full-text search with metadata filtering, tags, and intelligent categorization.
              </p>
            </div>

            <div className="bg-brand-darkCard p-8 rounded-xl border border-brand-darkBorder">
              <FileText className="w-12 h-12 text-brand-accent mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Multi-Format Reports</h3>
              <p className="text-gray-400">
                Generate professional reports in PDF, JSON, or CSV with full chain of custody.
              </p>
            </div>

            <div className="bg-brand-darkCard p-8 rounded-xl border border-brand-darkBorder">
              <Users className="w-12 h-12 text-brand-secondary mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Case Management</h3>
              <p className="text-gray-400">
                Organize evidence into cases with auto-generated case numbers and tracking.
              </p>
            </div>

            <div className="bg-brand-darkCard p-8 rounded-xl border border-brand-darkBorder">
              <Award className="w-12 h-12 text-brand-accent mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Enterprise Grade</h3>
              <p className="text-gray-400">
                Built for professionals with security, compliance, and reliability in mind.
              </p>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-6 py-20 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Trusted by Law Enforcement & Legal Professionals
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            CaseVault Pro provides the security, reliability, and features you need for professional evidence management.
          </p>
          <Link
            href="/sign-up"
            className="inline-block px-8 py-4 bg-brand-accent hover:bg-brand-accent/90 text-brand-primary rounded-lg text-lg font-semibold transition"
          >
            Get Started Today
          </Link>
        </section>
      </main>

      <footer className="border-t border-brand-darkBorder bg-brand-darkCard/50 mt-20">
        <div className="container mx-auto px-6 py-8 text-center text-gray-400">
          <p>&copy; 2025 CaseVault Pro. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
