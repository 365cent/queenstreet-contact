"use client"

import { Search, Download, Home, Users, Building, MapPin, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import Link from "next/link"
import { useState, useEffect } from "react"

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

export default function ContactListsPage() {
  const [selectedFilters, setSelectedFilters] = useState({
    topline: "house",
    province: "",
    party: "",
    officeType: "",
    role: "",
    committee: "",
  })

  const [showResults, setShowResults] = useState(false)
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(false)
  const [availableOfficeTypes, setAvailableOfficeTypes] = useState<string[]>([])
  const [availableCommittees, setAvailableCommittees] = useState<string[]>([])
  const [showProvinces, setShowProvinces] = useState(true)
  const [includeDirector, setIncludeDirector] = useState(false)

  // Update available options based on topline selection
  useEffect(() => {
    switch (selectedFilters.topline) {
      case "house":
        setAvailableOfficeTypes(["Ministerial Staff", "Member's Staff"])
        setAvailableCommittees([
          "Agriculture and Agri-Food",
          "Canadian Heritage",
          "Citizenship and Immigration",
          "Environment and Sustainable Development",
          "Finance",
          "Fisheries and Oceans",
          "Foreign Affairs and International Development",
          "Government Operations and Estimates",
          "Health",
          "Human Resources, Skills and Social Development",
          "Industry and Technology",
          "Justice and Human Rights",
          "National Defence",
          "Natural Resources",
          "Official Languages",
          "Procedure and House Affairs",
          "Public Accounts",
          "Public Safety and National Security",
          "Status of Women",
          "Transport, Infrastructure and Communities",
          "Veterans Affairs",
          "Access to Information, Privacy and Ethics",
          "International Trade",
          "Northern Affairs and Arctic Sovereignty",
          "Science and Research",
        ])
        setShowProvinces(true)
        break
      case "senate":
        setAvailableOfficeTypes(["Member's Staff"])
        setAvailableCommittees([
          "Aboriginal Peoples",
          "Agriculture and Forestry",
          "Banking, Trade and Commerce",
          "Energy, the Environment and Natural Resources",
          "Fisheries and Oceans",
          "Foreign Affairs and International Trade",
          "Human Rights",
          "Internal Economy, Budgets and Administration",
          "Legal and Constitutional Affairs",
          "National Finance",
          "National Security and Defence",
          "Official Languages",
          "Rules, Procedures and the Rights of Parliament",
          "Social Affairs, Science and Technology",
          "Transport and Communications",
          "Anti-terrorism",
          "Charitable Sector",
          "Ethics and Conflict of Interest for Senators",
          "Senate Modernization",
          "Special Committee on the Arctic",
          "Special Committee on Aging",
          "Special Committee on the Charitable Sector",
          "Special Committee on Senate Modernization",
          "Joint Committee on the Library of Parliament",
          "Joint Committee on Scrutiny of Regulations",
        ])
        setShowProvinces(false)
        break
      case "civil-service":
        setAvailableOfficeTypes(["Civil Service Staff"])
        setAvailableCommittees([])
        setShowProvinces(false)
        setSelectedFilters((prev) => ({ ...prev, party: "", committee: "" }))
        break
      case "provincial":
        setAvailableOfficeTypes(["Member's Staff"])
        setAvailableCommittees([])
        setShowProvinces(true)
        break
      default:
        setAvailableOfficeTypes([])
        setAvailableCommittees([])
        setShowProvinces(false)
    }
  }, [selectedFilters.topline])

  const buildQueryString = () => {
    const params = new URLSearchParams()

    // Add all filters from state
    Object.entries(selectedFilters).forEach(([key, value]) => {
      if (value) {
        params.set(key, value)
      }
    })

    if (includeDirector) {
      params.set("includeDirector", "true")
    }

    return params.toString()
  }

  const handleSearch = async () => {
    setLoading(true)
    setShowResults(true)

    try {
      const params = new URLSearchParams()

      // topline → category mapping (server expects category)
      const toplineToCategory: Record<string, string> = {
        house: "MP",
        senate: "Senator",
        provincial: "MPP",
        "civil-service": "CivilService",
      }
      const category = toplineToCategory[selectedFilters.topline]
      if (category) params.set("category", category)
      params.set("topline", selectedFilters.topline)

      // party normalization
      const partyMap: Record<string, string> = {
        liberal: "Liberal Party of Canada",
        conservative: "Conservative Party of Canada",
        ndp: "New Democratic Party",
        bloc: "Bloc Québécois",
        green: "Green Party of Canada",
        independent: "Independent",
      }
      if (selectedFilters.party && partyMap[selectedFilters.party]) {
        params.set("party", partyMap[selectedFilters.party])
      }

      // province normalization (optionally accent-aware on backend)
      const provinceMap: Record<string, string> = {
        AB: "Alberta",
        BC: "British Columbia",
        MB: "Manitoba",
        NB: "New Brunswick",
        NL: "Newfoundland and Labrador",
        NT: "Northwest Territories",
        NS: "Nova Scotia",
        NU: "Nunavut",
        ON: "Ontario",
        PE: "Prince Edward Island",
        QC: "Quebec", // consider "Québec" if that’s your canonical form
        SK: "Saskatchewan",
        YT: "Yukon",
      }
      if (selectedFilters.province && provinceMap[selectedFilters.province]) {
        params.set("province", provinceMap[selectedFilters.province])
      }

      // optional filters
      if (selectedFilters.officeType) params.set("officeType", selectedFilters.officeType)
      if (selectedFilters.role) params.set("role", selectedFilters.role)
      if (selectedFilters.committee) params.set("committee", selectedFilters.committee)
      if (includeDirector) params.set("includeDirector", "true")

      params.set("limit", "10")

      const res = await fetch(`/api/contacts?${params.toString()}`)
      const data = await res.json()
      if (data?.success) setContacts(data.contacts ?? [])
      else setContacts([])
    } catch (e) {
      console.error(e)
      setContacts([])
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = () => {
    window.location.href = `/results?${buildQueryString()}`
  }

  const handleFilterChange = (key: string, value: string) => {
    setSelectedFilters((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="space-y-8">
            <div className="border-b border-gray-200 pb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Parliamentary Contact Lists</h1>
              <div className="text-gray-600 leading-relaxed">
                <p>
                  Need to contact key decision-makers? We have the most accurate and up-to-date information about
                  parliamentary staff, as well as all their contact information - phone, fax, mailing address and
                  verified email address - in easily downloadable lists which will include all the issues they work on.{" "}
                  <Link href="/results" className="text-blue-600 hover:text-blue-800 font-medium">
                    See more
                  </Link>
                </p>
              </div>
            </div>

            <div className="space-y-8">
              {/* TOPLINE Selection */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Government Level</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <label className="relative flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors duration-200">
                    <input
                      type="radio"
                      name="topline"
                      value="house"
                      checked={selectedFilters.topline === "house"}
                      onChange={(e) => handleFilterChange("topline", e.target.value)}
                      className="sr-only"
                    />
                    <div
                      className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center ${
                        selectedFilters.topline === "house" ? "border-blue-600 bg-blue-600" : "border-gray-300"
                      }`}
                    >
                      {selectedFilters.topline === "house" && <div className="w-2 h-2 rounded-full bg-white"></div>}
                    </div>
                    <Home className="w-5 h-5 mr-3 text-gray-500" />
                    <span className="text-sm font-medium text-gray-900">House</span>
                  </label>

                  <label className="relative flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors duration-200">
                    <input
                      type="radio"
                      name="topline"
                      value="senate"
                      checked={selectedFilters.topline === "senate"}
                      onChange={(e) => handleFilterChange("topline", e.target.value)}
                      className="sr-only"
                    />
                    <div
                      className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center ${
                        selectedFilters.topline === "senate" ? "border-blue-600 bg-blue-600" : "border-gray-300"
                      }`}
                    >
                      {selectedFilters.topline === "senate" && <div className="w-2 h-2 rounded-full bg-white"></div>}
                    </div>
                    <Users className="w-5 h-5 mr-3 text-gray-500" />
                    <span className="text-sm font-medium text-gray-900">Senate</span>
                  </label>

                  <label className="relative flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors duration-200">
                    <input
                      type="radio"
                      name="topline"
                      value="civil-service"
                      checked={selectedFilters.topline === "civil-service"}
                      onChange={(e) => handleFilterChange("topline", e.target.value)}
                      className="sr-only"
                    />
                    <div
                      className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center ${
                        selectedFilters.topline === "civil-service" ? "border-blue-600 bg-blue-600" : "border-gray-300"
                      }`}
                    >
                      {selectedFilters.topline === "civil-service" && (
                        <div className="w-2 h-2 rounded-full bg-white"></div>
                      )}
                    </div>
                    <Building className="w-5 h-5 mr-3 text-gray-500" />
                    <span className="text-sm font-medium text-gray-900">Civil Service</span>
                  </label>

                  <label className="relative flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors duration-200">
                    <input
                      type="radio"
                      name="topline"
                      value="provincial"
                      checked={selectedFilters.topline === "provincial"}
                      onChange={(e) => handleFilterChange("topline", e.target.value)}
                      className="sr-only"
                    />
                    <div
                      className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center ${
                        selectedFilters.topline === "provincial" ? "border-blue-600 bg-blue-600" : "border-gray-300"
                      }`}
                    >
                      {selectedFilters.topline === "provincial" && (
                        <div className="w-2 h-2 rounded-full bg-white"></div>
                      )}
                    </div>
                    <MapPin className="w-5 h-5 mr-3 text-gray-500" />
                    <span className="text-sm font-medium text-gray-900">Provincial</span>
                  </label>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-8">
                <div className="grid md:grid-cols-3 gap-6">
                  {/* Provinces - Only show for House and Provincial */}
                  {showProvinces && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">Province/Territory</label>
                      <div className="relative">
                        <select
                          className="w-full h-12 border border-gray-300 rounded-md px-4 pr-10 appearance-none bg-white hover:border-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 text-sm"
                          value={selectedFilters.province}
                          onChange={(e) => handleFilterChange("province", e.target.value)}
                        >
                          <option value="">All provinces and territories</option>
                          <option value="AB">Alberta</option>
                          <option value="BC">British Columbia</option>
                          <option value="MB">Manitoba</option>
                          <option value="NB">New Brunswick</option>
                          <option value="NL">Newfoundland and Labrador</option>
                          <option value="NT">Northwest Territories</option>
                          <option value="NS">Nova Scotia</option>
                          <option value="NU">Nunavut</option>
                          <option value="ON">Ontario</option>
                          <option value="PE">Prince Edward Island</option>
                          <option value="QC">Quebec</option>
                          <option value="SK">Saskatchewan</option>
                          <option value="YT">Yukon</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                      </div>
                    </div>
                  )}

                  {/* Office Types */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Office Type</label>
                    <div className="relative">
                      <select
                        className="w-full h-12 border border-gray-300 rounded-md px-4 pr-10 appearance-none bg-white hover:border-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 text-sm"
                        value={selectedFilters.officeType}
                        onChange={(e) => handleFilterChange("officeType", e.target.value)}
                      >
                        <option value="">All office types</option>
                        {availableOfficeTypes.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* Party */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Political Party</label>
                    <div className="relative">
                      <select
                        className="w-full h-12 border border-gray-300 rounded-md px-4 pr-10 appearance-none bg-white hover:border-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                        value={selectedFilters.party}
                        onChange={(e) => handleFilterChange("party", e.target.value)}
                        disabled={selectedFilters.topline === "civil-service"}
                      >
                        <option value="">All parties</option>
                        <option value="liberal">Liberal Party of Canada</option>
                        <option value="conservative">Conservative Party of Canada</option>
                        <option value="ndp">New Democratic Party</option>
                        <option value="bloc">Bloc Québécois</option>
                        <option value="green">Green Party of Canada</option>
                        <option value="independent">Independent</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* Committee and Leadership Staff */}
                  {availableCommittees.length > 0 && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">Committee</label>
                      <div className="relative">
                        <select
                          className="w-full h-12 border border-gray-300 rounded-md px-4 pr-10 appearance-none bg-white hover:border-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 text-sm"
                          value={selectedFilters.committee}
                          onChange={(e) => handleFilterChange("committee", e.target.value)}
                        >
                          <option value="">All committees</option>
                          {availableCommittees.map((committee) => (
                            <option key={committee} value={committee}>
                              {committee}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                      </div>
                    </div>
                  )}

                  {/* Roles Covered */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Role</label>
                    <div className="relative">
                      <select
                        className="w-full h-12 border border-gray-300 rounded-md px-4 pr-10 appearance-none bg-white hover:border-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 text-sm"
                        value={selectedFilters.role}
                        onChange={(e) => handleFilterChange("role", e.target.value)}
                      >
                        <option value="">All roles</option>
                        <option value="cabinet-minister">Cabinet Minister</option>
                        <option value="parliamentary-secretary">Parliamentary Secretary</option>
                        <option value="committee-chair">Committee Chair</option>
                        <option value="committee-vice-chair">Committee Vice-Chair</option>
                        <option value="caucus-chair">Caucus Chair</option>
                        <option value="house-leader">House Leader</option>
                        <option value="whip">Whip</option>
                        <option value="critic">Opposition Critic</option>
                        <option value="chief-of-staff">Chief of Staff</option>
                        <option value="policy-advisor">Policy Advisor</option>
                        <option value="communications-director">Communications Director</option>
                        <option value="constituency-assistant">Constituency Assistant</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <div className="flex items-start space-x-3 mb-6">
                  <Checkbox
                    id="include-director"
                    checked={includeDirector}
                    onCheckedChange={(checked) => setIncludeDirector(checked === true)}
                    className="mt-0.5"
                  />
                  <div className="space-y-1">
                    <label htmlFor="include-director" className="text-sm font-medium text-gray-900 cursor-pointer">
                      Include Legislative Director for offices without specific staffer assigned to issue
                    </label>
                    <p className="text-xs text-gray-500">
                      This will include Legislative Directors when no specific staff member is assigned to handle the
                      selected issues.
                    </p>
                  </div>
                </div>

                <div className="flex justify-center">
                  <Button
                    onClick={handleSearch}
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-base font-medium rounded-md shadow-sm transition-colors duration-200"
                  >
                    <Search className="w-5 h-5 mr-2" />
                    {loading ? "Searching..." : "Search Contact Lists"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Results Section */}
        {showResults && (
          <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Search Results Preview</h3>
                  <p className="text-sm text-gray-600">
                    {loading ? "Searching..." : `Showing first ${contacts.length} results`}
                  </p>
                </div>
                <div className="flex space-x-3">
                  <Link href={`/results?${buildQueryString()}`}>
                    <Button variant="outline" className="flex items-center space-x-2 bg-white border-gray-300">
                      <Search className="w-4 h-4" />
                      <span>View All Results</span>
                    </Button>
                  </Link>
                  <Button
                    onClick={handleDownload}
                    className="bg-green-600 hover:bg-green-700 text-white flex items-center space-x-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>Purchase Full List ($49)</span>
                  </Button>
                </div>
              </div>

              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Loading contacts...</p>
                </div>
              ) : contacts.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-600">No contacts found for your search criteria.</p>
                  <p className="text-sm text-gray-500">Please try adjusting your filters.</p>
                </div>
              ) : (
                <div className="overflow-x-auto border border-gray-200 rounded-lg">
                  <table className="w-full border-collapse bg-white">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50">
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
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
