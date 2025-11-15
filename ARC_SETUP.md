# Arc Integration Setup

## Overview

Arc is used for workflow orchestration, particularly for:
- Monthly close workflows
- Automated rule execution
- Multi-step treasury operations

## Configuration

Set in `backend/.env`:

```env
ARC_API_KEY=your-arc-api-key
ARC_API_URL=https://api.arc.xyz/v1
```

## Arc Service

The `ArcService` provides:
- `createWorkflow()` - Create new workflows
- `executeWorkflow()` - Execute workflows
- `getWorkflowStatus()` - Check workflow status
- `createMonthlyCloseWorkflow()` - Pre-configured monthly close

## Monthly Close Workflow

Automatically includes:
1. Read onchain balances
2. ML engine analysis
3. Execute allocations
4. Execute distributions

## Usage

```typescript
import { arcService } from './services/arc';

// Create monthly close workflow
const workflow = await arcService.createMonthlyCloseWorkflow(orgId);

// Execute workflow
const result = await arcService.executeWorkflow(workflow.workflowId, { orgId });
```

## Testing

Arc integration is optional:
- ✅ App works without Arc
- ✅ Manual execution still works
- ⚠️ Automated workflows require Arc API key

## Error Handling

If Arc isn't configured:
- Workflows fail gracefully
- Manual operations still work
- Errors logged to console

