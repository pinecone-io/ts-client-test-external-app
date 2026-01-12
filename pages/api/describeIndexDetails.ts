// Hit endpoint by sending cURL request like this (after spinning up the server: `next dev`):
// curl --location 'http://localhost:3000/api/createIndex'

import type { NextApiRequest, NextApiResponse } from 'next';
import { Pinecone } from '@pinecone-database/pinecone';

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
    const indexDescription = await pinecone.describeIndex(indexName);
    const indexStats = await index.describeIndexStats();

    res.status(200).json({
      indexName: indexName,
      indexDescription: indexDescription,
      indexStats: indexStats,
      isIndexReady:
        indexDescription.status?.state === 'Ready' &&
        indexDescription.status?.ready === true,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
