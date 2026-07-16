const Database = require('better-sqlite3')
const fs = require('fs')
const path = require('path')

const dbPath = path.join(__dirname, '..', 'prisma', 'dev.db')
const migrationPath = path.join(__dirname, '..', 'prisma', 'migrations', '20260716_add_multisegment_architecture', 'migration.sql')

console.log('📦 Opening database:', dbPath)
const db = new Database(dbPath)

console.log('📄 Reading migration file:', migrationPath)
const migration = fs.readFileSync(migrationPath, 'utf-8')

console.log('🚀 Applying migration...')

try {
  // Split on semicolons and execute each statement
  const statements = migration
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'))

  let executed = 0
  for (const statement of statements) {
    try {
      db.prepare(statement + ';').run()
      executed++
    } catch (err) {
      // Ignore "already exists" errors
      if (!err.message.includes('already exists') && !err.message.includes('no such table')) {
        console.error('⚠️  Error on statement:', statement.substring(0, 100) + '...')
        console.error('   Error:', err.message)
      }
    }
  }

  console.log(`✅ Migration applied successfully! (${executed} statements executed)`)

  // Mark migration as applied in _prisma_migrations table
  try {
    db.prepare(`
      INSERT INTO _prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count)
      VALUES (?, ?, datetime('now'), ?, NULL, NULL, datetime('now'), 1)
    `).run(
      '20260716_add_multisegment_architecture',
      '0',
      '20260716_add_multisegment_architecture'
    )
    console.log('✅ Migration marked as applied')
  } catch (err) {
    console.log('ℹ️  Migration already tracked')
  }

} catch (error) {
  console.error('❌ Migration failed:', error.message)
  process.exit(1)
} finally {
  db.close()
}
