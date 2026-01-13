'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/Card';
import { LoadingSpinner } from '@/components/LoadingSpinner';

interface RSVP {
  id: string;
  code: string;
  name: string;
  phone: string;
  attending: boolean;
  guestsCount: number | null;
  updatedAt: string;
}

interface Summary {
  totalResponses: number;
  attending: number;
  notAttending: number;
  totalGuests: number;
}

interface Invitation {
  id: string;
  code: string;
  status: string;
  note: string | null;
  createdAt: string;
  rsvp: RSVP | null;
}

export default function AdminPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [summary, setSummary] = useState<Summary | null>(null);
  const [rsvps, setRsvps] = useState<RSVP[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const [newCode, setNewCode] = useState('');
  const [newInviteeName, setNewInviteeName] = useState('');
  const [createError, setCreateError] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editInviteeName, setEditInviteeName] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; code: string } | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const inviteeNameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const copyInvitationUrl = async (code: string) => {
    const baseUrl = window.location.origin;
    const invitationUrl = `${baseUrl}/?code=${code}`;
    
    try {
      await navigator.clipboard.writeText(invitationUrl);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (error) {
      console.error('Failed to copy URL:', error);
    }
  };

  const generateRandomCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewCode(code);
  };

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/admin/summary');
      if (response.ok) {
        setIsAuthenticated(true);
        await loadData();
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadData = async () => {
    try {
      const [summaryRes, invitationsRes] = await Promise.all([
        fetch('/api/admin/summary'),
        fetch('/api/admin/invitations'),
      ]);

      if (summaryRes.ok) {
        const data = await summaryRes.json();
        setSummary(data.summary);
        setRsvps(data.rsvps);
      } else {
        setIsAuthenticated(false);
      }

      if (invitationsRes.ok) {
        const data = await invitationsRes.json();
        setInvitations(data.invitations);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (response.ok) {
        setIsAuthenticated(true);
        await loadData();
      } else {
        setLoginError('Invalid password');
      }
    } catch (error) {
      setLoginError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/admin/auth', { method: 'DELETE' });
    setIsAuthenticated(false);
    setPassword('');
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const response = await fetch('/api/admin/export.csv');
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `rsvp-export-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export CSV');
    } finally {
      setIsExporting(false);
    }
  };

  const handleCreateCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError('');
    
    if (!newInviteeName.trim()) {
      setCreateError('Invitee name is required');
      return;
    }

    // Auto-generate code if empty
    let codeToUse = newCode.trim().toUpperCase();
    if (!codeToUse) {
      // Generate unique code
      let isUnique = false;
      while (!isUnique) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let generatedCode = '';
        for (let i = 0; i < 8; i++) {
          generatedCode += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        // Check if code already exists
        if (!invitations.some(inv => inv.code === generatedCode)) {
          codeToUse = generatedCode;
          isUnique = true;
        }
      }
    }

    setIsCreating(true);
    try {
      const response = await fetch('/api/admin/invitations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: codeToUse,
          inviteeName: newInviteeName.trim(),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setNewCode('');
        setNewInviteeName('');
        await loadData();
        // Focus the invitee name input for quick next entry
        setTimeout(() => inviteeNameInputRef.current?.focus(), 0);
      } else {
        setCreateError(data.error || 'Failed to create invitation code');
      }
    } catch (error) {
      setCreateError('An error occurred. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'disabled' : 'active';
    
    try {
      const response = await fetch('/api/admin/invitations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      });

      if (response.ok) {
        await loadData();
      } else {
        alert('Failed to update status');
      }
    } catch (error) {
      alert('An error occurred. Please try again.');
    }
  };

  const handleEditName = async (id: string) => {
    if (!editInviteeName.trim()) {
      alert('Invitee name cannot be empty');
      return;
    }

    try {
      const response = await fetch('/api/admin/invitations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, inviteeName: editInviteeName }),
      });

      if (response.ok) {
        setEditingId(null);
        setEditInviteeName('');
        await loadData();
      } else {
        alert('Failed to update invitee name');
      }
    } catch (error) {
      alert('An error occurred. Please try again.');
    }
  };

  const handleDelete = async (id: string, code: string) => {
    setDeleteConfirm({ id, code });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;

    try {
      const response = await fetch(`/api/admin/invitations?id=${deleteConfirm.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await loadData();
      } else {
        alert('Failed to delete invitation code');
      }
    } catch (error) {
      alert('An error occurred. Please try again.');
    } finally {
      setDeleteConfirm(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Admin Login</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <Input
                type="password"
                label="Password"
                placeholder="Enter admin password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={loginError}
                disabled={isLoading}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? <LoadingSpinner size="sm" /> : 'Login'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => router.push('/')}>
              View Site
            </Button>
            <Button variant="secondary" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Create Invitation Code */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Create Invitation Code</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateCode} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Invitee Name *"
                  placeholder="e.g., John & Jane Smith"
                  value={newInviteeName}
                  onChange={(e) => setNewInviteeName(e.target.value)}
                  disabled={isCreating}
                  required
                  ref={inviteeNameInputRef}
                />
                <div>
                  <Input
                    label="Invitation Code (Optional)"
                    placeholder="Leave empty to auto-generate"
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                    error={createError}
                    disabled={isCreating}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={generateRandomCode}
                  >
                    Generate Random Code
                  </Button>
                </div>
              </div>
              <Button type="submit" disabled={isCreating}>
                {isCreating ? <LoadingSpinner size="sm" /> : 'Create Code'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Invitation Codes List */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Invitation Codes ({invitations.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Code
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Invitee Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      RSVP Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      URL
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {invitations.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                        No invitation codes yet
                      </td>
                    </tr>
                  ) : (
                    invitations.map((invitation) => (
                      <tr key={invitation.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {invitation.code}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {editingId === invitation.id ? (
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={editInviteeName}
                                onChange={(e) => setEditInviteeName(e.target.value)}
                                className="px-2 py-1 border rounded"
                              />
                              <button
                                onClick={() => handleEditName(invitation.id)}
                                className="text-green-600 hover:text-green-800"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => {
                                  setEditingId(null);
                                  setEditInviteeName('');
                                }}
                                className="text-gray-600 hover:text-gray-800"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span>{invitation.note || '-'}</span>
                              <button
                                onClick={() => {
                                  setEditingId(invitation.id);
                                  setEditInviteeName(invitation.note || '');
                                }}
                                className="text-blue-600 hover:text-blue-800 text-xs"
                              >
                                Edit
                              </button>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => handleToggleStatus(invitation.id, invitation.status)}
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full cursor-pointer ${
                              invitation.status === 'active'
                                ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                            }`}
                          >
                            {invitation.status}
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {invitation.rsvp ? (
                            <span className={invitation.rsvp.attending ? 'text-green-600' : 'text-red-600'}>
                              {invitation.rsvp.attending ? 'Attending' : 'Not Attending'}
                            </span>
                          ) : (
                            <span className="text-gray-400">No Response</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {new Date(invitation.createdAt).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Button
                            variant="outline"
                            onClick={() => copyInvitationUrl(invitation.code)}
                            className="text-sm"
                          >
                            {copiedCode === invitation.code ? '✓ Copied' : 'Copy'}
                          </Button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button
                            onClick={() => handleDelete(invitation.id, invitation.code)}
                            className="text-red-600 hover:text-red-800 font-medium"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Summary Stats */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">Total Responses</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {summary.totalResponses}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">Attending</p>
                  <p className="text-3xl font-bold text-green-600">
                    {summary.attending}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">Not Attending</p>
                  <p className="text-3xl font-bold text-red-600">
                    {summary.notAttending}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">Total Guests</p>
                  <p className="text-3xl font-bold text-primary-600">
                    {summary.totalGuests}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Actions */}
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">RSVPs</h2>
          <Button onClick={handleExport} disabled={isExporting}>
            {isExporting ? <LoadingSpinner size="sm" /> : 'Export CSV'}
          </Button>
        </div>

        {/* RSVP Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Code
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Attending
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Guests
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Updated
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {rsvps.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                        No RSVPs yet
                      </td>
                    </tr>
                  ) : (
                    rsvps.map((rsvp) => (
                      <tr key={rsvp.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {rsvp.code}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {rsvp.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              rsvp.attending
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {rsvp.attending ? 'Yes' : 'No'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {rsvp.guestsCount || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {new Date(rsvp.updatedAt).toLocaleString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div 
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setDeleteConfirm(null)}
        >
          <div 
            className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-6">
              <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Delete Invitation Code</h3>
              <p className="text-gray-600 mb-1">
                Are you sure you want to delete the invitation code
              </p>
              <p className="text-lg font-bold text-gray-900">
                "{deleteConfirm.code}"?
              </p>
              <p className="text-sm text-red-600 mt-2">
                This action cannot be undone.
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setDeleteConfirm(null)}
              >
                Cancel
              </Button>
              <Button
                variant="secondary"
                className="flex-1 !bg-gradient-to-br !from-red-700 !via-red-800 !to-red-900 hover:!from-red-800 hover:!via-red-900 hover:!to-red-950"
                onClick={confirmDelete}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
