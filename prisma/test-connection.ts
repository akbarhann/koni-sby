import * as fs from 'fs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const logFile = 'connection-result.txt';
    const logs: string[] = [];
    const log = (msg: string) => {
        console.log(msg);
        logs.push(msg);
    };

    log('----------------------------------------');
    log('Testing Database Connection...');
    log('----------------------------------------');

    try {
        log('Attempting to connect...');
        await prisma.$connect();
        log('✅ Successfully connected to the database server.');

        log('Running simple query (User count)...');
        const count = await prisma.user.count();
        log(`✅ Query successful. User count: ${count}`);

        fs.writeFileSync(logFile, logs.join('\n') + '\nRESULT: SUCCESS');

    } catch (error) {
        log('❌ Connection failed!');
        log(`Error details: ${error}`);
        fs.writeFileSync(logFile, logs.join('\n') + '\nRESULT: FAILURE');
    } finally {
        await prisma.$disconnect();
        log('----------------------------------------');
        log('Test finished.');
    }
}

main();
