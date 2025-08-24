"use client"

import { Search, Download, Home, Users, Building, MapPin, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import Link from "next/link"
import { useState, useEffect } from "react"

export default function Component() {
  const [selectedFilters, setSelectedFilters] = useState({
    topline: "house",
    province: "",
    party: "",
    officeType: "",
    role: "",
    committee: "",
  })

  const [showResults, setShowResults] = useState(false)
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

  // Mock data for demonstration
  const mockResults = [
    {
      name: "Hon. Sarah Johnson",
      title: "Member of Parliament",
      party: "Liberal",
      province: "Ontario",
      constituency: "Toronto Centre",
      email: "sarah.johnson@parl.gc.ca",
      phone: "(613) 992-4567",
      office: "House of Commons",
    },
    {
      name: "Hon. Michael Chen",
      title: "Senator",
      party: "Conservative",
      province: "British Columbia",
      constituency: "Vancouver",
      email: "michael.chen@sen.parl.gc.ca",
      phone: "(613) 992-8901",
      office: "Senate",
    },
    {
      name: "Dr. Emily Rodriguez",
      title: "Member of Parliament",
      party: "NDP",
      province: "Quebec",
      constituency: "Montreal East",
      email: "emily.rodriguez@parl.gc.ca",
      phone: "(613) 992-2345",
      office: "House of Commons",
    },
  ]

  const handleSearch = () => {
    setShowResults(true)
  }

  const handleDownload = () => {
    alert("Redirecting to secure checkout...")
  }

  const handleFilterChange = (key: string, value: string) => {
    setSelectedFilters((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Blue Header Banner */}
      <div className="bg-blue-500 text-white text-center py-3 px-4 text-sm">
        <Link href="#" className="underline font-medium">
          Contact us
        </Link>{" "}
        if you're looking to future-proof your government affairs work by automating the gathering, synthesizing and
        analysis of critical data inputs.
      </div>

      {/* Navigation */}
      <nav className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <Search className="w-5 h-5 text-gray-400" />
              <h1 className="text-xl font-semibold">Queen Street Analytics</h1>
            </div>

            <div className="hidden md:flex items-center space-x-8">
              <Link href="#" className="text-gray-300 hover:text-white">
                Home
              </Link>
              <Link href="#" className="text-gray-300 hover:text-white">
                About
              </Link>
              <Link href="#" className="text-gray-300 hover:text-white">
                Newsletters
              </Link>
              <Link href="#" className="text-white font-medium">
                Contact Lists
              </Link>
              <Link href="#" className="text-gray-300 hover:text-white">
                Search Engine
              </Link>
            </div>

            <div className="flex items-center space-x-4">
              <Button variant="ghost" className="text-gray-300 hover:text-white">
                Sign in
              </Button>
              <Button className="bg-white text-black hover:bg-gray-100">Subscribe</Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="bg-gray-50 min-h-screen">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div className="space-y-8">
              <div className="border-b border-gray-200 pb-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">Parliamentary Contact Lists</h1>
                <div className="text-gray-600 leading-relaxed">
                  <p>
                    Need to contact key decision-makers? We have the most accurate and up-to-date information about
                    parliamentary staff, as well as all their contact information - phone, fax, mailing address and
                    verified email address - in easily downloadable lists which will include all the issues they work
                    on.{" "}
                    <Link href="#" className="text-blue-600 hover:text-blue-800 font-medium">
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
                          selectedFilters.topline === "civil-service"
                            ? "border-blue-600 bg-blue-600"
                            : "border-gray-300"
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
                          className="w-full h-12 border border-gray-300 rounded-md px-4 pr-10 appearance-none bg-white hover:border-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 text-sm"
                          value={selectedFilters.party}
                          onChange={(e) => handleFilterChange("party", e.target.value)}
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
                      onCheckedChange={setIncludeDirector}
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
                      className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-base font-medium rounded-md shadow-sm transition-colors duration-200"
                    >
                      <Search className="w-5 h-5 mr-2" />
                      Search Contact Lists
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Results Section */}
        {showResults && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Search Results</h3>
                <p className="text-sm text-gray-600">Found {mockResults.length} contacts matching your criteria</p>
              </div>
              <div className="flex space-x-3">
                <Button variant="outline" className="flex items-center space-x-2 bg-white border-gray-300">
                  <Download className="w-4 h-4" />
                  <span>Preview (Free)</span>
                </Button>
                <Button
                  onClick={handleDownload}
                  className="bg-green-600 hover:bg-green-700 text-white flex items-center space-x-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Full List ($49)</span>
                </Button>
              </div>
            </div>

            <div className="overflow-x-auto border border-gray-200 rounded-lg">
              <table className="w-full border-collapse bg-white">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left p-4 font-semibold text-gray-900">Name</th>
                    <th className="text-left p-4 font-semibold text-gray-900">Title</th>
                    <th className="text-left p-4 font-semibold text-gray-900">Party</th>
                    <th className="text-left p-4 font-semibold text-gray-900">Province</th>
                    <th className="text-left p-4 font-semibold text-gray-900">Constituency</th>
                    <th className="text-left p-4 font-semibold text-gray-900">Contact</th>
                  </tr>
                </thead>
                <tbody>
                  {mockResults.map((contact, index) => (
                    <tr
                      key={index}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200"
                    >
                      <td className="p-4 font-medium text-gray-900">{contact.name}</td>
                      <td className="p-4 text-gray-700">{contact.title}</td>
                      <td className="p-4">
                        <Badge
                          variant="secondary"
                          className={
                            contact.party === "Liberal"
                              ? "bg-red-100 text-red-800 border-red-200"
                              : contact.party === "Conservative"
                                ? "bg-blue-100 text-blue-800 border-blue-200"
                                : contact.party === "NDP"
                                  ? "bg-orange-100 text-orange-800 border-orange-200"
                                  : "bg-gray-100 text-gray-800 border-gray-200"
                          }
                        >
                          {contact.party}
                        </Badge>
                      </td>
                      <td className="p-4 text-gray-700">{contact.province}</td>
                      <td className="p-4 text-gray-700">{contact.constituency}</td>
                      <td className="p-4">
                        <div className="text-sm">
                          <div className="text-blue-600 font-medium">{contact.email}</div>
                          <div className="text-gray-500">{contact.phone}</div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
