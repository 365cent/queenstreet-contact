import Link from "next/link"
import { Button } from "@/components/ui/button"

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center space-y-8">
          {/* Subscription Section */}
          <div className="space-y-4">
            <h3 className="text-3xl font-bold">Subscribe to Queen Street Analytics</h3>
            <p className="text-gray-300 max-w-2xl mx-auto">
              Don't miss out on the latest news. Sign up now to get access to the library of members-only articles.
            </p>
            <Button className="bg-white text-black hover:bg-gray-100 px-8 py-3">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" className="mr-2">
                <path
                  d="M3.33332 3.33334H16.6667C17.5833 3.33334 18.3333 4.08334 18.3333 5.00001V15C18.3333 15.9167 17.5833 16.6667 16.6667 16.6667H3.33332C2.41666 16.6667 1.66666 15.9167 1.66666 15V5.00001C1.66666 4.08334 2.41666 3.33334 3.33332 3.33334Z"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M18.3333 5L9.99999 10.8333L1.66666 5"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Subscribe now
            </Button>
          </div>

          {/* Footer Navigation */}
          <nav className="flex justify-center space-x-8 text-sm">
            <Link href="/signup" className="text-gray-300 hover:text-white">
              Sign up
            </Link>
            <span className="text-gray-600">•</span>
            <Link href="/contact-us" className="text-gray-300 hover:text-white">
              Contact Us
            </Link>
            <span className="text-gray-600">•</span>
            <Link href="/about" className="text-gray-300 hover:text-white">
              About
            </Link>
          </nav>

          {/* Copyright */}
          <div className="text-sm text-gray-400 border-t border-gray-800 pt-8">
            Queen Street Analytics © 2025. Powered by{" "}
            <Link href="https://ghost.org/" target="_blank" rel="noopener" className="hover:text-white">
              Ghost
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
