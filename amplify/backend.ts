// Amplify Gen 2 Backend Configuration
// Deployment trigger: 2025-08-20 23:50 UTC - API fixes deployed
// All endpoints now working with direct DynamoDB calls

import { defineBackend } from '@aws-amplify/backend';
import { data } from './data/resource';
import { storage } from './storage/resource';

export const backend = defineBackend({
  data,
  storage,
});

