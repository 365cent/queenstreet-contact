import { Pool } from "pg"

let pool: Pool | null = null

export interface ContactFilters {
  search?: string
  categories?: string[]
  party?: string[]
  province?: string[]
  role?: string[]
  committee?: string[]
  issue?: string[]
  linkedin?: string[]
  topline?: "house" | "senate" | "provincial" | "minister"
  limit?: number
  offset?: number
  includeDirector?: boolean
}

export function getDatabase() {
  if (pool) return pool

  // Force Azure database connection with the user's credentials
  const databaseUrl = `postgresql://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@${process.env.POSTGRES_HOST}:5432/${process.env.POSTGRES_DATABASE}`

  console.log('🔌 Forcing Azure database connection')

  if (!databaseUrl || databaseUrl.includes('YOUR_PASSWORD_HERE')) {
    throw new Error(
      "Database connection string is invalid or contains placeholder password. Please check your environment variables."
    )
  }

  console.log(`🔌 Connecting to database: ${databaseUrl.replace(/:[^:@]{4,}@/, ':****@')}`)

  if (!(globalThis as any).pgPool) {
    ;(globalThis as any).pgPool = new Pool({
      connectionString: databaseUrl,
      ssl: { rejectUnauthorized: false },
    })
    ;(globalThis as any).pgPool.on("error", (err) => {
      console.error("Database pool error:", extractErrorDetails(err))
    })
    ;(globalThis as any).pgPool.on("connect", (client) => {
      console.log("✅ Database connected successfully")
    })
  }

  pool = (globalThis as any).pgPool
  return pool
}

// -----------------------
// House of Commons
// -----------------------
export async function getHouseOfCommonsContacts(filters?: ContactFilters) {
  const pool = getDatabase()
  const params: any[] = []
  const whereConditions: string[] = []

  if (filters?.search) {
    params.push(`%${filters.search}%`)
    whereConditions.push(`
      (full_name ILIKE $${params.length} OR
       title ILIKE $${params.length} OR
       mp_name ILIKE $${params.length} OR
       political_party ILIKE $${params.length} OR
       province ILIKE $${params.length})
    `)
  }

  if (filters?.party?.length) {
    params.push(filters.party)
    whereConditions.push(`political_party = ANY($${params.length}::text[])`)
  }

  if (filters?.province?.length) {
    params.push(filters.province)
    whereConditions.push(`province = ANY($${params.length}::text[])`)
  }

  const whereClause =
    whereConditions.length > 0 ? `WHERE ${whereConditions.join(" AND ")}` : ""

  const limitClause =
    (filters?.limit ? ` LIMIT ${filters.limit}` : "") +
    (filters?.offset ? ` OFFSET ${filters.offset}` : "")

  const query = `
    SELECT person_type, full_name, title, mp_name, political_party, riding, province, email
    FROM mv_contacts_mp_and_constituency_assistants
    ${whereClause}
    ORDER BY full_name ASC
    ${limitClause}
  `

  try {
    const result = await pool.query(query, params)
    return result.rows
  } catch (error) {
    console.error("House of Commons query failed:", {
      ...extractErrorDetails(error),
      filters,
      whereClause,
    })
    return []
  }
}

// -----------------------
// Senate
// -----------------------
export async function getSenateContacts(filters?: ContactFilters) {
  const pool = getDatabase()
  const params: any[] = []
  const whereConditions: string[] = []

  if (filters?.search) {
    params.push(`%${filters.search}%`)
    whereConditions.push(`full_name ILIKE $${params.length}`)
  }

  if (filters?.party?.length) {
    params.push(filters.party)
    whereConditions.push(`senator_affiliation = ANY($${params.length}::text[])`)
  }

  if (filters?.province?.length) {
    params.push(filters.province)
    whereConditions.push(`senator_province = ANY($${params.length}::text[])`)
  }

  // LinkedIn filter simplified
  if (filters?.linkedin?.includes("has")) {
    whereConditions.push(`linkedin_url IS NOT NULL AND linkedin_url <> ''`)
  } else if (filters?.linkedin?.includes("none")) {
    whereConditions.push(`COALESCE(linkedin_url, '') = ''`)
  }

  const whereClause =
    whereConditions.length > 0 ? `WHERE ${whereConditions.join(" AND ")}` : ""

  const query = `
    SELECT person_type, full_name, title, senator_name, senator_province, senator_affiliation, email, linkedin_url
    FROM mv_contacts_senators_and_staffers
    ${whereClause}
    ORDER BY full_name ASC
    ${filters?.limit ? `LIMIT ${filters.limit}` : ""}
    ${filters?.offset ? `OFFSET ${filters.offset}` : ""}
  `

  try {
    const result = await pool.query(query, params)
    return result.rows
  } catch (error) {
    console.error("Senate query failed:", {
      ...extractErrorDetails(error),
      filters,
      whereClause,
    })
    return []
  }
}

// -----------------------
// Provincial
// -----------------------
export async function getProvincialContacts(filters?: ContactFilters) {
  const pool = getDatabase()
  const params: any[] = []
  const whereConditions: string[] = []

  if (filters?.search) {
    params.push(`%${filters.search}%`)
    whereConditions.push(
      `(full_name ILIKE $${params.length} OR constituency ILIKE $${params.length})`
    )
  }

  if (filters?.party?.length) {
    params.push(filters.party)
    whereConditions.push(`party = ANY($${params.length}::text[])`)
  }

  const whereClause =
    whereConditions.length > 0 ? `WHERE ${whereConditions.join(" AND ")}` : ""

  const query = `
    SELECT person_type, full_name, title, province, party, constituency, email
    FROM mv_provincial_legislator_contacts
    ${whereClause}
    ORDER BY full_name ASC
    ${filters?.limit ? `LIMIT ${filters.limit}` : ""}
    ${filters?.offset ? `OFFSET ${filters.offset}` : ""}
  `

  try {
    const result = await pool.query(query, params)
    return result.rows
  } catch (error) {
    console.error("Provincial query failed:", {
      ...extractErrorDetails(error),
      filters,
      whereClause,
    })
    return []
  }
}

// -----------------------
// Router
// -----------------------
export async function getContacts(filters?: ContactFilters) {
  switch (filters?.topline ?? "house") {
    case "house":
      return getHouseOfCommonsContacts(filters)
    case "senate":
      return getSenateContacts(filters)
    case "provincial":
      return getProvincialContacts(filters)
    case "minister":
      return getHouseOfCommonsContacts(filters) // ministers in same view
    default:
      return []
  }
}

// -----------------------
// Orders Management
// -----------------------
export async function createOrder(userId: string, contactIds: number[], amount: number) {
  const pool = getDatabase()
  try {
    const result = await pool.query(
      `INSERT INTO orders (user_id, contact_ids, amount, status, created_at, updated_at) 
       VALUES ($1, $2, $3, $4, NOW(), NOW()) 
       RETURNING *`,
      [userId, JSON.stringify(contactIds), amount, 'pending']
    )
    return result.rows[0]
  } catch (error) {
    console.error("Failed to create order:", extractErrorDetails(error))
    return null
  }
}

export async function getOrdersByUserId(userId: string) {
  const pool = getDatabase()
  try {
    const result = await pool.query(
      `SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC`,
      [userId]
    )
    return result.rows
  } catch (error) {
    console.error("Failed to get orders:", extractErrorDetails(error))
    return []
  }
}

export async function getOrderById(orderId: number) {
  const pool = getDatabase()
  try {
    const result = await pool.query(
      `SELECT * FROM orders WHERE id = $1 AND status = 'completed'`,
      [orderId]
    )
    return result.rows[0] || null
  } catch (error) {
    console.error("Failed to get order:", extractErrorDetails(error))
    return null
  }
}

export async function updateOrderStatus(orderId: number, status: string, paymentIntentId?: string) {
  const pool = getDatabase()
  try {
    const result = await pool.query(
      `UPDATE orders SET status = $2, payment_intent_id = $3, updated_at = NOW() 
       WHERE id = $1 RETURNING *`,
      [orderId, status, paymentIntentId || null]
    )
    return result.rows[0]
  } catch (error) {
    console.error("Failed to update order status:", extractErrorDetails(error))
    return null
  }
}

export async function getContactsByIds(contactIds: number[]) {
  const pool = getDatabase()
  
  if (!contactIds || contactIds.length === 0) {
    return []
  }

  try {
    // Since we have different contact types in different tables/views, we'll need to query all of them
    // and merge the results. For now, let's assume they have unique IDs and query the main views.
    
    const queries = [
      `SELECT *, 'house' as source_table FROM mv_contacts_mp_and_constituency_assistants WHERE id = ANY($1::int[])`,
      `SELECT *, 'senate' as source_table FROM mv_contacts_senators_and_staffers WHERE id = ANY($1::int[])`,
      `SELECT *, 'provincial' as source_table FROM mv_provincial_legislator_contacts WHERE id = ANY($1::int[])`
    ]
    
    const results = await Promise.all(
      queries.map(query => 
        pool.query(query, [contactIds]).catch(err => {
          console.warn(`Query failed: ${query}`, extractErrorDetails(err))
          return { rows: [] }
        })
      )
    )
    
    // Merge all results
    const allContacts = results.flatMap(result => result.rows)
    
    console.log(`Retrieved ${allContacts.length} contacts for IDs:`, contactIds)
    return allContacts
  } catch (error) {
    console.error("Failed to get contacts by IDs:", extractErrorDetails(error))
    return []
  }
}

function extractErrorDetails(error: unknown) {
  if (error instanceof Error) {
    return { message: error.message, stack: error.stack }
  }
  return { message: String(error) }
}
