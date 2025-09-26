import { Contact } from '@/app/page'

// Define all possible columns with their display names and priority
export const ALL_COLUMNS = [
  // High priority - always show first
  { key: 'full_name', label: 'Full Name', priority: 1 },
  { key: 'name', label: 'Name', priority: 1 },
  { key: 'title', label: 'Title', priority: 1 },
  { key: 'email', label: 'Email', priority: 1 },
  { key: 'telephone', label: 'Phone', priority: 1 },
  { key: 'political_party', label: 'Political Party', priority: 1 },
  { key: 'party', label: 'Party', priority: 1 },
  { key: 'riding', label: 'Riding', priority: 1 },
  { key: 'constituency', label: 'Constituency', priority: 1 },
  { key: 'province', label: 'Province', priority: 1 },
  { key: 'senator_province', label: 'Senator Province', priority: 1 },
  
  // Medium priority
  { key: 'person_type', label: 'Person Type', priority: 2 },
  { key: 'mp_name', label: 'MP Name', priority: 2 },
  { key: 'senator_name', label: 'Senator Name', priority: 2 },
  { key: 'alternate_phone', label: 'Alternate Phone', priority: 2 },
  { key: 'fax', label: 'Fax', priority: 2 },
  { key: 'street_address', label: 'Street Address', priority: 2 },
  { key: 'city', label: 'City', priority: 2 },
  { key: 'postal_code', label: 'Postal Code', priority: 2 },
  { key: 'country', label: 'Country', priority: 2 },
  { key: 'profile_url', label: 'Profile URL', priority: 2 },
  { key: 'website_url', label: 'Website', priority: 2 },
  { key: 'primary_role', label: 'Primary Role', priority: 2 },
  { key: 'current_roles', label: 'Current Roles', priority: 2 },
  { key: 'committees', label: 'Committees', priority: 2 },
  
  // Hill Office fields
  { key: 'hill_office_street', label: 'Hill Office Street', priority: 3 },
  { key: 'hill_office_city', label: 'Hill Office City', priority: 3 },
  { key: 'hill_office_province', label: 'Hill Office Province', priority: 3 },
  { key: 'hill_office_postal_code', label: 'Hill Office Postal Code', priority: 3 },
  { key: 'hill_office_phone', label: 'Hill Office Phone', priority: 3 },
  { key: 'hill_office_fax', label: 'Hill Office Fax', priority: 3 },
  
  // Constituency Office fields
  { key: 'constituency_office_name', label: 'Constituency Office Name', priority: 3 },
  { key: 'constituency_office_street', label: 'Constituency Office Street', priority: 3 },
  { key: 'constituency_office_city', label: 'Constituency Office City', priority: 3 },
  { key: 'constituency_office_province', label: 'Constituency Office Province', priority: 3 },
  { key: 'constituency_office_postal_code', label: 'Constituency Office Postal Code', priority: 3 },
  { key: 'constituency_office_phone', label: 'Constituency Office Phone', priority: 3 },
  { key: 'constituency_office_fax', label: 'Constituency Office Fax', priority: 3 },
  
  // Senate specific fields
  { key: 'senator_affiliation', label: 'Senator Affiliation', priority: 3 },
  { key: 'senator_url', label: 'Senator URL', priority: 3 },
  { key: 'senator_linkedin_url', label: 'Senator LinkedIn', priority: 3 },
  { key: 'nomination_date', label: 'Nomination Date', priority: 3 },
  { key: 'retirement_date', label: 'Retirement Date', priority: 3 },
  { key: 'linkedin_url', label: 'LinkedIn URL', priority: 3 },
  
  // Provincial specific fields
  { key: 'constituency_address', label: 'Constituency Address', priority: 3 },
  { key: 'legislative_address', label: 'Legislative Address', priority: 3 },
  { key: 'profile_summary', label: 'Profile Summary', priority: 3 },
  { key: 'education', label: 'Education', priority: 3 },
  { key: 'work_experience', label: 'Work Experience', priority: 3 },
  
  // Additional fields
  { key: 'latest_role_start_date', label: 'Latest Role Start Date', priority: 4 },
  { key: 'link_to_all_roles', label: 'Link to All Roles', priority: 4 },
  { key: 'link_to_xml_data', label: 'Link to XML Data', priority: 4 },
  { key: 'link_to_csv_data', label: 'Link to CSV Data', priority: 4 },
  { key: 'constituency_postal_codes', label: 'Constituency Postal Codes', priority: 4 },
  { key: 'parliamentary_offices', label: 'Parliamentary Offices', priority: 4 },
  { key: 'photo_url', label: 'Photo URL', priority: 4 },
  { key: 'office_location', label: 'Office Location', priority: 4 },
  { key: 'phone', label: 'Phone (Legacy)', priority: 4 },
  { key: 'department', label: 'Department', priority: 4 },
  { key: 'category', label: 'Category', priority: 4 },
  { key: 'id', label: 'ID', priority: 4 },
]

// Function to get column value from contact
export function getColumnValue(contact: Contact, key: string): string {
  const value = (contact as any)[key]
  if (value === null || value === undefined || value === '') {
    return ''
  }
  return String(value)
}

// Function to check if a column has any non-empty values across all contacts
export function hasData(contacts: Contact[], key: string): boolean {
  return contacts.some(contact => {
    const value = getColumnValue(contact, key)
    return value !== ''
  })
}

// Function to organize columns by data availability and priority
export function organizeColumns(contacts: Contact[]): Array<{ key: string; label: string; priority: number }> {
  // First, get all columns that have data
  const columnsWithData = ALL_COLUMNS.filter(col => hasData(contacts, col.key))
  
  // Then get columns without data
  const columnsWithoutData = ALL_COLUMNS.filter(col => !hasData(contacts, col.key))
  
  // Sort columns with data by priority, then by label
  const sortedColumnsWithData = columnsWithData.sort((a, b) => {
    if (a.priority !== b.priority) {
      return a.priority - b.priority
    }
    return a.label.localeCompare(b.label)
  })
  
  // Sort columns without data by priority, then by label
  const sortedColumnsWithoutData = columnsWithoutData.sort((a, b) => {
    if (a.priority !== b.priority) {
      return a.priority - b.priority
    }
    return a.label.localeCompare(b.label)
  })
  
  // Return columns with data first, then columns without data
  return [...sortedColumnsWithData, ...sortedColumnsWithoutData]
}

// Function to format column value for display
export function formatColumnValue(value: string): string {
  if (value === '') {
    return '-'
  }
  
  // Truncate very long values
  if (value.length > 100) {
    return value.substring(0, 100) + '...'
  }
  
  return value
}
