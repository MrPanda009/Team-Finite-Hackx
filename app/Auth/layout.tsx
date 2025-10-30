import './globals.css';
import React from 'react';
import Link from 'next/link';
import { Shield } from 'lucide-react';
import WalletButton from '@/components/WalletButton';
import { Home, Users, Settings, Mail } from 'lucide-react';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const navLinks = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Team', href: '#team', icon: Users },
    { name: 'Contact', href: '#contact', icon: Mail },
    { name: 'Settings', href: '#settings', icon: Settings },
  ];

  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-slate-100">
       <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <Shield className="w-8 h-8 text-primary" />
              <span className="text-xl font-bold text-foreground">AidChain</span>
            </Link>
            <nav className="flex items-center gap-6">
              <Link href="/Dashboard" className="text-sm font-medium text-muted-foreground hover:text-foreground transition">
                Dashboard
              </Link>
              <Link href="/Tracking" className="text-sm font-medium text-muted-foreground hover:text-foreground transition">
                Tracking
              </Link>
              <Link href="/Features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition">
                Features
              </Link>
              <Link href="/Auth" className="text-sm font-medium text-muted-foreground hover:text-foreground transition">
                Login
              </Link>
            </nav>
          </div>
        </div>
      </header>

        {/* Main Content */}
        <main className="flex-grow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </div>
        </main>

        {/* Footer */}
      <footer className="border-t border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-2 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-6 h-6 text-primary" />
              <span className="font-bold text-foreground">AidChain</span>
            </div>
            <p className="text-sm text-muted-foreground">© 2025 AidChain. Powered by blockchain technology.</p>
          </div>
        </div>
          <div className="container mx-auto px-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Quick Links */}
              <div>
                <h3 className="font-semibold mb-4">Quick Links</h3>
                <ul className="space-y-2 text-sm">
                  <li>
                    <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                      About Us
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                      Services
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                      Portfolio
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                      Blog
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Contact */}
              <div>
                <h3 className="font-semibold mb-4">Contact</h3>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li>email@example.com</li>
                  <li>+91 XXXXXXXXXX</li>
                  <li>123 Street Name</li>
                  <li>City, State 12345</li>
                </ul>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
              <div className="flex space-x-6 mt-4 md:mt-0">
                <Link href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Privacy Policy
                </Link>
                <Link href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Terms of Service
                </Link>
                <Link href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Cookie Policy
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}