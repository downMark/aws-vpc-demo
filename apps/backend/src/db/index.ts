import { GetSecretValueCommand, SecretsManagerClient } from '@aws-sdk/client-secrets-manager'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema.js'

const databaseUrl = process.env.DATABASE_URL
const client = databaseUrl ? postgres(databaseUrl) : postgres({
  host: requiredEnv('DB_HOST'),
  port: Number(process.env.DB_PORT ?? 5432),
  database: process.env.DB_NAME ?? 'github_profile',
  username: process.env.DB_USERNAME ?? 'appuser',
  password: getSecretPassword,
  ssl: 'require',
})

let cachedSecret: Promise<string> | undefined
let ready: Promise<void> | undefined
const secretsManager = new SecretsManagerClient({})

export function ensureDatabaseReady() {
  ready ??= initializeDatabase()
  return ready
}

async function initializeDatabase() {
  await client`
    CREATE EXTENSION IF NOT EXISTS pgcrypto;
  `

  await client`
    CREATE TABLE IF NOT EXISTS tokens (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      name varchar(100) NOT NULL,
      token varchar(512) NOT NULL,
      github_login varchar(100),
      created_at timestamp NOT NULL DEFAULT now(),
      updated_at timestamp NOT NULL DEFAULT now()
    );
  `

  await client`
    CREATE TABLE IF NOT EXISTS operation_logs (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      token_id uuid REFERENCES tokens(id) ON DELETE CASCADE,
      action varchar(50) NOT NULL,
      success boolean NOT NULL DEFAULT true,
      error_message text,
      created_at timestamp NOT NULL DEFAULT now()
    );
  `
}

async function getSecretPassword() {
  cachedSecret ??= readSecretPassword()
  return cachedSecret
}

async function readSecretPassword() {
  const secretArn = requiredEnv('DB_SECRET_ARN')
  const response = await secretsManager.send(new GetSecretValueCommand({ SecretId: secretArn }))
  if (!response.SecretString) {
    throw new Error('DB secret does not contain a SecretString.')
  }

  const secret = JSON.parse(response.SecretString) as { password?: string }
  if (!secret.password) {
    throw new Error('DB secret does not contain a password field.')
  }

  return secret.password
}

function requiredEnv(name: string) {
  const value = process.env[name]
  if (!value) {
    throw new Error(
      `${name} environment variable is not set. Set DATABASE_URL locally, or set DB_HOST, DB_SECRET_ARN, DB_NAME, and DB_USERNAME in Lambda.`
    )
  }

  return value
}

export const db = drizzle(client, { schema })
