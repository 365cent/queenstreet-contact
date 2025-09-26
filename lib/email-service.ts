// Email service for resend integration
// This service handles customer email storage and retrieval for email sending

export interface CustomerEmailData {
  email: string
  orderId: string
  contactCount: number
  amount: number
  downloadUrl: string
}

// Store customer email data in localStorage for email integration
export function storeCustomerEmailData(data: CustomerEmailData) {
  try {
    localStorage.setItem('customerEmailData', JSON.stringify(data))
    return true
  } catch (error) {
    console.error('Failed to store customer email data:', error)
    return false
  }
}

// Retrieve customer email data from localStorage
export function getCustomerEmailData(): CustomerEmailData | null {
  try {
    const data = localStorage.getItem('customerEmailData')
    return data ? JSON.parse(data) : null
  } catch (error) {
    console.error('Failed to retrieve customer email data:', error)
    return null
  }
}

// Clear customer email data (useful after email is sent)
export function clearCustomerEmailData() {
  try {
    localStorage.removeItem('customerEmailData')
    localStorage.removeItem('customerEmail')
    return true
  } catch (error) {
    console.error('Failed to clear customer email data:', error)
    return false
  }
}

// Get customer email for resend integration
export function getCustomerEmail(): string | null {
  try {
    return localStorage.getItem('customerEmail')
  } catch (error) {
    console.error('Failed to get customer email:', error)
    return null
  }
}

// Prepare email data for resend integration
export function prepareEmailData(orderId: string, contactCount: number, amount: number, downloadUrl: string): CustomerEmailData | null {
  const email = getCustomerEmail()
  
  if (!email) {
    console.warn('No customer email found in localStorage')
    return null
  }

  const emailData: CustomerEmailData = {
    email,
    orderId,
    contactCount,
    amount,
    downloadUrl
  }

  // Store the complete email data
  storeCustomerEmailData(emailData)
  
  return emailData
}
