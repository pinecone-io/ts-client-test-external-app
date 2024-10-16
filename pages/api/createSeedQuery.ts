// Hit endpoint by sending cURL request like this (after spinning up the server: `next dev`):
// curl --location 'http://localhost:3000/api/createSeedQuery'

import type { NextApiRequest, NextApiResponse } from 'next';
import { Pinecone } from '@pinecone-database/pinecone';
import {
  generateRecords,
  randomIndexName,
  waitUntilReadyForQuerying,
} from '../../helpers/helpers';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Retrieve passed-in API key
  const apiKey = req.headers['pinecone_api_key'] as string;

  if (!apiKey) {
    return res.status(401).json({ error: 'API key missing in headers' });
  }

  try {
    console.log('Creating Pinecone client with API key:', apiKey);
    const pinecone = new Pinecone({ apiKey: apiKey });

    // Step 1: Generate a unique index name
    const indexName = randomIndexName('edge-test');

    // Step 2: Check if index exists by listing indexes and searching by name
    const existingIndexes = await pinecone.listIndexes();
    const indexExists = existingIndexes.indexes.some(
      (index) => index.name === indexName
    );

    // Create serverless index
    if (!indexExists) {
      await pinecone.createIndex({
        name: indexName,
        dimension: 2,
        metric: 'cosine',
        spec: {
          serverless: {
            cloud: 'aws',
            region: 'us-west-2',
          },
        },
        waitUntilReady: true,
      });
    }

    // Step 3: Seed data if index is empty
    const index = pinecone.Index(indexName);
    const stats = await index.describeIndexStats();
    if (stats.totalRecordCount === 0) {
      console.log('Index is empty; seeding data into the index...');
      const records = generateRecords({
        dimension: 2,
        quantity: 3,
        prefix: 'testRecord',
        withSparseValues: true,
        withMetadata: true,
      });
      await index.upsert(records);
    }

    await waitUntilReadyForQuerying(pinecone, indexName);

    // Step 4. Query index
    const queryResponse = await index.query({
      topK: 1,
      vector: [0.236, 0.971],
    });
    console.log('Query response = ', queryResponse);
    console.log('Index name = ', indexName);

    // Step 5. Send the query results back
    res.status(200).json({ queryResult: queryResponse, indexName: indexName });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
