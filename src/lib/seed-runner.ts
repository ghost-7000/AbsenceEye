import { seedDatabase } from './supabase-seed';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load variables from .env.local
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

async function run() {
    console.log('Starting seed process...');
    await seedDatabase();
    console.log('Seed process finished!');
    process.exit(0);
}

run();
