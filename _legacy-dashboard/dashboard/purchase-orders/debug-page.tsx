"use client";

import { useAuth } from '@/lib/auth-unified';
import { useEffect } from 'react';

export default function PurchaseOrdersDebugPage() {
  const { session, status, hasPermission, user } = useAuth();

  useEffect(() => {
    console.log('Purchase Orders Debug:', {
      status,
      session: !!session,
      user: !!user,
      hasReadPermission: hasPermission('READ_PURCHASE_ORDERS'),
      hasCreatePermission: hasPermission('CREATE_PURCHASE_ORDERS'),
      userPermissions: user?.permissions || [],
      pathname: window.location.pathname
    });
  }, [status, session, user, hasPermission]);

  if (status === "loading") {
    return <div>Loading authentication...</div>;
  }

  if (!session) {
    return <div>No session found - should redirect to login</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Purchase Orders Debug Page</h1>

      <div className="space-y-4">
        <div>
          <strong>Auth Status:</strong> {status}
        </div>

        <div>
          <strong>Session exists:</strong> {session ? 'Yes' : 'No'}
        </div>

        <div>
          <strong>User exists:</strong> {user ? 'Yes' : 'No'}
        </div>

        <div>
          <strong>Organization ID:</strong> {user?.organizationId || 'None'}
        </div>

        <div>
          <strong>User Permissions:</strong>
          <ul className="list-disc ml-4">
            {(user?.permissions || []).map((permission, index) => (
              <li key={index}>{permission}</li>
            ))}
          </ul>
        </div>

        <div>
          <strong>Has READ_PURCHASE_ORDERS:</strong> {hasPermission('READ_PURCHASE_ORDERS') ? 'Yes' : 'No'}
        </div>

        <div>
          <strong>Has CREATE_PURCHASE_ORDERS:</strong> {hasPermission('CREATE_PURCHASE_ORDERS') ? 'Yes' : 'No'}
        </div>

        <div>
          <strong>Current URL:</strong> {typeof window !== 'undefined' ? window.location.href : 'Server side'}
        </div>
      </div>
    </div>
  );
}