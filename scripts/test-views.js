#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' })
require('dotenv').config({ path: '.env' })

const { Pool } = require('pg')

async function testViews() {
  console.log('🔍 Testing Azure database views...\n')

  const databaseUrl = 'postgresql://maxwell_reader:b@SNTbN!^esWs(0@newsletterpostgres.postgres.database.azure.com:5432/postgres'

  console.log(`🔌 Connecting to: ${databaseUrl.replace(/:[^:@]{4,}@/, ':****@')}`)

  const pool = new Pool({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false }
  })

  try {
    const client = await pool.connect()
    console.log('✅ Database connection successful!\n')

    // Test each view
    const views = [
      'public.mv_contacts_mp_and_constituency_assistants',
      'public.mv_contacts_senators_and_staffers',
      'public.mv_provincial_legislator_contacts'
    ]

    // Also list all available tables and views
    console.log('\n📋 Listing all tables and views in database:')
    try {
      const result = await client.query(`
        SELECT schemaname, tablename
        FROM pg_tables
        WHERE schemaname = 'public'
        ORDER BY tablename
      `)
      for (const row of result.rows) {
        console.log(`   📄 ${row.schemaname}.${row.tablename}`)
      }

      if (result.rows.length === 0) {
        console.log('   📭 No public tables or views found')
      }
    } catch (error) {
      console.log(`   ❌ Error listing tables: ${error.message}`)
    }

    console.log('📊 Checking materialized views:')
    for (const view of views) {
      try {
        console.log(`\n🔍 Testing view: ${view}`)

        // Check if view exists
        const result = await client.query(`
          SELECT EXISTS (
            SELECT 1 FROM information_schema.tables
            WHERE table_schema = 'public' AND table_name = '${view.replace('public.', '')}'
          ) as exists
        `)

        if (result.rows[0].exists) {
          console.log(`   ✅ View exists: ${view}`)

          // Get column information
          const columns = await client.query(`
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns
            WHERE table_schema = 'public' AND table_name = '${view.replace('public.', '')}'
            ORDER BY ordinal_position
          `)

          console.log(`   📋 Columns (${columns.rows.length}):`)
          for (const col of columns.rows.slice(0, 10)) { // Show first 10 columns
            console.log(`      - ${col.column_name} (${col.data_type}, ${col.is_nullable})`)
          }

          if (columns.rows.length > 10) {
            console.log(`      ... and ${columns.rows.length - 10} more columns`)
          }

          // Test a simple query
          const countResult = await client.query(`SELECT COUNT(*) as count FROM ${view}`)
          console.log(`   📊 Row count: ${countResult.rows[0].count.toLocaleString()}`)

          // Test person_type column
          if (columns.rows.some(col => col.column_name === 'person_type')) {
            const personTypeResult = await client.query(`
              SELECT DISTINCT person_type, COUNT(*) as count
              FROM ${view}
              WHERE person_type IS NOT NULL AND person_type != ''
              GROUP BY person_type
              ORDER BY person_type
            `)
            console.log(`   🏷️ Person types: ${personTypeResult.rows.map(r => `${r.person_type}(${r.count})`).join(', ')}`)
          } else {
            console.log(`   ⚠️ No person_type column found`)
          }
        } else {
          console.log(`   ❌ View does not exist: ${view}`)
        }

      } catch (error) {
        console.log(`   ❌ Error testing ${view}: ${error.message}`)
      }
    }

    client.release()
    console.log('\n🎉 View testing completed!')

  } catch (error) {
    console.error('❌ Database connection failed:', error.message)
    console.log('\n💡 Please check:')
    console.log('   1. Your Azure database is running')
    console.log('   2. Your credentials are correct')
    console.log('   3. Your IP address is allowed to connect to Azure database')
  } finally {
    await pool.end()
  }
}

testViews()
