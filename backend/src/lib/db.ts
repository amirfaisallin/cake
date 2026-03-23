import { MongoClient, Db } from 'mongodb'

let cachedClient: MongoClient | null = null
let cachedDb: Db | null = null
let mongoCircuitOpenUntil = 0

// Fallback keeps dev working even if env vars aren't provided.
// You can override with `MONGODB_URI` + `MONGODB_DB` in backend/.env.
const FALLBACK_URI =
  'mongodb+srv://amirfaisallinkon2_db_user:vJud10ZGDEtAYDim@tinybites.prcyth4.mongodb.net/?appName=tinyBites'
const FALLBACK_DB = 'sweet_delights'

const getMongoConfig = () => {
  const uri = process.env.MONGODB_URI || FALLBACK_URI
  const dbName = process.env.MONGODB_DB || FALLBACK_DB

  if (!uri) throw new Error('Missing MONGODB_URI (and no fallback available)')
  return { uri, dbName }
}

export async function connectToDatabase(): Promise<{ client: MongoClient; db: Db }> {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb }
  }

  // If Mongo failed recently, fail fast to avoid stacking multiple 2s waits
  // across concurrent admin/client requests.
  if (Date.now() < mongoCircuitOpenUntil) {
    throw new Error('MongoDB connection circuit is open')
  }

  const { uri, dbName } = getMongoConfig()

  // Win32/Node TLS sometimes fails against Atlas SRV URIs with strict TLS settings.
  // These options make dev-connection more tolerant. (Override via env in production.)
  const client = new MongoClient(uri, {
    tls: true,
    tlsAllowInvalidCertificates: true,
    // Fail fast so UI doesn't hang on connection attempts.
    serverSelectionTimeoutMS: 2000,
    connectTimeoutMS: 2000,
  })
  try {
    await client.connect()
  } catch (err) {
    // Open the circuit for a short time to reduce repeated connection waits.
    mongoCircuitOpenUntil = Date.now() + 5000
    throw err
  }
  const db = client.db(dbName)

  cachedClient = client
  cachedDb = db

  return { client, db }
}

