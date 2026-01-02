/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

// @ts-expect-error FIXME due to non-existing type definitions for NeDB
import Datastore from '@seald-io/nedb'

type Query = Record<string, unknown>

const normalizeQuery = (query: Query) => {
  if (query == null) {
    return query
  }

  const whereValue = (query as { $where?: unknown }).$where
  if (typeof whereValue !== 'string') {
    return query
  }

  const evaluator = new Function(`return (${whereValue})`)
  return {
    ...query,
    $where: function (this: Record<string, unknown>) {
      return evaluator.call(this)
    }
  }
}

class InMemoryCollection<T extends Record<string, unknown> = Record<string, unknown>> {
  private readonly store: Datastore<T>

  constructor (name: string) {
    this.store = new Datastore({ filename: name, inMemoryOnly: true, autoload: true })
  }

  insert (doc: T): Promise<T> {
    return new Promise((resolve, reject) => {
      this.store.insert(doc, (err: Error | null, newDoc: T) => {
        if (err) {
          reject(err)
          return
        }
        resolve(newDoc)
      })
    })
  }

  find (query: Query = {}): Promise<T[]> {
    return new Promise((resolve, reject) => {
      this.store.find(normalizeQuery(query), (err: Error | null, docs: T[]) => {
        if (err) {
          reject(err)
          return
        }
        resolve(docs)
      })
    })
  }

  findOne (query: Query): Promise<T | null> {
    return new Promise((resolve, reject) => {
      this.store.findOne(normalizeQuery(query), (err: Error | null, doc: T | null) => {
        if (err) {
          reject(err)
          return
        }
        resolve(doc ?? null)
      })
    })
  }

  update (query: Query, update: Record<string, unknown>, options: Record<string, unknown> = {}): Promise<{ modified: number, original: T[] }> {
    const normalized = normalizeQuery(query)
    return new Promise((resolve, reject) => {
      this.store.find(normalized, (findErr: Error | null, originalDocs: T[]) => {
        if (findErr) {
          reject(findErr)
          return
        }
        const multi = Boolean((options as { multi?: boolean }).multi)
        const updateOptions = {
          ...options,
          multi,
          returnUpdatedDocs: true
        }
        this.store.update(normalized, update, updateOptions, (err: Error | null, affected: number) => {
          if (err) {
            reject(err)
            return
          }
          resolve({ modified: affected, original: originalDocs })
        })
      })
    })
  }

  count (query: Query = {}): Promise<number> {
    return new Promise((resolve, reject) => {
      this.store.count(normalizeQuery(query), (err: Error | null, count: number) => {
        if (err) {
          reject(err)
          return
        }
        resolve(count)
      })
    })
  }
}

export const reviewsCollection = new InMemoryCollection('posts')
export const ordersCollection = new InMemoryCollection('orders')
