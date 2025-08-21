# GraphQL Migration Guide

## Overview
This document outlines the complete migration from a mixed DynamoDB/GraphQL architecture to a unified GraphQL-based system using AWS Amplify.

## What Was Migrated

### 1. Backend Schema Updates
- **File**: `amplify/backend.js`
- **Change**: Updated from minimal schema (2 models) to comprehensive schema (9 models)
- **Models Added**:
  - `Card` (enhanced with businessId and neighborhood)
  - `CardView` (new - for tracking card views)
  - `ClaimedReward` (enhanced with businessId and delivery method)
  - `Contact` (new - for contact form submissions)
  - `Signup` (new - for business signup applications)
  - `Business` (enhanced with neighborhood detection)
  - `BusinessUser` (enhanced with password and login tracking)
  - `AdminUser` (new - for admin authentication)
  - `BusinessAnalytics` (new - for business performance tracking)

### 2. API Route Updates

#### `src/lib/aws.ts`
- **Before**: Direct DynamoDB operations using `DynamoDBClient`
- **After**: GraphQL operations using `generateClient()`
- **Functions Updated**:
  - `decrementCardQuantity()`: Now uses GraphQL queries and mutations
  - `logClaimedReward()`: Now creates records via GraphQL

#### `src/app/api/business/delete-account/route.ts`
- **Before**: Direct DynamoDB table operations with hardcoded table names
- **After**: GraphQL operations for all data models
- **Tables Replaced**:
  - `qrewards-businesses-dev` → GraphQL `Business` model
  - `qrewards-users-dev` → GraphQL `BusinessUser` model
  - `qrewards-rewards-dev` → GraphQL `Card` model
  - `qrewards-claims-dev` → GraphQL `ClaimedReward` model
  - `qrewards-analytics-dev` → GraphQL `BusinessAnalytics` model

#### `src/app/api/test-dynamodb-connection/route.ts`
- **Before**: DynamoDB connectivity testing
- **After**: GraphQL connectivity testing for all models

### 3. Backend Configuration
- **File**: `amplify/backend.ts`
- **Change**: Simplified to only include data and storage resources
- **Removed**: Custom Lambda functions and REST API endpoints

## Migration Benefits

### 1. **Unified Data Access**
- All data operations now go through a single GraphQL API
- Consistent authorization and validation across all models
- Automatic schema generation and type safety

### 2. **Simplified Architecture**
- No more hardcoded table names
- No more direct DynamoDB client management
- Centralized data access patterns

### 3. **Enhanced Features**
- Real-time subscriptions capability
- Automatic pagination and filtering
- Built-in caching and optimization

### 4. **Better Developer Experience**
- GraphQL schema introspection
- Automatic code generation
- Type-safe operations

## Deployment Steps

### 1. **Deploy Updated Backend**
```bash
./deploy-amplify.sh
```

### 2. **Verify Migration**
```bash
# Test GraphQL connectivity
curl http://localhost:3000/api/test-dynamodb-connection

# Test business operations
curl http://localhost:3000/api/admin/test-business
```

### 3. **Update Environment Variables**
Ensure your `.env.local` file has the correct GraphQL endpoint:
```env
NEXT_PUBLIC_GRAPHQL_ENDPOINT=https://your-api-id.appsync-api.us-west-1.amazonaws.com/graphql
NEXT_PUBLIC_GRAPHQL_API_KEY=your-api-key
```

## Post-Migration Tasks

### 1. **Data Migration** (if needed)
If you have existing data in the old DynamoDB tables, you may need to migrate it:
- Export data from old tables
- Transform to match new schema
- Import via GraphQL mutations

### 2. **Update Remaining References**
Search for any remaining hardcoded table references:
```bash
grep -r "qrewards-" src/
grep -r "TableName" src/
```

### 3. **Test All Features**
- Business signup and login
- Card creation and management
- Reward claiming
- Admin operations
- Analytics tracking

## Rollback Plan

If issues arise, you can rollback to the previous version:

### 1. **Restore Previous Backend**
```bash
git checkout HEAD~1 -- amplify/backend.js
git checkout HEAD~1 -- amplify/backend.ts
```

### 2. **Redeploy**
```bash
amplify push --yes
```

### 3. **Restore API Routes**
```bash
git checkout HEAD~1 -- src/lib/aws.ts
git checkout HEAD~1 -- src/app/api/business/delete-account/route.ts
git checkout HEAD~1 -- src/app/api/test-dynamodb-connection/route.ts
```

## Troubleshooting

### Common Issues

#### 1. **GraphQL Schema Mismatch**
- **Symptom**: "Field X doesn't exist on type Y" errors
- **Solution**: Ensure backend is deployed with latest schema

#### 2. **Authorization Errors**
- **Symptom**: "Not authorized" errors
- **Solution**: Check API key configuration and authorization rules

#### 3. **Missing Models**
- **Symptom**: "Cannot query field X" errors
- **Solution**: Verify all models are included in backend.js

### Debug Commands
```bash
# Check Amplify status
amplify status

# View backend configuration
cat amplify/backend-config.json

# Test GraphQL endpoint
curl -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"query":"{ __schema { types { name } } }"}' \
  YOUR_GRAPHQL_ENDPOINT
```

## Performance Considerations

### 1. **Query Optimization**
- Use specific field selection instead of selecting all fields
- Implement pagination for large datasets
- Use filters to reduce data transfer

### 2. **Caching Strategy**
- Leverage GraphQL's built-in caching
- Implement client-side caching for frequently accessed data
- Use CDN for static assets

### 3. **Monitoring**
- Monitor GraphQL query performance
- Track API usage and costs
- Set up alerts for error rates

## Future Enhancements

### 1. **Real-time Features**
- Implement GraphQL subscriptions for live updates
- Add real-time notifications
- Live dashboard updates

### 2. **Advanced Queries**
- Implement complex filtering and sorting
- Add full-text search capabilities
- Implement data aggregation queries

### 3. **Performance Improvements**
- Add query complexity analysis
- Implement query batching
- Add response compression

## Support

For issues or questions about this migration:
1. Check the troubleshooting section above
2. Review Amplify documentation
3. Check AWS AppSync console for errors
4. Review application logs for detailed error messages
