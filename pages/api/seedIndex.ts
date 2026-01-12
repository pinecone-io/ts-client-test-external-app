// Hit endpoint by sending cURL request like this (after spinning up the server: `next dev`):
// curl --location 'http://localhost:3000/api/createSeedQuery'

import type { NextApiRequest, NextApiResponse } from 'next';
import { Pinecone } from '@pinecone-database/pinecone';
import { generateRecords } from '../../helpers/helpers';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const apiKey = req.headers['pinecone_api_key'] as string;
  const indexName = req.headers['pinecone_index_name'] as string;

  if (!apiKey) {
    return res
      .status(401)
      .json({ error: 'pinecone_api_key missing in headers' });
  }
  if (!indexName) {
    return res
      .status(401)
      .json({ error: 'pinecone_index_name missing in headers' });
  }

  try {
    const pinecone = new Pinecone({ apiKey: apiKey });

    const index = pinecone.Index({ name: indexName });
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

    res
      .status(200)
      .json({ message: 'Index seeded successfully', indexName: indexName });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
