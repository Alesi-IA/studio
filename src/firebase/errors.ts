'use client';
import { getAuth, type User } from 'firebase/auth';

type SecurityRuleContext = {
  path: string;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete' | 'write';
  requestResourceData?: any;
};

interface SecurityRuleRequest {
  // Simplified auth object to avoid heavy client-side dependencies.
  auth: { uid: string | null } | null;
  method: string;
  path: string;
  resource?: {
    data: any;
  };
}

/**
 * Builds a simplified, simulated request object for the error message.
 * @param context The context of the failed Firestore operation.
 * @returns A structured request object for debugging.
 */
function buildRequestObject(context: SecurityRuleContext): SecurityRuleRequest {
  // This function is simplified to avoid complex dependencies that cause build errors.
  // The goal is to provide enough context for debugging without breaking the client build.
  return {
    auth: { uid: '(see client-side auth state)' }, 
    method: context.operation,
    path: `/databases/(default)/documents/${context.path}`,
    resource: context.requestResourceData ? { data: context.requestResourceData } : undefined,
  };
}

/**
 * Builds the final, formatted error message.
 * @param requestObject The simulated request object.
 * @returns A string containing the error message and the JSON payload.
 */
function buildErrorMessage(requestObject: SecurityRuleRequest): string {
  return `Missing or insufficient permissions: The following request was denied by Firestore Security Rules:
${JSON.stringify(requestObject, null, 2)}`;
}

/**
 * A custom error class designed for debugging Firestore permission errors.
 * It structures the error information to mimic the request object available in Security Rules.
 */
export class FirestorePermissionError extends Error {
  public readonly request: SecurityRuleRequest;

  constructor(context: SecurityRuleContext) {
    const requestObject = buildRequestObject(context);
    super(buildErrorMessage(requestObject));
    this.name = 'FirestorePermissionError';
    this.request = requestObject;
  }
}
