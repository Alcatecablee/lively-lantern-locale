
# API Documentation

## Authentication

All API endpoints require authentication unless otherwise specified.

### Headers
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

## Analysis Endpoints

### POST /api/analyze
Analyze uploaded code files.

**Request:**
```json
{
  "files": [
    {
      "name": "component.tsx",
      "content": "import React from 'react'...",
      "language": "typescript"
    }
  ],
  "options": {
    "includePerformance": true,
    "includeSecurity": true,
    "severity": "medium"
  }
}
```

**Response:**
```json
{
  "analysisId": "uuid",
  "results": [
    {
      "file": "component.tsx",
      "issues": [
        {
          "id": "issue-1",
          "type": "performance",
          "severity": "medium",
          "message": "Consider memoizing this component",
          "line": 15,
          "column": 8,
          "fix": {
            "canAutoFix": true,
            "description": "Wrap with React.memo"
          }
        }
      ]
    }
  ],
  "metrics": {
    "totalIssues": 1,
    "criticalIssues": 0,
    "fixableIssues": 1
  }
}
```

### POST /api/fix
Apply fixes to issues.

**Request:**
```json
{
  "analysisId": "uuid",
  "fixes": ["issue-1", "issue-2"]
}
```

**Response:**
```json
{
  "fixedFiles": [
    {
      "name": "component.tsx",
      "content": "import React, { memo } from 'react'...",
      "fixes": ["issue-1"]
    }
  ]
}
```

## User Management

### GET /api/user/profile
Get current user profile.

**Response:**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "John Doe",
  "plan": "pro",
  "usage": {
    "analysesThisMonth": 15,
    "analysesLimit": 100
  }
}
```

### PUT /api/user/profile
Update user profile.

**Request:**
```json
{
  "name": "John Smith",
  "preferences": {
    "theme": "dark",
    "notifications": true
  }
}
```

## Payment Endpoints

### POST /api/payment/create-order
Create PayPal payment order.

**Request:**
```json
{
  "plan": "pro",
  "billing": "monthly"
}
```

**Response:**
```json
{
  "orderId": "paypal-order-id",
  "approvalUrl": "https://paypal.com/approve/..."
}
```

### POST /api/payment/capture-order
Capture completed payment.

**Request:**
```json
{
  "orderId": "paypal-order-id"
}
```

## Rate Limits

- **Free users**: 10 requests per hour
- **Pro users**: 100 requests per hour
- **Enterprise**: Unlimited

## Error Responses

```json
{
  "error": {
    "code": "INVALID_REQUEST",
    "message": "The request is invalid",
    "details": "Missing required field: files"
  }
}
```

### Error Codes
- `UNAUTHORIZED`: Missing or invalid authentication
- `FORBIDDEN`: Insufficient permissions
- `RATE_LIMITED`: Too many requests
- `INVALID_REQUEST`: Malformed request
- `INTERNAL_ERROR`: Server error
