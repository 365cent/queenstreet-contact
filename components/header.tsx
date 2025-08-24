import Link from "next/link"
import { Package } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Header() {
  return (
    <>
      {/* Blue Announcement Bar */}
      <div className="bg-blue-500 text-white text-center py-3 px-4 text-sm">
        <Link href="/contact-us" className="underline font-bold">
          Contact us
        </Link>{" "}
        if you're looking to future-proof your government affairs work by automating the gathering, synthesizing and
        analysis of critical data inputs.
      </div>

      {/* Main Navigation */}
      <header className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Left side - Logo */}
            <div className="flex items-center">
              <Link href="/" className="text-xl font-bold">
                Queen Street Analytics
              </Link>
            </div>

            {/* Center - Navigation Menu */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link href="/about" className="text-gray-300 hover:text-white">
                About
              </Link>
              <Link href="/newsletters" className="text-gray-300 hover:text-white">
                Newsletters
              </Link>
              <Link href="/" className="text-white hover:text-gray-300">
                Contact Lists
              </Link>
              <Link href="/results" className="text-gray-300 hover:text-white">
                Results
              </Link>
              <Link href="/orders" className="text-gray-300 hover:text-white flex items-center">
                <Package className="w-4 h-4 mr-1" />
                Orders
              </Link>
              <Link href="/search-engine" className="text-gray-300 hover:text-white">
                Search Engine
              </Link>
            </nav>

            {/* Right side - Actions */}
            <div className="flex items-center space-x-4">
              <Link href="/signin" className="text-gray-300 hover:text-white">
                Sign in
              </Link>
              <Button className="bg-white text-black hover:bg-gray-100">Subscribe</Button>
            </div>
          </div>
        </div>
      </header>
    </>
  )
}
