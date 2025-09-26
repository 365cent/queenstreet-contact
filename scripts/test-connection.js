#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' })
require('dotenv').config({ path: '.env' })

const { Pool } = require('pg')

async function testConnection() {
  console.log('🔍 Testing database connection...\n')

  const databaseUrl = process.env.DATABASE_URL ||
    `postgresql://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@${process.env.POSTGRES_HOST}:5432/${process.env.POSTGRES_DATABASE}`

  if (!databaseUrl || databaseUrl.includes('YOUR_PASSWORD_HERE')) {
    console.error('❌ Database connection string is invalid or contains placeholder password')
    console.log('💡 Please update your .env.local file with the correct Azure database credentials')
    return
  }

  // Determine which database we're connecting to
  const isAzure = databaseUrl.includes('newsletterpostgres.postgres.database.azure.com')
  const isNeon = databaseUrl.includes('neon.tech')

  console.log(`🔌 Connecting to: ${databaseUrl.replace(/:[^:@]{4,}@/, ':****@')}`)
  if (isAzure) console.log(`🌐 Azure PostgreSQL Database`)
  else if (isNeon) console.log(`☁️ Neon Database (AWS)`)
  else console.log(`🏠 Local Database`)
  console.log()

  const pool = new Pool({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false }
  })

  try {
    const client = await pool.connect()
    console.log('✅ Database connection successful!\n')

    // Test the materialized views
    const views = [
      'public.mv_contacts_mp_and_constituency_assistants',
      'public.mv_contacts_senators_and_staffers',
      'public.mv_provincial_legislator_contacts',
      'mv_contacts_mp_and_constituency_assistants',
      'mv_contacts_senators_and_staffers',
      'mv_provincial_legislator_contacts'
    ]

    console.log('📊 Checking materialized views:')
    for (const view of views) {
      try {
        const result = await client.query(`SELECT COUNT(*) as count FROM ${view}`)
        console.log(`   ✅ ${view}: ${result.rows[0].count.toLocaleString()} rows`)

        if (result.rows[0].count > 0) {
          // Show sample data
          const sample = await client.query(`SELECT * FROM ${view} LIMIT 1`)
          console.log(`   📋 Sample columns: ${Object.keys(sample.rows[0]).slice(0, 5).join(', ')}...`)
        }
      } catch (error) {
        console.log(`   ❌ ${view}: ${error.message}`)
      }
    }

    // List all available materialized views and tables
    console.log('\n📋 Listing available views and tables:')
    try {
      const result = await client.query(`
        SELECT schemaname, tablename, tabletype
        FROM pg_tables
        WHERE tablename LIKE '%contact%' OR tablename LIKE '%mv_%'
        ORDER BY tablename
      `)
      for (const row of result.rows) {
        console.log(`   📄 ${row.schemaname}.${row.tablename} (${row.tabletype})`)
      }
    } catch (error) {
      console.log(`   ❌ Error listing tables: ${error.message}`)
    }

    // Test filter options
    console.log('\n🔍 Testing filter options:')
    const filters = [
      { view: 'mv_contacts_mp_and_constituency_assistants', field: 'person_type' },
      { view: 'mv_contacts_mp_and_constituency_assistants', field: 'province' },
      { view: 'mv_contacts_mp_and_constituency_assistants', field: 'political_party' },
      { view: 'mv_contacts_senators_and_staffers', field: 'person_type' },
      { view: 'mv_contacts_senators_and_staffers', field: 'senator_province' },
      { view: 'mv_contacts_senators_and_staffers', field: 'senator_affiliation' }
    ]

    for (const filter of filters) {
      try {
        const result = await client.query(`
          SELECT DISTINCT TRIM(COALESCE(${filter.field}::text, '')) AS val
          FROM ${filter.view}
          WHERE COALESCE(${filter.field}::text, '') <> ''
          LIMIT 5
        `)
        console.log(`   ✅ ${filter.field}: ${result.rows.map(r => r.val).join(', ')}`)
      } catch (error) {
        console.log(`   ❌ ${filter.field}: ${error.message}`)
      }
    }

    client.release()
    console.log('\n🎉 All tests completed successfully!')
    console.log('💡 Your filter options should now load from the real database data')

  } catch (error) {
    console.error('❌ Database connection failed:', error.message)
    console.log('\n💡 Please check:')
    console.log('   1. Your Azure database is running')
    console.log('   2. Your credentials in .env.local are correct')
    console.log('   3. Your IP address is allowed to connect to Azure database')
  } finally {
    await pool.end()
  }
}

testConnection()
