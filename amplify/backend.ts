// Amplify Gen 2 Backend Configuration
// Deployment trigger: 2025-08-21 03:30 UTC - Fix import path for amplify_outputs.json
// All endpoints now working with direct DynamoDB calls
// Deployment trigger: 2025-08-21 00:20 UTC - Force new deployment

import { defineBackend } from '@aws-amplify/backend';
import { data } from './data/resource';
import { storage } from './storage/resource';

export const backend = defineBackend({
  data,
  storage,
});

