"use client"

import type React from "react"
import { useSearchParams } from "next/navigation"
import { Search, Download, Filter, ArrowLeft, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import Link from "next/link"
import { useState, useEffect, Suspense } from "react"

interface Contact {
  id: number
  name: string
  title: string
  department: string
  email: string
  phone: string
  office_location: string
  constituency: string
  party: string
  province: string
  category: string
}

function ResultsPageComponent() {
  const searchParams = useSearchParams()
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filters, setFilters] = useState({
    topline: "",
    province: "",
    party: "",
    officeType: "",
    role: "",
    committee: "",
    category: "",
  })
  const [includeDirector, setIncludeDirector] = useState(false)

  const [currentPage, setCurrentPage] = useState(1)
  const [totalResults, setTotalResults] = useState(0)
  const [selectedContacts, setSelectedContacts] = useState<number[]>([])
  const resultsPerPage = 20

  useEffect(() => {
    // Initialize filters from URL search params
    const urlFilters: { [key: string]: string } = {}
    for (const [key, value] of searchParams.entries()) {
      urlFilters[key] = value
    }
    setFilters((prev) => ({ ...prev, ...urlFilters }))
    setIncludeDirector(searchParams.get("includeDirector") === "true")
  }, [searchParams])

  useEffect(() => {
    loadContacts()
  }, [filters, searchQuery, currentPage, includeDirector])

  const loadContacts = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()

      // Add all filters to the request
      if (searchQuery) params.set("search", searchQuery)
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.set(key, value)
      })
      if (includeDirector) params.set("includeDirector", "true")

      params.set("limit", resultsPerPage.toString())
      params.set("offset", ((currentPage - 1) * resultsPerPage).toString())

      const response = await fetch(`/api/contacts?${params.toString()}`)
      const data = await response.json()

      if (data.success) {
        setContacts(data.contacts)
        setTotalResults(data.contacts.length)
      } else {
        console.error("Error loading contacts:", data.error)
      }
    } catch (error) {
      console.error("Error loading contacts:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
    loadContacts()
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
    setCurrentPage(1)
  }

  const handleContactSelect = (contactId: number, checked: boolean) => {
    if (checked) {
      setSelectedContacts((prev) => [...prev, contactId])
    } else {
      setSelectedContacts((prev) => prev.filter((id) => id !== contactId))
    }
  }

  const handleSelectAll = (checked: boolean | "indeterminate") => {
    if (checked === true) {
      setSelectedContacts(contacts.map((c) => c.id))
    } else {
      setSelectedContacts([])
    }
  }

  const handlePurchaseAll = async () => {
    try {
      const params = new URLSearchParams()

      if (searchQuery) params.set("search", searchQuery)
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.set(key, value)
      })
      if (includeDirector) params.set("includeDirector", "true")
      params.set("limit", "1000") // Get all results

      const response = await fetch(`/api/contacts?${params.toString()}`)
      const data = await response.json()

      if (data.success) {
        const allContactIds = data.contacts.map((c: Contact) => c.id).join(",")
        window.location.href = `/checkout?contacts=${allContactIds}`
      } else {
        console.error("Error getting all contacts:", data.error)
        alert("Error preparing purchase. Please try again.")
      }
    } catch (error) {
      console.error("Error getting all contacts:", error)
      alert("Error preparing purchase. Please try again.")
    }
  }

  const handlePurchaseSelected = () => {
    if (selectedContacts.length === 0) {
      alert("Please select contacts to purchase")
      return
    }

    const contactsParam = selectedContacts.join(",")
    window.location.href = `/checkout?contacts=${contactsParam}`
  }

  const totalPages = Math.ceil(totalResults / resultsPerPage)

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Search
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Search Results</h1>
              <p className="text-gray-600 mt-2">
                {loading ? "Loading..." : `Found ${totalResults} contacts matching your criteria`}
              </p>
            </div>

            {/* Purchase Actions */}
            <div className="flex gap-3">
              {selectedContacts.length > 0 && (
                <Button onClick={handlePurchaseSelected} className="bg-green-600 hover:bg-green-700 text-white">
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Purchase Selected ({selectedContacts.length}) - $49
                </Button>
              )}
              <Button onClick={handlePurchaseAll} className="bg-blue-600 hover:bg-blue-700 text-white">
                <Download className="w-4 h-4 mr-2" />
                Purchase All Results - $49
              </Button>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Filter className="w-5 h-5 mr-2" />
                Filters
              </h3>

              {/* Search */}
              <form onSubmit={handleSearch} className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="Name, department, constituency..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1"
                  />
                  <Button type="submit" size="sm">
                    <Search className="w-4 h-4" />
                  </Button>
                </div>
              </form>

              {/* Party Filter */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Party</label>
                <select
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  value={filters.party}
                  onChange={(e) => handleFilterChange("party", e.target.value)}
                >
                  <option value="">All Parties</option>
                  <option value="Liberal">Liberal</option>
                  <option value="Conservative">Conservative</option>
                  <option value="NDP">NDP</option>
                  <option value="Bloc Québécois">Bloc Québécois</option>
                  <option value="Green">Green</option>
                  <option value="Independent">Independent</option>
                </select>
              </div>

              {/* Province Filter */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Province</label>
                <select
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  value={filters.province}
                  onChange={(e) => handleFilterChange("province", e.target.value)}
                >
                  <option value="">All Provinces</option>
                  <option value="Ontario">Ontario</option>
                  <option value="Quebec">Quebec</option>
                  <option value="British Columbia">British Columbia</option>
                  <option value="Alberta">Alberta</option>
                  <option value="Manitoba">Manitoba</option>
                  <option value="Saskatchewan">Saskatchewan</option>
                  <option value="Nova Scotia">Nova Scotia</option>
                  <option value="New Brunswick">New Brunswick</option>
                  <option value="Newfoundland and Labrador">Newfoundland and Labrador</option>
                  <option value="Prince Edward Island">Prince Edward Island</option>
                  <option value="Northwest Territories">Northwest Territories</option>
                  <option value="Nunavut">Nunavut</option>
                  <option value="Yukon">Yukon</option>
                </select>
              </div>

              {/* Category Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  value={filters.category}
                  onChange={(e) => handleFilterChange("category", e.target.value)}
                >
                  <option value="">All Categories</option>
                  <option value="MP">Member of Parliament</option>
                  <option value="Senator">Senator</option>
                  <option value="Minister">Minister</option>
                  <option value="Prime Minister">Prime Minister</option>
                  <option value="Staff">Parliamentary Staff</option>
                </select>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              {loading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Loading contacts...</p>
                </div>
              ) : contacts.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-gray-600">No contacts found matching your criteria.</p>
                </div>
              ) : (
                <>
                  <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center gap-4">
                      <Checkbox
                        checked={
                          selectedContacts.length > 0 && selectedContacts.length === contacts.length
                            ? true
                            : selectedContacts.length > 0
                              ? "indeterminate"
                              : false
                        }
                        onCheckedChange={handleSelectAll}
                      />
                      <span className="text-sm text-gray-600">
                        {selectedContacts.length > 0 ? `${selectedContacts.length} selected` : "Select all"}
                      </span>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="text-left p-4 w-12"></th>
                          <th className="text-left p-4 font-semibold text-gray-900">Name</th>
                          <th className="text-left p-4 font-semibold text-gray-900">Title</th>
                          <th className="text-left p-4 font-semibold text-gray-900">Party</th>
                          <th className="text-left p-4 font-semibold text-gray-900">Province</th>
                          <th className="text-left p-4 font-semibold text-gray-900">Contact</th>
                        </tr>
                      </thead>
                      <tbody>
                        {contacts.map((contact) => (
                          <tr key={contact.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="p-4">
                              <Checkbox
                                checked={selectedContacts.includes(contact.id)}
                                onCheckedChange={(checked) => handleContactSelect(contact.id, checked as boolean)}
                              />
                            </td>
                            <td className="p-4 font-medium text-gray-900">{contact.name}</td>
                            <td className="p-4 text-gray-700">{contact.title}</td>
                            <td className="p-4">
                              <Badge variant="secondary" className="text-xs">
                                {contact.party}
                              </Badge>
                            </td>
                            <td className="p-4 text-gray-700">{contact.province}</td>
                            <td className="p-4 text-sm text-gray-600">
                              <div>{contact.email}</div>
                              <div>{contact.phone}</div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="p-4 border-t border-gray-200 flex items-center justify-between">
                      <div className="text-sm text-gray-600">
                        Page {currentPage} of {totalPages}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                          disabled={currentPage === 1}
                        >
                          Previous
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                          disabled={currentPage === totalPages}
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function ResultsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResultsPageComponent />
    </Suspense>
  )
}
