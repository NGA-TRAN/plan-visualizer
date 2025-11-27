// Storage Manager Service
// Handles IndexedDB operations for plan data persistence

import { openDB, type IDBPDatabase } from 'idb'
import type { PlanData } from '../types'

const DB_NAME = 'planVisualizerDB'
const DB_VERSION = 1
const STORE_NAME = 'plans'

/**
 * Initialize IndexedDB database with schema
 */
async function initDatabase(): Promise<IDBPDatabase> {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Create object store if it doesn't exist
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, {
          keyPath: 'id',
          autoIncrement: false,
        })
        
        // Create indexes for sorting
        store.createIndex('createdAt', 'createdAt', { unique: false })
        store.createIndex('updatedAt', 'updatedAt', { unique: false })
      }
    },
  })
}

/**
 * Generate a unique ID for plan entries
 */
function generateId(): string {
  return `plan-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`
}

/**
 * Save plan data to IndexedDB
 */
export async function savePlanToStorage(
  planText: string,
  visualizationData: any
): Promise<string> {
  try {
    const db = await initDatabase()
    const id = generateId()
    const now = new Date()
    
    const planData: PlanData = {
      id,
      planText,
      visualizationData,
      createdAt: now,
      updatedAt: now,
    }
    
    await db.put(STORE_NAME, planData)
    return id
  } catch (error) {
    console.error('Failed to save plan to storage:', error)
    throw new Error('Failed to save plan data locally')
  }
}

/**
 * Load plan data from IndexedDB by ID
 */
export async function loadPlanFromStorage(id: string): Promise<PlanData | null> {
  try {
    const db = await initDatabase()
    const planData = await db.get(STORE_NAME, id)
    return planData || null
  } catch (error) {
    console.error('Failed to load plan from storage:', error)
    return null
  }
}

/**
 * List all plans from IndexedDB, sorted by creation date (newest first)
 */
export async function listPlansFromStorage(
  limit: number = 50,
  offset: number = 0
): Promise<PlanData[]> {
  try {
    const db = await initDatabase()
    const tx = db.transaction(STORE_NAME, 'readonly')
    const store = tx.store
    const index = store.index('createdAt')
    
    const plans: PlanData[] = []
    let cursor = await index.openCursor(null, 'prev') // Sort descending (newest first)
    let skipped = 0
    
    while (cursor && plans.length < limit) {
      if (skipped >= offset) {
        plans.push(cursor.value)
      } else {
        skipped++
      }
      cursor = await cursor.continue()
    }
    
    return plans
  } catch (error) {
    console.error('Failed to list plans from storage:', error)
    return []
  }
}

/**
 * Delete plan data from IndexedDB
 */
export async function deletePlanFromStorage(id: string): Promise<boolean> {
  try {
    const db = await initDatabase()
    await db.delete(STORE_NAME, id)
    return true
  } catch (error) {
    console.error('Failed to delete plan from storage:', error)
    return false
  }
}

/**
 * Clear all plan data from IndexedDB
 */
export async function clearAllPlansFromStorage(): Promise<boolean> {
  try {
    const db = await initDatabase()
    await db.clear(STORE_NAME)
    return true
  } catch (error) {
    console.error('Failed to clear plans from storage:', error)
    return false
  }
}

