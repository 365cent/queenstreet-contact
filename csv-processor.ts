// CSV processing utilities for backend integration
export interface ContactRecord {
  name: string
  title: string
  party: string
  province: string
  constituency: string
  email: string
  phone: string
  office: string
  committee?: string
  policyAreas?: string[]
  staffType?: string
}

export function parseCSV(csvContent: string): ContactRecord[] {
  const lines = csvContent.split("\n")
  const headers = lines[0].split(",").map((h) => h.trim())

  return lines.slice(1).map((line) => {
    const values = line.split(",").map((v) => v.trim())
    const record: any = {}

    headers.forEach((header, index) => {
      record[header] = values[index] || ""
    })

    return record as ContactRecord
  })
}

export function filterContacts(
  contacts: ContactRecord[],
  filters: {
    chamber?: string
    province?: string
    party?: string
    role?: string
    committee?: string
    policyArea?: string
  },
): ContactRecord[] {
  return contacts.filter((contact) => {
    if (filters.chamber === "house" && contact.office !== "House of Commons") return false
    if (filters.chamber === "senate" && contact.office !== "Senate") return false
    if (filters.province && contact.province !== filters.province) return false
    if (filters.party && contact.party !== filters.party) return false
    if (filters.role && contact.title !== filters.role) return false
    if (filters.committee && contact.committee !== filters.committee) return false
    if (filters.policyArea && !contact.policyAreas?.includes(filters.policyArea)) return false

    return true
  })
}

export function exportToCSV(contacts: ContactRecord[]): string {
  const headers = ["Name", "Title", "Party", "Province", "Constituency", "Email", "Phone", "Office"]
  const csvContent = [
    headers.join(","),
    ...contacts.map((contact) =>
      headers.map((header) => `"${contact[header.toLowerCase() as keyof ContactRecord] || ""}"`).join(","),
    ),
  ].join("\n")

  return csvContent
}
