# Content Moderation Feature

## Overview

The content moderation feature automatically checks reward descriptions for explicit or inappropriate content using OpenAI's language models. When explicit content is detected, the system shows a warning and clears the description field.

## How It Works

### 1. Content Moderation API (`/api/content-moderation`)
- Uses OpenAI to analyze reward descriptions
- Checks for various categories of inappropriate content:
  - Sexual content or innuendos
  - Violence or threats
  - Hate speech or discrimination
  - Profanity or vulgar language (including mild profanity)
  - Drug or alcohol references (including beer, wine, liquor)
  - Scam or fraudulent content
  - Inappropriate humor or offensive jokes
  - Any content not suitable for all ages

### 2. Integration Points

#### Reward Creation (`/api/business/rewards` - POST)
- Checks content moderation before creating new rewards
- Returns error with `isExplicit: true` if inappropriate content is detected
- Clears the description field and shows warning

#### Reward Editing (`/api/business/rewards` - PUT)
- Checks content moderation when updating reward descriptions
- Same error handling as creation

### 3. Frontend Integration

#### CreateRewardForm Component
- Displays red border around description field when explicit content is detected
- Shows error message: "Sorry, it looks like there is explicit content in this reward"
- Automatically clears the description field
- Error state is cleared when user starts typing again

#### EditRewardForm Component
- Same functionality as CreateRewardForm
- Handles explicit content errors during reward updates

## Testing

### Test Endpoint (`/api/test-content-moderation`)
- GET: Runs automated tests with sample content
- POST: Test specific content manually

### Sample Test Cases
- ✅ "Get a free coffee with any purchase" → SAFE
- ✅ "Buy one get one free on all drinks" → SAFE
- ✅ "20% off your next visit" → SAFE
- ❌ "Free beer with any meal" → EXPLICIT
- ❌ "Get a free coffee and don't be a jerk" → EXPLICIT

## Error Handling

- If content moderation API fails, the system proceeds with reward creation/editing
- Logs warnings when moderation fails
- Graceful degradation ensures the feature doesn't break the core functionality

## Configuration

The feature uses the same OpenAI configuration as other AI features in the app:
- Environment variables: `OPENAI_API_KEY` or `OPENAI_PROJECT_KEY`
- AWS Secrets Manager fallback
- Automatic model fallback (gpt-4o → gpt-4-turbo → gpt-3.5-turbo)

## User Experience

1. User enters reward description
2. System automatically checks content when form is submitted
3. If explicit content is detected:
   - Red border appears around description field
   - Error message is displayed
   - Description field is cleared
   - User must enter appropriate content to proceed
4. If content is appropriate, reward is created/updated normally 