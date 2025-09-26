import { getDatabase } from "@/lib/database"

type Topline = "house" | "senate" | "provincial" | "minister"

type FilterGroups = {
  categories: string[]
  province: string[]
  party: string[]
  committee: string[]
  role: string[]
  issue: string[]
  linkedin: string[]
}

const toplineConfig: Record<Topline, { view: string; fields: { [key in keyof FilterGroups]?: string | string[] } }> = {
  house: {
    view: "public.mv_contacts_mp_and_constituency_assistants",
    fields: {
      categories: "person_type",
      province: "province",
      party: "political_party",
      committee: "committees",
      role: "person_type",
      issue: "parliamentary_offices",
    },
  },
  senate: {
    view: "public.mv_contacts_senators_and_staffers",
    fields: {
      categories: "person_type",
      province: "senator_province",
      party: "senator_affiliation",
      committee: "committees",
      role: "person_type",
      issue: "parliamentary_offices",
      linkedin: ["linkedin_url", "senator_linkedin_found", "senator_linkedin_url"],
    },
  },
  provincial: {
    view: "public.mv_provincial_legislator_contacts",
    fields: {
      categories: "person_type",
      province: "province",
      party: "party",
      committee: "committees",
      role: "person_type",
      issue: "profile_summary",
    },
  },
  minister: {
    view: "mv_contacts_mp_and_constituency_assistants",
    fields: {
      categories: "person_type",
      role: "person_type",
      province: "province",
      party: "political_party",
      committee: "committees",
      issue: "parliamentary_offices",
    },
  },
}

export async function getFilterOptions(topline: Topline | string): Promise<FilterGroups> {
  const normalizedTopline: Topline =
    (topline.toLowerCase() as Topline) in toplineConfig
      ? (topline.toLowerCase() as Topline)
      : "house"

  const config = toplineConfig[normalizedTopline]
  const filters: FilterGroups = {
    categories: [],
    province: [],
    party: [],
    committee: [],
    role: [],
    issue: [],
    linkedin: [],
  }

  console.log(`🔍 Loading filter options for: ${normalizedTopline} from ${config.view}`)

  try {
    const pool = getDatabase()

    // Test which database we're actually connected to
    try {
      const result = await pool.query('SELECT current_database(), version()')
      console.log(`🔍 Connected to database: ${result.rows[0].current_database}`)
      console.log(`🔍 Database version: ${result.rows[0].version}`)
    } catch (testError) {
      console.error('🔍 Database test query failed:', testError)
    }

    console.log(`🔍 Using database connection: ${pool ? 'SUCCESS' : 'FAILED'}`)

    // Test the database connection by running a simple query
    try {
      await pool.query('SELECT 1 as test')
      console.log('🔍 Database test query successful')
    } catch (testError) {
      console.error('🔍 Database test query failed:', testError)
    }

    // Process each filter field
    for (const [key, source] of Object.entries(config.fields)) {
      if (!source) continue
      console.log(`🔍 Processing ${key} from ${config.view}.${source}`)
      const values = await fetchDistinctValues(pool, config.view, source)
      filters[key as keyof FilterGroups] = values
      console.log(`✅ ${key}: ${values.length} options loaded`)
    }

    console.log(`🎯 Successfully loaded ${Object.values(filters).flat().length} total filter options`)
    return filters
  } catch (error) {
    console.error("❌ Failed to load filter options:", {
      topline: normalizedTopline,
      view: config.view,
      error: String(error),
    })
    throw new Error(`Database connection failed. Please check your DATABASE_URL configuration. Expected format: postgresql://username:password@hostname:port/database`)
  }
}


async function fetchDistinctValues(
  pool: ReturnType<typeof getDatabase>,
  view: string,
  sources: string | string[]
): Promise<string[]> {
  if (!pool) {
    throw new Error("Database pool is null")
  }

  const columns = Array.isArray(sources) ? sources : [sources]
  const allValues = new Set<string>()

  for (const column of columns) {
    try {
      // Try simple text extraction first
      let query = `
        SELECT DISTINCT TRIM(COALESCE(${column}::text, '')) AS val
        FROM ${view}
        WHERE COALESCE(${column}::text, '') <> '' AND COALESCE(${column}::text, '') IS NOT NULL
        LIMIT 100
      `

      let result = await pool.query(query)

      // If no results and column might contain arrays or comma-separated values, try unnesting
      if (result.rows.length === 0 && (column.includes('committee') || column.includes('issue') || column.includes('parliamentary'))) {
        query = `
          SELECT DISTINCT TRIM(unnest(string_to_array(COALESCE(${column}::text, ''), ','))) AS val
          FROM ${view}
          WHERE COALESCE(${column}::text, '') <> '' AND COALESCE(${column}::text, '') IS NOT NULL
          LIMIT 100
        `
        result = await pool.query(query)
      }

      // If still no results and it's LinkedIn related, handle boolean/logic
      if (result.rows.length === 0 && (column.includes('linkedin') || column.includes('found'))) {
        query = `
          SELECT DISTINCT
            CASE
              WHEN ${column} IS TRUE OR ${column}::text IN ('t', 'true', '1') THEN 'Has LinkedIn'
              WHEN ${column} IS FALSE OR ${column}::text IN ('f', 'false', '0') THEN 'No LinkedIn'
              WHEN ${column}::text <> '' THEN 'Has LinkedIn'
              ELSE 'No LinkedIn'
            END AS val
          FROM ${view}
          WHERE ${column} IS NOT NULL
          LIMIT 2
        `
        result = await pool.query(query)
      }

      // Process results
      for (const row of result.rows) {
        const val = row.val?.trim()
        if (val && val.length > 0 && val !== '') {
          allValues.add(val)
        }
      }

    } catch (err) {
      throw new Error(`Failed to query column ${column} in ${view}: ${String(err)}`)
    }
  }

  return Array.from(allValues)
    .filter(val => val && val.trim().length > 0)
    .map(val => val.trim())
    .sort((a, b) => a.localeCompare(b, 'en', { sensitivity: 'base' }))
}
