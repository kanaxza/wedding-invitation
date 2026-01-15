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
  foodPreferences: string | null;
  allergicFood: string | null;
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
  groupId: string;
  group: {
    id: string;
    name: string;
  };
  createdAt: string;
  rsvp: RSVP | null;
}

interface Group {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
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
  const [groups, setGroups] = useState<Group[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const [newCode, setNewCode] = useState('');
  const [newInviteeName, setNewInviteeName] = useState('');
  const [newGroupId, setNewGroupId] = useState('');
  const [createError, setCreateError] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editInviteeName, setEditInviteeName] = useState('');
  const [editGroupId, setEditGroupId] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; code: string; inviteeName: string } | null>(null);
  const [deleteGroupConfirm, setDeleteGroupConfirm] = useState<{ id: string; groupName: string } | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [newGroupInput, setNewGroupInput] = useState('');
  const [newGroupDescription, setNewGroupDescription] = useState('');
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [editGroupNameInput, setEditGroupIdInput] = useState('');
  const [editGroupDescriptionInput, setEditGroupDescriptionInput] = useState('');
  const [filterGroup, setFilterGroup] = useState<string>('all');
  const [filterInviteeName, setFilterInviteeName] = useState<string>('');
  const [filterRsvpStatus, setFilterRsvpStatus] = useState<string>('all');
  const [groupsPage, setGroupsPage] = useState(1);
  const [invitationsPage, setInvitationsPage] = useState(1);
  const [rsvpsPage, setRsvpsPage] = useState(1);
  const [groupsPageSize, setGroupsPageSize] = useState(10);
  const [invitationsPageSize, setInvitationsPageSize] = useState(10);
  const [rsvpsPageSize, setRsvpsPageSize] = useState(10);
  const [alertModal, setAlertModal] = useState<{ title: string; message: string; type: 'error' | 'success' | 'info' } | null>(null);
  const inviteeNameInputRef = useRef<HTMLInputElement>(null);

  const showAlert = (message: string, type: 'error' | 'success' | 'info' = 'error', title?: string) => {
    setAlertModal({
      title: title || (type === 'error' ? 'Error' : type === 'success' ? 'Success' : 'Information'),
      message,
      type
    });
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const copyInvitationUrl = async (code: string, lang: 'th' | 'en') => {
    const baseUrl = window.location.origin;
    const invitationUrl = `${baseUrl}/?code=${code}&lang=${lang}`;
    
    try {
      await navigator.clipboard.writeText(invitationUrl);
      setCopiedCode(`${code}-${lang}`);
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
      const response = await fetch('/api/admin/summary', { credentials: 'include' });
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
      const [summaryRes, invitationsRes, groupsRes] = await Promise.all([
        fetch('/api/admin/summary', { credentials: 'include' }),
        fetch('/api/admin/invitations', { credentials: 'include' }),
        fetch('/api/admin/groups', { credentials: 'include' }),
      ]);

      if (summaryRes.ok) {
        const data = await summaryRes.json();
        setSummary(data.summary);
        setRsvps(data.rsvps);
      } else {
        console.error('Summary fetch failed:', summaryRes.status);
        setIsAuthenticated(false);
      }

      if (invitationsRes.ok) {
        const data = await invitationsRes.json();
        setInvitations(data.invitations);
      }

      if (groupsRes.ok) {
        const data = await groupsRes.json();
        setGroups(data.groups);
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
        credentials: 'include',
      });

      if (response.ok) {
        // Reload the page to ensure cookie is properly set and read
        window.location.reload();
      } else {
        const data = await response.json();
        setLoginError(data.error || 'Invalid password');
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Login error:', error);
      setLoginError('Login failed. Please try again.');
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
      showAlert('Failed to export CSV');
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
          groupId: newGroupId.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setNewCode('');
        setNewInviteeName('');
        // Keep groupId for next entry
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
        showAlert('Failed to update status');
      }
    } catch (error) {
      showAlert('An error occurred. Please try again.');
    }
  };

  const handleEditName = async (id: string) => {
    if (!editInviteeName.trim()) {
      showAlert('Invitee name cannot be empty');
      return;
    }

    try {
      const response = await fetch('/api/admin/invitations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id, 
          inviteeName: editInviteeName,
          groupId: editGroupId || undefined,
        }),
      });

      if (response.ok) {
        setEditingId(null);
        setEditInviteeName('');
        setEditGroupId('');
        await loadData();
      } else {
        showAlert('Failed to update invitee name');
      }
    } catch (error) {
      showAlert('An error occurred. Please try again.');
    }
  };

  const handleDelete = async (id: string, code: string, inviteeName: string) => {
    setDeleteConfirm({ id, code, inviteeName });
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
        showAlert('Failed to delete invitation code');
      }
    } catch (error) {
      showAlert('An error occurred. Please try again.');
    } finally {
      setDeleteConfirm(null);
    }
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupInput.trim()) return;

    try {
      const response = await fetch('/api/admin/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: newGroupInput.trim(),
          description: newGroupDescription.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setNewGroupInput('');
        setNewGroupDescription('');
        setNewGroupId(data.group.id);
        await loadData();
      } else {
        showAlert(data.error || 'Failed to create group');
      }
    } catch (error) {
      showAlert('An error occurred. Please try again.');
    }
  };

  const handleEditGroup = async (id: string) => {
    if (!editGroupNameInput.trim()) {
      showAlert('Group name cannot be empty');
      return;
    }

    try {
      const response = await fetch('/api/admin/groups', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id, 
          name: editGroupNameInput.trim(),
          description: editGroupDescriptionInput.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setEditingGroupId(null);
        setEditGroupIdInput('');
        setEditGroupDescriptionInput('');
        await loadData();
      } else {
        showAlert(data.error || 'Failed to update group');
      }
    } catch (error) {
      showAlert('An error occurred. Please try again.');
    }
  };

  const handleDeleteGroup = async (id: string, groupName: string) => {
    setDeleteGroupConfirm({ id, groupName });
  };

  const confirmDeleteGroup = async () => {
    if (!deleteGroupConfirm) return;

    try {
      const response = await fetch(`/api/admin/groups?id=${deleteGroupConfirm.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        await loadData();
      } else {
        showAlert(data.error || 'Failed to delete group');
      }
    } catch (error) {
      showAlert('An error occurred. Please try again.');
    } finally {
      setDeleteGroupConfirm(null);
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Group *
                  </label>
                  <select
                    value={newGroupId}
                    onChange={(e) => setNewGroupId(e.target.value)}
                    disabled={isCreating}
                    required
                    className="w-full h-[42px] px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#B18A3D] focus:border-transparent"
                  >
                    <option value="">Select a group...</option>
                    {groups.map((group) => (
                      <option key={group.id} value={group.id}>
                        {group.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Input
                    label="Invitation Code (Optional)"
                    placeholder="Leave empty to auto-generate"
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                    error={createError}
                    disabled={isCreating}
                  />
                </div>
              </div>
              <Button type="submit" disabled={isCreating} className="h-[42px]">
                {isCreating ? <LoadingSpinner size="sm" /> : 'Create Code'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Invitation Codes List */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Invitation Codes ({invitations.filter(inv => {
                const matchesGroup = filterGroup === 'all' || inv.group.name === filterGroup;
                const matchesName = filterInviteeName === '' || (inv.note?.toLowerCase().includes(filterInviteeName.toLowerCase()) ?? false);
                const matchesRsvp = filterRsvpStatus === 'all' || 
                  (filterRsvpStatus === 'attending' && inv.rsvp?.attending) ||
                  (filterRsvpStatus === 'not-attending' && inv.rsvp && !inv.rsvp.attending) ||
                  (filterRsvpStatus === 'no-response' && !inv.rsvp);
                return matchesGroup && matchesName && matchesRsvp;
              }).length})</CardTitle>
              <Button
                variant="outline"
                onClick={handleExport}
                disabled={isExporting}
              >
                {isExporting ? <LoadingSpinner size="sm" /> : 'Export CSV'}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Filter by Group
                  </label>
                  <select
                    value={filterGroup}
                    onChange={(e) => setFilterGroup(e.target.value)}
                    className="w-full h-[42px] px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#B18A3D] focus:border-transparent"
                  >
                    <option value="all">All Groups</option>
                    {groups.map((group) => (
                      <option key={group.id} value={group.name}>
                        {group.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Filter by Name
                  </label>
                  <Input
                    placeholder="Search invitee name..."
                    value={filterInviteeName}
                    onChange={(e) => setFilterInviteeName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Filter by RSVP Status
                  </label>
                  <select
                    value={filterRsvpStatus}
                    onChange={(e) => setFilterRsvpStatus(e.target.value)}
                    className="w-full h-[42px] px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#B18A3D] focus:border-transparent"
                  >
                    <option value="all">All Status</option>
                    <option value="attending">Attending</option>
                    <option value="not-attending">Not Attending</option>
                    <option value="no-response">No Response</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      URL
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Group
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Invitee Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      RSVP Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Code
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {invitations.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                        No invitation codes yet
                      </td>
                    </tr>
                  ) : (
                    invitations.filter(inv => {
                      const matchesGroup = filterGroup === 'all' || inv.group.name === filterGroup;
                      const matchesName = filterInviteeName === '' || (inv.note?.toLowerCase().includes(filterInviteeName.toLowerCase()) ?? false);
                      const matchesRsvp = filterRsvpStatus === 'all' || 
                        (filterRsvpStatus === 'attending' && inv.rsvp?.attending) ||
                        (filterRsvpStatus === 'not-attending' && inv.rsvp && !inv.rsvp.attending) ||
                        (filterRsvpStatus === 'no-response' && !inv.rsvp);
                      return matchesGroup && matchesName && matchesRsvp;
                    })
                    .slice((invitationsPage - 1) * invitationsPageSize, invitationsPage * invitationsPageSize)
                    .map((invitation) => (
                      <tr key={invitation.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              onClick={() => copyInvitationUrl(invitation.code, 'th')}
                              className="text-sm"
                            >
                              {copiedCode === `${invitation.code}-th` ? '✓' : '🇹🇭'}
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => copyInvitationUrl(invitation.code, 'en')}
                              className="text-sm"
                            >
                              {copiedCode === `${invitation.code}-en` ? '✓' : '🇬🇧'}
                            </Button>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {invitation.group.name || '-'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {editingId === invitation.id ? (
                            <div className="flex flex-col gap-2">
                              <input
                                type="text"
                                value={editInviteeName}
                                onChange={(e) => setEditInviteeName(e.target.value)}
                                placeholder="Invitee Name"
                                className="px-2 py-1 border rounded"
                              />
                              <select
                                value={editGroupId}
                                onChange={(e) => setEditGroupId(e.target.value)}
                                className="px-2 py-1 border rounded"
                              >
                                <option value="">Select a group...</option>
                                {groups.map((group) => (
                                  <option key={group.id} value={group.id}>
                                    {group.name}
                                  </option>
                                ))}
                              </select>
                              <div className="flex gap-2">
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
                                    setEditGroupId('');
                                  }}
                                  className="text-gray-600 hover:text-gray-800"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span>{invitation.note || '-'}</span>
                              <button
                                onClick={() => {
                                  setEditingId(invitation.id);
                                  setEditInviteeName(invitation.note || '');
                                  setEditGroupId(invitation.groupId || '');
                                }}
                                className="text-blue-600 hover:text-blue-800 text-xs"
                              >
                                Edit
                              </button>
                            </div>
                          )}
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
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {invitation.code}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex items-center gap-2">
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
                            <button
                              onClick={() => handleDelete(invitation.id, invitation.code, invitation.note || 'Unknown')}
                              className="text-red-600 hover:text-red-800 font-medium"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {(() => {
              const filteredInvitations = invitations.filter(inv => {
                const matchesGroup = filterGroup === 'all' || inv.group.name === filterGroup;
                const matchesName = filterInviteeName === '' || (inv.note?.toLowerCase().includes(filterInviteeName.toLowerCase()) ?? false);
                const matchesRsvp = filterRsvpStatus === 'all' || 
                  (filterRsvpStatus === 'attending' && inv.rsvp?.attending) ||
                  (filterRsvpStatus === 'not-attending' && inv.rsvp && !inv.rsvp.attending) ||
                  (filterRsvpStatus === 'no-response' && !inv.rsvp);
                return matchesGroup && matchesName && matchesRsvp;
              });
              return filteredInvitations.length > 0 && (
                <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-sm text-gray-700">
                      Showing {((invitationsPage - 1) * invitationsPageSize) + 1} to {Math.min(invitationsPage * invitationsPageSize, filteredInvitations.length)} of {filteredInvitations.length} invitations
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="text-sm text-gray-700">Show:</label>
                      <select
                        value={invitationsPageSize}
                        onChange={(e) => {
                          setInvitationsPageSize(Number(e.target.value));
                          setInvitationsPage(1);
                        }}
                        className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-[#B18A3D] focus:border-transparent"
                      >
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setInvitationsPage(p => Math.max(1, p - 1))}
                      disabled={invitationsPage === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setInvitationsPage(p => Math.min(Math.ceil(filteredInvitations.length / invitationsPageSize), p + 1))}
                      disabled={invitationsPage >= Math.ceil(filteredInvitations.length / invitationsPageSize)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              );
            })()}
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
          <Button variant="outline" onClick={handleExport} disabled={isExporting}>
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
                      Attending
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Guests
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Food Preferences
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Allergic Food
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Updated
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Code
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {rsvps.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                        No RSVPs yet
                      </td>
                    </tr>
                  ) : (
                    rsvps
                      .slice((rsvpsPage - 1) * rsvpsPageSize, rsvpsPage * rsvpsPageSize)
                      .map((rsvp) => (
                      <tr key={rsvp.id} className="hover:bg-gray-50">
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
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {rsvp.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {rsvp.guestsCount || '-'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 max-w-xs">
                          {rsvp.foodPreferences ? (
                            <div className="space-y-1">
                              {rsvp.foodPreferences.split('|').map((pref, idx) => (
                                <div key={idx} className="text-xs bg-amber-50 text-amber-800 px-2 py-1 rounded inline-block mr-1">
                                  {pref.startsWith('Other:') ? pref : pref.replace(/([A-Z])/g, ' $1').trim()}
                                </div>
                              ))}
                            </div>
                          ) : '-'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 max-w-xs">
                          {rsvp.allergicFood ? (
                            <div className="text-xs bg-red-50 text-red-800 px-2 py-1 rounded">
                              {rsvp.allergicFood}
                            </div>
                          ) : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {new Date(rsvp.updatedAt).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {rsvp.code}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {rsvps.length > 0 && (
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-sm text-gray-700">
                    Showing {((rsvpsPage - 1) * rsvpsPageSize) + 1} to {Math.min(rsvpsPage * rsvpsPageSize, rsvps.length)} of {rsvps.length} RSVPs
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-700">Show:</label>
                    <select
                      value={rsvpsPageSize}
                      onChange={(e) => {
                        setRsvpsPageSize(Number(e.target.value));
                        setRsvpsPage(1);
                      }}
                      className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-[#B18A3D] focus:border-transparent"
                    >
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setRsvpsPage(p => Math.max(1, p - 1))}
                    disabled={rsvpsPage === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setRsvpsPage(p => Math.min(Math.ceil(rsvps.length / rsvpsPageSize), p + 1))}
                    disabled={rsvpsPage >= Math.ceil(rsvps.length / rsvpsPageSize)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Manage Groups */}
        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Manage Groups</h2>
          <Card className="mb-8">
            <CardContent>
              <form onSubmit={handleCreateGroup} className="mb-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 items-center">
                  <Input
                    placeholder="Group name..."
                    value={newGroupInput}
                    onChange={(e) => setNewGroupInput(e.target.value)}
                    required
                  />
                  <Input
                    placeholder="Description (optional)..."
                    value={newGroupDescription}
                    onChange={(e) => setNewGroupDescription(e.target.value)}
                />
                <Button type="submit" className="h-[42px]">Add</Button>
              </div>
            </form>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Group Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {groups.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                        No groups yet. Add your first group above.
                      </td>
                    </tr>
                  ) : (
                    groups
                      .slice((groupsPage - 1) * groupsPageSize, groupsPage * groupsPageSize)
                      .map((group) => (
                      <tr key={group.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {editingGroupId === group.id ? (
                            <input
                              type="text"
                              value={editGroupNameInput}
                              onChange={(e) => setEditGroupIdInput(e.target.value)}
                              className="px-2 py-1 border rounded w-full"
                              autoFocus
                            />
                          ) : (
                            <span className="font-medium">{group.name}</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {editingGroupId === group.id ? (
                            <input
                              type="text"
                              value={editGroupDescriptionInput}
                              onChange={(e) => setEditGroupDescriptionInput(e.target.value)}
                              placeholder="Description (optional)"
                              className="px-2 py-1 border rounded w-full"
                            />
                          ) : (
                            <span>{group.description || '-'}</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(group.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {editingGroupId === group.id ? (
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEditGroup(group.id)}
                                className="text-green-600 hover:text-green-800 font-medium"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => {
                                  setEditingGroupId(null);
                                  setEditGroupIdInput('');
                                  setEditGroupDescriptionInput('');
                                }}
                                className="text-gray-600 hover:text-gray-800 font-medium"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  setEditingGroupId(group.id);
                                  setEditGroupIdInput(group.name);
                                  setEditGroupDescriptionInput(group.description || '');
                                }}
                                className="text-blue-600 hover:text-blue-800 font-medium"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteGroup(group.id, group.name)}
                                className="text-red-600 hover:text-red-800 font-medium"
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {groups.length > 0 && (
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-sm text-gray-700">
                    Showing {((groupsPage - 1) * groupsPageSize) + 1} to {Math.min(groupsPage * groupsPageSize, groups.length)} of {groups.length} groups
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-700">Show:</label>
                    <select
                      value={groupsPageSize}
                      onChange={(e) => {
                        setGroupsPageSize(Number(e.target.value));
                        setGroupsPage(1);
                      }}
                      className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-[#B18A3D] focus:border-transparent"
                    >
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setGroupsPage(p => Math.max(1, p - 1))}
                    disabled={groupsPage === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setGroupsPage(p => Math.min(Math.ceil(groups.length / groupsPageSize), p + 1))}
                    disabled={groupsPage >= Math.ceil(groups.length / groupsPageSize)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        </div>
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
                Are you sure you want to delete the invitation code for
              </p>
              <p className="text-lg font-bold text-gray-900">
                "{deleteConfirm.inviteeName}"?
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

      {/* Delete Group Confirmation Modal */}
      {deleteGroupConfirm && (
        <div 
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setDeleteGroupConfirm(null)}
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
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Delete Group</h3>
              <p className="text-gray-600 mb-1">
                Are you sure you want to delete the group
              </p>
              <p className="text-lg font-bold text-gray-900">
                "{deleteGroupConfirm.groupName}"?
              </p>
              <p className="text-sm text-red-600 mt-2">
                This action cannot be undone.
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setDeleteGroupConfirm(null)}
              >
                Cancel
              </Button>
              <Button
                variant="secondary"
                className="flex-1 !bg-gradient-to-br !from-red-700 !via-red-800 !to-red-900 hover:!from-red-800 hover:!via-red-900 hover:!to-red-950"
                onClick={confirmDeleteGroup}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Alert Modal */}
      {alertModal && (
        <div 
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setAlertModal(null)}
        >
          <div 
            className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-6">
              <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-4 ${
                alertModal.type === 'error' ? 'bg-red-100' : 
                alertModal.type === 'success' ? 'bg-green-100' : 'bg-blue-100'
              }`}>
                {alertModal.type === 'error' && (
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
                {alertModal.type === 'success' && (
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
                {alertModal.type === 'info' && (
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{alertModal.title}</h3>
              <p className="text-gray-600">
                {alertModal.message}
              </p>
            </div>
            <div className="flex justify-center">
              <Button
                variant="outline"
                className="px-8"
                onClick={() => setAlertModal(null)}
              >
                OK
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
