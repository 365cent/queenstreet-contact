import { neon } from "@neondatabase/serverless"

let sql: ReturnType<typeof neon> | null = null

function getDatabase() {
  if (sql) return sql

  const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.POSTGRES_PRISMA_URL

  console.log("[v0] Available env vars:", {
    DATABASE_URL: !!process.env.DATABASE_URL,
    POSTGRES_URL: !!process.env.POSTGRES_URL,
    POSTGRES_PRISMA_URL: !!process.env.POSTGRES_PRISMA_URL,
  })

  if (!databaseUrl) {
    throw new Error(
      "No database connection string found. Please set DATABASE_URL, POSTGRES_URL, or POSTGRES_PRISMA_URL environment variable.",
    )
  }

  sql = neon(databaseUrl)
  return sql
}

export async function getContacts(filters?: {
  search?: string
  party?: string
  province?: string
  category?: string
  limit?: number
  offset?: number
}) {
  const sql = getDatabase()

  // Build parameters array for safe querying
  const params: any[] = []
  const whereConditions: string[] = []

  if (filters?.search) {
    params.push(`%${filters.search}%`)
    whereConditions.push(
      `(name ILIKE $${params.length} OR department ILIKE $${params.length} OR constituency ILIKE $${params.length})`,
    )
  }

  if (filters?.party) {
    params.push(filters.party)
    whereConditions.push(`party = $${params.length}`)
  }

  if (filters?.province) {
    params.push(filters.province)
    whereConditions.push(`province = $${params.length}`)
  }

  if (filters?.category) {
    params.push(filters.category)
    whereConditions.push(`category = $${params.length}`)
  }

  const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(" AND ")}` : ""

  let limitClause = ""
  if (filters?.limit) {
    limitClause += ` LIMIT ${filters.limit}`
  }
  if (filters?.offset) {
    limitClause += ` OFFSET ${filters.offset}`
  }

  // Use sql.query for parameterized queries
  const query = `
    SELECT * FROM contacts 
    ${whereClause}
    ORDER BY name ASC
    ${limitClause}
  `

  return await sql.query(query, params)
}

export async function getContactById(id: number) {
  const sql = getDatabase()
  const result = await sql`SELECT * FROM contacts WHERE id = ${id}`
  return result[0]
}

export async function createOrder(userId: string, contactIds: number[], totalAmount: number) {
  const sql = getDatabase()
  const result = await sql`
    INSERT INTO orders (user_id, contact_ids, total_amount, status)
    VALUES (${userId}, ${contactIds}, ${totalAmount}, 'pending')
    RETURNING *
  `
  return result[0]
}

export async function updateOrderStatus(orderId: number, status: string, stripePaymentIntentId?: string) {
  const sql = getDatabase()
  if (stripePaymentIntentId) {
    const result = await sql`
      UPDATE orders 
      SET status = ${status}, stripe_payment_intent_id = ${stripePaymentIntentId}, updated_at = NOW()
      WHERE id = ${orderId}
      RETURNING *
    `
    return result[0]
  } else {
    const result = await sql`
      UPDATE orders 
      SET status = ${status}, updated_at = NOW()
      WHERE id = ${orderId}
      RETURNING *
    `
    return result[0]
  }
}

export async function getOrdersByUserId(userId: string) {
  const sql = getDatabase()
  return await sql`
    SELECT o.*, 
           array_agg(c.name) as contact_names,
           array_agg(c.email) as contact_emails
    FROM orders o
    LEFT JOIN contacts c ON c.id = ANY(o.contact_ids)
    WHERE o.user_id = ${userId}
    GROUP BY o.id
    ORDER BY o.created_at DESC
  `
}

export async function saveSearchResult(userId: string, queryText: string, filters: any, contactIds: number[]) {
  const sql = getDatabase()
  const result = await sql`
    INSERT INTO search_results (user_id, query_text, filters, result_count, contact_ids)
    VALUES (${userId}, ${queryText}, ${JSON.stringify(filters)}, ${contactIds.length}, ${contactIds})
    RETURNING *
  `
  return result[0]
}

export async function getSearchResultsByUserId(userId: string) {
  const sql = getDatabase()
  return await sql`
    SELECT * FROM search_results 
    WHERE user_id = ${userId}
    ORDER BY created_at DESC
    LIMIT 50
  `
}

export async function getOrderById(orderId: number) {
  const sql = getDatabase()
  const result = await sql`
    SELECT * FROM orders WHERE id = ${orderId} AND status = 'completed'
  `
  return result[0]
}

export async function getContactsByIds(contactIds: number[]) {
  const sql = getDatabase()
  return await sql`
    SELECT * FROM contacts WHERE id = ANY(${contactIds})
    ORDER BY name ASC
  `
}
