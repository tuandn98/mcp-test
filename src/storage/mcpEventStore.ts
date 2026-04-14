import { Collection, Db, Document, MongoClient } from "mongodb"
import { McpBuyEvent, McpHttpEvent } from "../observability/mcpEvents"

const DEFAULT_DB_NAME = "tronsave_mcp"
const MCP_EVENTS_COLLECTION = "mcp_events"
const MCP_BUY_EVENTS_COLLECTION = "mcp_buy_events"

let mongoClientPromise: Promise<MongoClient> | undefined

function getMongoUri(): string | undefined {
  const uri = process.env.MONGODB_URI?.trim()
  return uri ? uri : undefined
}

async function getDb(): Promise<Db | undefined> {
  const mongoUri = getMongoUri()
  if (!mongoUri) {
    return undefined
  }

  if (!mongoClientPromise) {
    mongoClientPromise = new MongoClient(mongoUri).connect()
  }

  const client = await mongoClientPromise
  const dbName = process.env.MONGODB_DB_NAME?.trim() || DEFAULT_DB_NAME
  return client.db(dbName)
}

async function getCollection<T extends Document>(name: string): Promise<Collection<T> | undefined> {
  const db = await getDb()
  return db?.collection<T>(name)
}

export async function insertMcpEvent(event: McpHttpEvent): Promise<void> {
  const collection = await getCollection<McpHttpEvent>(MCP_EVENTS_COLLECTION)
  if (!collection) {
    return
  }
  await collection.insertOne(event)
}

export async function insertMcpBuyEvent(event: McpBuyEvent): Promise<void> {
  const collection = await getCollection<McpBuyEvent>(MCP_BUY_EVENTS_COLLECTION)
  if (!collection) {
    return
  }
  await collection.insertOne(event)
}
