"use client"

import { Search, Download, Home, Users, Building, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { ComboBoxMultiSelect, type Option } from "@/components/ui/combo-box"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { useState, useEffect } from "react"
import { organizeColumns, getColumnValue, formatColumnValue } from "@/lib/column-utils"

interface FilterGroupProps {
  label: string
  placeholder: string
  options: Option[]
  value: string[]
  onChange: (values: string[]) => void
  loading?: boolean
}

function FilterGroup({ label, placeholder, options, value, onChange, loading }: FilterGroupProps) {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-semibold text-gray-700">{label}</label>
      <ComboBoxMultiSelect
        options={options}
        value={value}
        onChange={onChange}
        placeholder={loading ? "Loading..." : placeholder}
        searchPlaceholder={`Search ${label.toLowerCase()}...`}
        disabled={loading}
      />
    </div>
  )
}

interface Contact {
  // Common fields
  person_type?: string
  full_name?: string
  title?: string
  email?: string
  telephone?: string
  alternate_phone?: string
  fax?: string
  street_address?: string
  city?: string
  postal_code?: string
  country?: string
  profile_url?: string
  photo_url?: string
  website_url?: string
  
  // House of Commons specific fields
  mp_name?: string
  political_party?: string
  riding?: string
  province?: string
  hill_office_street?: string
  hill_office_city?: string
  hill_office_province?: string
  hill_office_postal_code?: string
  hill_office_phone?: string
  hill_office_fax?: string
  constituency_office_name?: string
  constituency_office_street?: string
  constituency_office_city?: string
  constituency_office_province?: string
  constituency_office_postal_code?: string
  constituency_office_phone?: string
  constituency_office_fax?: string
  primary_role?: string
  current_roles?: string
  latest_role_start_date?: string
  link_to_all_roles?: string
  link_to_xml_data?: string
  link_to_csv_data?: string
  constituency_postal_codes?: string
  parliamentary_offices?: string
  committees?: string
  
  // Senate specific fields
  senator_name?: string
  senator_province?: string
  senator_affiliation?: string
  senator_url?: string
  senator_linkedin_url?: string
  senator_linkedin_found?: string
  nomination_date?: string
  retirement_date?: string
  linkedin_url?: string
  
  // Provincial specific fields
  party?: string
  constituency?: string
  constituency_address?: string
  legislative_address?: string
  profile_summary?: string
  education?: string
  work_experience?: string
  
  // Legacy fields for backward compatibility
  id?: number
  name?: string
  department?: string
  phone?: string
  office_location?: string
  category?: string
}

export default function ContactListsPage() {
  const [selectedFilters, setSelectedFilters] = useState({
    topline: "house",
    categories: [] as string[],
    province: [] as string[],
    party: [] as string[],
    committee: [] as string[],
    role: [] as string[],
    issue: [] as string[],
    linkedin: [] as string[],
    search: "",
  })

  const [showResults, setShowResults] = useState(false)
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(false)
  const [availableOptions, setAvailableOptions] = useState({
    categories: [] as Option[],
    province: [] as Option[],
    party: [] as Option[],
    committee: [] as Option[],
    role: [] as Option[],
    issue: [] as Option[],
    linkedin: [] as Option[],
  })
  const [includeDirector, setIncludeDirector] = useState(false)
  const [loadingOptions, setLoadingOptions] = useState(false)

  useEffect(() => {
    const fetchOptions = async () => {
      setLoadingOptions(true)
      try {
        const response = await fetch(`/api/filters?topline=${selectedFilters.topline}`)
        const data = await response.json()

        if (data.success) {
          setAvailableOptions({
            categories: mapOptions(data.filters.categories),
            province: mapOptions(data.filters.province),
            party: mapOptions(data.filters.party),
            committee: mapOptions(data.filters.committee),
            role: mapOptions(data.filters.role),
            issue: mapOptions(data.filters.issue),
            linkedin: mapOptions(data.filters.linkedin),
          })

          setSelectedFilters((prev) => ({
            ...prev,
            categories: filterSelections(prev.categories, data.filters.categories),
            province: filterSelections(prev.province, data.filters.province),
            party: filterSelections(prev.party, data.filters.party),
            committee: filterSelections(prev.committee, data.filters.committee),
            role: filterSelections(prev.role, data.filters.role),
            issue: filterSelections(prev.issue, data.filters.issue),
            linkedin: filterSelections(prev.linkedin, data.filters.linkedin),
          }))
        }
      } catch (error) {
        console.error("Failed to load filter options", error)
      } finally {
        setLoadingOptions(false)
      }
    }

    fetchOptions()
  }, [selectedFilters.topline])

  const mapOptions = (values?: string[] | Array<{ value: string; label: string; group?: string }>): Option[] => {
    if (!values) return []
    return values.map((item) => {
      if (typeof item === "string") {
        return { value: item, label: item }
      }
      return { value: item.value, label: item.label, group: item.group }
    })
  }

  const filterSelections = (current: string[], available?: string[] | Array<{ value: string }>) => {
    if (!available) return []
    const allowedValues = new Set(available.map((item) => (typeof item === "string" ? item : item.value)))
    return current.filter((item) => allowedValues.has(item))
  }

  const buildQueryString = () => {
    const params = new URLSearchParams()

    params.set("topline", selectedFilters.topline)

    if (selectedFilters.search) {
      params.set("search", selectedFilters.search)
    }

    const multiKeys: Array<keyof typeof selectedFilters> = [
      "categories",
      "province",
      "party",
      "committee",
      "role",
      "issue",
      "linkedin",
    ]

    for (const key of multiKeys) {
      const values = selectedFilters[key]
      if (Array.isArray(values)) {
        values.forEach((value: string) => {
          params.append(key, value)
        })
      }
    }

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
      params.set("topline", selectedFilters.topline)

      selectedFilters.categories.forEach((value) => params.append("category", value))
      selectedFilters.party.forEach((value) => params.append("party", value))
      selectedFilters.province.forEach((value) => params.append("province", value))
      selectedFilters.role.forEach((value) => params.append("role", value))
      selectedFilters.committee.forEach((value) => params.append("committee", value))
      selectedFilters.issue.forEach((value) => params.append("issue", value))
      selectedFilters.linkedin.forEach((value) => params.append("linkedin", value))
      if (includeDirector) params.set("includeDirector", "true")

      params.set("limit", "1")

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

  const handleToplineChange = (value: string) => {
    setSelectedFilters((prev) => ({
      ...prev,
      topline: value,
      categories: [],
      province: [],
      party: [],
      committee: [],
      role: [],
      issue: [],
      linkedin: [],
    }))
  }

  const handleMultiSelectChange = (key: keyof typeof selectedFilters, values: string[]) => {
    setSelectedFilters((prev) => ({ ...prev, [key]: values }))
  }

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    setSelectedFilters((prev) => ({ ...prev, search: value }))
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
                      onChange={(e) => handleToplineChange(e.target.value)}
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
                      onChange={(e) => handleToplineChange(e.target.value)}
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
                      value="minister"
                      checked={selectedFilters.topline === "minister"}
                      onChange={(e) => handleToplineChange(e.target.value)}
                      className="sr-only"
                    />
                    <div
                      className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center ${
                        selectedFilters.topline === "minister" ? "border-blue-600 bg-blue-600" : "border-gray-300"
                      }`}
                    >
                      {selectedFilters.topline === "minister" && (
                        <div className="w-2 h-2 rounded-full bg-white"></div>
                      )}
                    </div>
                    <Building className="w-5 h-5 mr-3 text-gray-500" />
                    <span className="text-sm font-medium text-gray-900">Minister Office</span>
                  </label>

                  <label className="relative flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors duration-200">
                    <input
                      type="radio"
                      name="topline"
                      value="provincial"
                      checked={selectedFilters.topline === "provincial"}
                      onChange={(e) => handleToplineChange(e.target.value)}
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
                {/* Search Bar */}
                <div className="mb-8">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Search</label>
                  <Input
                    type="text"
                    value={selectedFilters.search}
                    onChange={handleSearchChange}
                    placeholder="Search by name, issue, role, etc."
                    className="h-12 max-w-md border-gray-200 bg-white rounded-lg shadow-sm focus:border-blue-300 focus:ring-blue-500/20"
                  />
                </div>

                {/* Filter Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <FilterGroup
                    label="Province"
                    placeholder="Select provinces"
                    options={availableOptions.province}
                    value={selectedFilters.province}
                    onChange={(values) => handleMultiSelectChange("province", values)}
                    loading={loadingOptions}
                  />

                  <FilterGroup
                    label="Party"
                    placeholder="Select parties"
                    options={availableOptions.party}
                    value={selectedFilters.party}
                    onChange={(values) => handleMultiSelectChange("party", values)}
                    loading={loadingOptions}
                  />

                  <FilterGroup
                    label="Categories"
                    placeholder="Select categories"
                    options={availableOptions.categories}
                    value={selectedFilters.categories}
                    onChange={(values) => handleMultiSelectChange("categories", values)}
                    loading={loadingOptions}
                  />

                  <FilterGroup
                    label="Committee"
                    placeholder="Select committees"
                    options={availableOptions.committee}
                    value={selectedFilters.committee}
                    onChange={(values) => handleMultiSelectChange("committee", values)}
                    loading={loadingOptions}
                  />

                  <FilterGroup
                    label="Role"
                    placeholder="Select roles"
                    options={availableOptions.role}
                    value={selectedFilters.role}
                    onChange={(values) => handleMultiSelectChange("role", values)}
                    loading={loadingOptions}
                  />

                  <FilterGroup
                    label="Issue"
                    placeholder="Select issues"
                    options={availableOptions.issue}
                    value={selectedFilters.issue}
                    onChange={(values) => handleMultiSelectChange("issue", values)}
                    loading={loadingOptions}
                  />

                  {selectedFilters.topline === "senate" && (
                    <FilterGroup
                      label="LinkedIn"
                      placeholder="Select LinkedIn statuses"
                      options={availableOptions.linkedin}
                      value={selectedFilters.linkedin}
                      onChange={(values) => handleMultiSelectChange("linkedin", values)}
                      loading={loadingOptions}
                    />
                  )}
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
                        {organizeColumns(contacts).map((column) => (
                          <th key={column.key} className="text-left p-2 font-semibold text-gray-900 text-xs">
                            {column.label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {contacts.map((contact, index) => (
                        <tr key={contact.id || index} className="border-b border-gray-100 hover:bg-gray-50">
                          {organizeColumns(contacts).map((column) => {
                            const value = getColumnValue(contact, column.key)
                            const formattedValue = formatColumnValue(value)
                            
                            return (
                              <td key={column.key} className="p-2 text-xs text-gray-700 max-w-32">
                                {column.key === 'email' && value ? (
                                  <a href={`mailto:${value}`} className="text-blue-600 hover:text-blue-800 truncate block">
                                    {formattedValue}
                                  </a>
                                ) : column.key === 'profile_url' && value ? (
                                  <a href={value} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                                    View
                                  </a>
                                ) : column.key === 'website_url' && value ? (
                                  <a href={value} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                                    Link
                                  </a>
                                ) : column.key === 'political_party' || column.key === 'party' ? (
                                  <Badge variant="secondary" className="text-xs">
                                    {formattedValue}
                                  </Badge>
                                ) : (
                                  <div className="truncate" title={value}>
                                    {formattedValue}
                                  </div>
                                )}
                              </td>
                            )
                          })}
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
