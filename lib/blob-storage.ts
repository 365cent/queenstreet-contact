import { BlobServiceClient, BlockBlobClient } from "@azure/storage-blob"

// Azure Blob Storage configuration
const BLOB_STORAGE_ACCOUNT_NAME = process.env.BLOB_STORAGE_ACCOUNT_NAME || ""
const BLOB_STORAGE_CONTAINER_NAME = process.env.BLOB_STORAGE_CONTAINER_NAME || ""
const BLOB_STORAGE_SAS_TOKEN = process.env.BLOB_STORAGE_SAS_TOKEN || ""
const BLOB_STORAGE_READ_SAS_TOKEN = process.env.BLOB_STORAGE_READ_SAS_TOKEN || ""

const BLOB_STORAGE_URL = `https://${BLOB_STORAGE_ACCOUNT_NAME}.blob.core.windows.net`
const CONTAINER_URL = `${BLOB_STORAGE_URL}/${BLOB_STORAGE_CONTAINER_NAME}`

// Initialize Blob Service Client
function getBlobServiceClient() {
  const blobServiceClient = new BlobServiceClient(`${BLOB_STORAGE_URL}${BLOB_STORAGE_SAS_TOKEN}`)
  return blobServiceClient
}

// Generate a unique filename for the CSV
function generateCSVFilename(orderId: string, contactCount: number): string {
  const timestamp = new Date().toISOString().split('T')[0] // YYYY-MM-DD
  return `parliamentary-contacts-${orderId}-${contactCount}-contacts-${timestamp}.csv`
}

// Upload CSV content to Blob Storage
export async function uploadCSVToBlob(
  csvContent: string, 
  orderId: string, 
  contactCount: number
): Promise<{ success: boolean; blobUrl?: string; error?: string }> {
  try {
    // Check if we have valid SAS tokens
    if (!BLOB_STORAGE_SAS_TOKEN || BLOB_STORAGE_SAS_TOKEN === process.env.BLOB_STORAGE_SAS_TOKEN) {
      console.log("No valid SAS token provided, skipping blob storage upload")
      return {
        success: false,
        error: "No valid SAS token provided"
      }
    }

    const blobServiceClient = getBlobServiceClient()
    const containerClient = blobServiceClient.getContainerClient(BLOB_STORAGE_CONTAINER_NAME)
    
    // Ensure container exists
    await containerClient.createIfNotExists()
    
    const filename = generateCSVFilename(orderId, contactCount)
    const blockBlobClient = containerClient.getBlockBlobClient(filename)
    
    // Upload the CSV content
    const uploadResponse = await blockBlobClient.upload(csvContent, csvContent.length, {
      blobHTTPHeaders: {
        blobContentType: "text/csv",
        blobContentDisposition: `attachment; filename="${filename}"`
      }
    })
    
    if (uploadResponse.requestId) {
      // Generate the public download URL with read SAS token
      const blobUrl = `${CONTAINER_URL}/${filename}${BLOB_STORAGE_READ_SAS_TOKEN}`
      
      return {
        success: true,
        blobUrl
      }
    } else {
      return {
        success: false,
        error: "Failed to upload CSV to blob storage"
      }
    }
  } catch (error) {
    console.error("Error uploading CSV to blob storage:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred"
    }
  }
}

// Generate a download URL for an existing blob
export function generateBlobDownloadUrl(filename: string): string {
  return `${CONTAINER_URL}/${filename}${BLOB_STORAGE_READ_SAS_TOKEN}`
}

// Check if a blob exists
export async function blobExists(filename: string): Promise<boolean> {
  try {
    const blobServiceClient = getBlobServiceClient()
    const containerClient = blobServiceClient.getContainerClient(BLOB_STORAGE_CONTAINER_NAME)
    const blockBlobClient = containerClient.getBlockBlobClient(filename)
    
    const exists = await blockBlobClient.exists()
    return exists
  } catch (error) {
    console.error("Error checking if blob exists:", error)
    return false
  }
}

// List all blobs in the container (for debugging)
export async function listBlobs(): Promise<string[]> {
  try {
    const blobServiceClient = getBlobServiceClient()
    const containerClient = blobServiceClient.getContainerClient(BLOB_STORAGE_CONTAINER_NAME)
    
    const blobs: string[] = []
    for await (const blob of containerClient.listBlobsFlat()) {
      blobs.push(blob.name)
    }
    
    return blobs
  } catch (error) {
    console.error("Error listing blobs:", error)
    return []
  }
}
