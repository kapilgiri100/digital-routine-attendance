/**
 * Sequence Manager - PostgreSQL Sequence Utilities
 * 
 * PostgreSQL SERIAL sequences NEVER reuse deleted IDs (by design).
 * This utility provides safe ways to manage sequences:
 * 1. Check current sequence state
 * 2. Reset sequences to remove gaps (CAREFUL - only after cleanup)
 * 3. View sequence info
 */

const { pool } = require('./db');

/**
 * Get info about all sequences
 */
async function listSequences() {
    try {
        const result = await pool.query(`
      SELECT 
        sequence_schema,
        sequence_name,
        data_type
      FROM information_schema.sequences
      WHERE sequence_schema = 'public'
      ORDER BY sequence_name;
    `);
        console.log('📊 All Sequences:');
        console.table(result.rows);
        return result.rows;
    } catch (err) {
        console.error('Error listing sequences:', err);
    }
}

/**
 * Get current value and max ID for a table
 */
async function checkSequenceState(tableName, idColumn = 'id') {
    try {
        // Get max current ID
        const maxResult = await pool.query(
            `SELECT MAX(${idColumn}) as max_id FROM ${tableName}`
        );
        const maxId = maxResult.rows[0]?.max_id || 0;

        // Get sequence name (PostgreSQL naming convention)
        const seqName = `${tableName}_${idColumn}_seq`;
        const seqResult = await pool.query(
            `SELECT last_value FROM ${seqName}`
        );
        const seqValue = seqResult.rows[0]?.last_value || 0;

        console.log(`\n📍 ${tableName}.${idColumn}:`);
        console.log(`   Max ID in table: ${maxId}`);
        console.log(`   Sequence value:  ${seqValue}`);
        console.log(`   Gap:             ${seqValue - maxId}`);

        return {
            table: tableName,
            column: idColumn,
            maxId,
            sequenceValue: seqValue,
            gap: seqValue - maxId
        };
    } catch (err) {
        console.error(`Error checking sequence for ${tableName}:`, err.message);
    }
}

/**
 * Reset a sequence to max ID + 1 (REMOVES GAPS)
 * ⚠️  DANGER: Only call this after ensuring no IDs above max exist
 * ⚠️  Use after full cleanup/deletion operations
 */
async function resetSequence(tableName, idColumn = 'id') {
    try {
        // Get max ID
        const maxResult = await pool.query(
            `SELECT COALESCE(MAX(${idColumn}), 0) as max_id FROM ${tableName}`
        );
        const maxId = maxResult.rows[0].max_id;
        const nextId = maxId + 1;

        // Reset sequence
        const seqName = `${tableName}_${idColumn}_seq`;
        await pool.query(
            `ALTER SEQUENCE ${seqName} RESTART WITH ${nextId}`
        );

        console.log(`\n✅ ${tableName}.${idColumn} sequence reset to ${nextId}`);
        return nextId;
    } catch (err) {
        console.error(`Error resetting sequence for ${tableName}:`, err.message);
    }
}

/**
 * Compact IDs in a table (DANGEROUS - reassigns all IDs)
 * This removes all gaps by reassigning sequential IDs
 * ⚠️  ONLY use if you understand CASCADE and foreign keys!
 */
async function compactIds(tableName, idColumn = 'id') {
    try {
        console.log(`\n⚠️  Starting ID compaction for ${tableName}...`);

        // Disable foreign key checks temporarily
        await pool.query('SET session_replication_role = REPLICA');

        // Get all IDs sorted
        const result = await pool.query(
            `SELECT ${idColumn} FROM ${tableName} ORDER BY ${idColumn}`
        );

        // Reassign IDs
        for (let i = 0; i < result.rows.length; i++) {
            const oldId = result.rows[i][idColumn];
            const newId = i + 1;

            if (oldId !== newId) {
                await pool.query(
                    `UPDATE ${tableName} SET ${idColumn} = $1 WHERE ${idColumn} = $2`,
                    [newId, oldId]
                );
            }
        }

        // Re-enable foreign key checks
        await pool.query('SET session_replication_role = DEFAULT');

        // Reset sequence
        await resetSequence(tableName, idColumn);

        console.log(`✅ ${tableName} IDs compacted successfully`);
    } catch (err) {
        // Re-enable checks on error
        await pool.query('SET session_replication_role = DEFAULT');
        console.error(`Error compacting IDs for ${tableName}:`, err.message);
    }
}

/**
 * Check all table sequences
 */
async function checkAllSequences() {
    console.log('\n' + '='.repeat(60));
    console.log('📋 SEQUENCE STATUS CHECK');
    console.log('='.repeat(60));

    const tables = [
        { table: 'users', column: 'id' },
        { table: 'subjects', column: 'id' },
        { table: 'academic_years', column: 'id' },
        { table: 'schedules', column: 'id' },
        { table: 'attendance', column: 'id' }
    ];

    const states = [];
    for (const { table, column } of tables) {
        const state = await checkSequenceState(table, column);
        if (state) states.push(state);
    }

    console.log('\n' + '='.repeat(60));
    return states;
}

/**
 * Export functions
 */
module.exports = {
    listSequences,
    checkSequenceState,
    resetSequence,
    compactIds,
    checkAllSequences
};

// CLI Usage:
// node sequence-manager.js [command] [table] [column]
// Commands:
//   list              - List all sequences
//   check [table]     - Check specific table sequence
//   check-all         - Check all table sequences
//   reset [table]     - Reset sequence (removes gaps)
//   compact [table]   - Compact IDs (DANGEROUS)

if (require.main === module) {
    const args = process.argv.slice(2);
    const command = args[0] || 'check-all';
    const table = args[1] || 'users';
    const column = args[2] || 'id';

    (async () => {
        try {
            switch (command) {
                case 'list':
                    await listSequences();
                    break;
                case 'check':
                    await checkSequenceState(table, column);
                    break;
                case 'check-all':
                    await checkAllSequences();
                    break;
                case 'reset':
                    console.log(`\n⚠️  Resetting ${table}.${column} sequence...`);
                    await resetSequence(table, column);
                    break;
                case 'compact':
                    console.log(`\n⚠️  COMPACTING IDS FOR ${table} - THIS IS DANGEROUS!`);
                    console.log('   All IDs will be reassigned sequentially.');
                    console.log('   This requires careful handling of foreign keys.\n');
                    await compactIds(table, column);
                    break;
                default:
                    console.log('Unknown command:', command);
            }
        } catch (err) {
            console.error('Error:', err.message);
        } finally {
            process.exit(0);
        }
    })();
}
