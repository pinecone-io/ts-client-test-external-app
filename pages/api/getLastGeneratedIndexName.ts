// api/getLastGeneratedIndexName.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getLastGeneratedIndexName } from './createSeedQuery';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const indexName = getLastGeneratedIndexName();
  if (indexName) {
    res.status(200).json({ indexName });
  } else {
    res.status(404).json({ error: 'Index name not found' });
  }
}
