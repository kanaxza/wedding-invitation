'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/Card';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { siteConfig } from '@/lib/siteConfig';

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
  groupName?: string;
  inviteeName?: string;
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
  inviteeName: string | null;
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
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingInvitations, setIsLoadingInvitations] = useState(false);
  const [isLoadingGroups, setIsLoadingGroups] = useState(false);
  const [invitationsLoaded, setInvitationsLoaded] = useState(false);
  const [groupsLoaded, setGroupsLoaded] = useState(false);
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
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isTogglingStatus, setIsTogglingStatus] = useState<string | null>(null);
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [isUpdatingGroup, setIsUpdatingGroup] = useState(false);
  const [isDeletingGroup, setIsDeletingGroup] = useState(false);
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
  const [alertModal, setAlertModal] = useState<{ title: string; message: string; type: 'error' | 'success' | 'info'; onClose?: () => void } | null>(null);
  const [createInvitationModal, setCreateInvitationModal] = useState(false);
  const inviteeNameInputRef = useRef<HTMLInputElement>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<{
    success: boolean;
    successCount: number;
    errorCount: number;
    errors: Array<{ row: number; code?: string; inviteeName: string; error: string }>;
    imported: Array<{ code: string; inviteeName: string; groupName: string }>;
    errorLog?: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [rsvpModal, setRsvpModal] = useState<{ invitation: Invitation; rsvp: RSVP | null } | null>(null);
  const [rsvpFormData, setRsvpFormData] = useState({
    phone: '',
    attending: true,
    guestsCount: 1,
    foodPreferences: [] as string[],
    otherFood: '',
    allergicFood: '',
  });
  const [isSubmittingRsvp, setIsSubmittingRsvp] = useState(false);
  const [deleteRsvpConfirm, setDeleteRsvpConfirm] = useState<{ rsvpId: string; inviteeName: string } | null>(null);
  const [isDeletingRsvp, setIsDeletingRsvp] = useState(false);

  const showAlert = (message: string, type: 'error' | 'success' | 'info' = 'error', title?: string, onClose?: () => void) => {
    setAlertModal({
      title: title || (type === 'error' ? 'Error' : type === 'success' ? 'Success' : 'Information'),
      message,
      type,
      onClose
    });
  };

  useEffect(() => {
    checkAuth();
  }, []);

  // Load groups and invitations data after authentication
  useEffect(() => {
    if (isAuthenticated) {
      // Start loading invitations and groups in background
      loadInvitations();
      loadGroups();
    }
  }, [isAuthenticated]);

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
        await loadSummaryData();
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadSummaryData = async () => {
    setIsRefreshing(true);
    try {
      const summaryRes = await fetch('/api/admin/summary', { credentials: 'include' });

      if (summaryRes.ok) {
        const data = await summaryRes.json();
        setSummary(data.summary);
        setRsvps(data.rsvps);
      } else {
        console.error('Summary fetch failed:', summaryRes.status);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Failed to load summary data:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const loadInvitations = async (forceReload = false) => {
    if (invitationsLoaded && !forceReload) return;
    setIsLoadingInvitations(true);
    try {
      const invitationsRes = await fetch('/api/admin/invitations', { credentials: 'include' });
      if (invitationsRes.ok) {
        const data = await invitationsRes.json();
        setInvitations(data.invitations);
        setInvitationsLoaded(true);
      }
    } catch (error) {
      console.error('Failed to load invitations:', error);
    } finally {
      setIsLoadingInvitations(false);
    }
  };

  const loadGroups = async () => {
    if (groupsLoaded) return;
    setIsLoadingGroups(true);
    try {
      const groupsRes = await fetch('/api/admin/groups', { credentials: 'include' });
      if (groupsRes.ok) {
        const data = await groupsRes.json();
        setGroups(data.groups);
        setGroupsLoaded(true);
      }
    } catch (error) {
      console.error('Failed to load groups:', error);
    } finally {
      setIsLoadingGroups(false);
    }
  };

  const loadData = async () => {
    setIsRefreshing(true);
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
        setInvitationsLoaded(true);
      }

      if (groupsRes.ok) {
        const data = await groupsRes.json();
        setGroups(data.groups);
        setGroupsLoaded(true);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setIsRefreshing(false);
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
        setCreateError('');
        // Keep groupId for next entry
        // Show success message briefly
        showAlert('Invitation code created successfully!', 'success', 'Success');
        // Focus the invitee name input for quick next entry
        setTimeout(() => inviteeNameInputRef.current?.focus(), 100);
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
    
    setIsTogglingStatus(id);
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
    } finally {
      setIsTogglingStatus(null);
    }
  };

  const handleEditName = async (id: string) => {
    if (!editInviteeName.trim()) {
      showAlert('Invitee name cannot be empty');
      return;
    }

    setIsUpdating(true);
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
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async (id: string, code: string, inviteeName: string) => {
    setDeleteConfirm({ id, code, inviteeName });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;

    setIsDeleting(true);
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
      setIsDeleting(false);
      setDeleteConfirm(null);
    }
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupInput.trim()) return;

    setIsCreatingGroup(true);
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
    } finally {
      setIsCreatingGroup(false);
    }
  };

  const handleEditGroup = async (id: string) => {
    if (!editGroupNameInput.trim()) {
      showAlert('Group name cannot be empty');
      return;
    }

    setIsUpdatingGroup(true);
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
    } finally {
      setIsUpdatingGroup(false);
    }
  };

  const handleDeleteGroup = async (id: string, groupName: string) => {
    setDeleteGroupConfirm({ id, groupName });
  };

  const confirmDeleteGroup = async () => {
    if (!deleteGroupConfirm) return;

    setIsDeletingGroup(true);
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
      setIsDeletingGroup(false);
      setDeleteGroupConfirm(null);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const response = await fetch('/api/admin/invitations/template', {
        credentials: 'include',
      });

      if (!response.ok) {
        showAlert('Failed to download template');
        return;
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'invitation_codes_template.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      showAlert('Failed to download template');
    }
  };

  const handleImportCSV = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setImportResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/admin/invitations/import', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      const data = await response.json();

      if (response.ok) {
        // Generate error log
        let errorLog = '';
        if (data.errors && data.errors.length > 0) {
          errorLog = `Import Errors (${data.errorCount} total):\n\n`;
          data.errors.forEach((err: any) => {
            errorLog += `Row ${err.row}: ${err.inviteeName || 'N/A'} - ${err.error}\n`;
            if (err.code) errorLog += `  Code: ${err.code}\n`;
          });
        }

        setImportResult({
          ...data,
          errorLog
        });
        
        if (data.successCount > 0) {
          await loadInvitations();
        }
      } else {
        showAlert(data.error || 'Failed to import CSV');
      }
    } catch (error) {
      showAlert('Failed to import CSV');
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const openRsvpModal = (invitation: Invitation) => {
    setRsvpModal({ invitation, rsvp: invitation.rsvp });
    if (invitation.rsvp) {
      // Parse existing RSVP data
      const foodPrefsArray = invitation.rsvp.foodPreferences 
        ? invitation.rsvp.foodPreferences.split('|').filter(p => !p.startsWith('Other:')) 
        : [];
      const otherMatch = invitation.rsvp.foodPreferences 
        ? invitation.rsvp.foodPreferences.split('|').find(p => p.startsWith('Other:')) 
        : '';
      
      setRsvpFormData({
        phone: invitation.rsvp.phone || '',
        attending: invitation.rsvp.attending,
        guestsCount: invitation.rsvp.guestsCount || 1,
        foodPreferences: foodPrefsArray,
        otherFood: otherMatch ? otherMatch.replace('Other:', '') : '',
        allergicFood: invitation.rsvp.allergicFood || '',
      });
    } else {
      setRsvpFormData({
        phone: '',
        attending: true,
        guestsCount: 1,
        foodPreferences: [],
        otherFood: '',
        allergicFood: '',
      });
    }
  };

  const handleSubmitRsvp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rsvpModal) return;

    setIsSubmittingRsvp(true);
    try {
      // Build food preferences string (same as invitee form)
      const foodPrefsArray = [...rsvpFormData.foodPreferences];
      if (rsvpFormData.otherFood.trim()) {
        foodPrefsArray.push(`Other:${rsvpFormData.otherFood.trim()}`);
      }
      const foodPreferencesStr = foodPrefsArray.length > 0 ? foodPrefsArray.join('|') : undefined;

      const endpoint = '/api/admin/rsvp';
      const method = rsvpModal.rsvp ? 'PUT' : 'POST';
      const body = rsvpModal.rsvp
        ? { 
            rsvpId: rsvpModal.rsvp.id,
            phone: rsvpFormData.phone.trim() || '-',
            attending: rsvpFormData.attending,
            guestsCount: rsvpFormData.attending ? (rsvpFormData.guestsCount || 1) : null,
            foodPreferences: foodPreferencesStr,
            allergicFood: rsvpFormData.allergicFood.trim() || undefined,
          }
        : { 
            invitationCodeId: rsvpModal.invitation.id,
            phone: rsvpFormData.phone.trim() || '-',
            attending: rsvpFormData.attending,
            guestsCount: rsvpFormData.attending ? (rsvpFormData.guestsCount || 1) : null,
            foodPreferences: foodPreferencesStr,
            allergicFood: rsvpFormData.allergicFood.trim() || undefined,
          };

      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        credentials: 'include',
      });

      if (response.ok) {
        await loadData();
        showAlert(
          rsvpModal.rsvp ? 'RSVP updated successfully' : 'RSVP created successfully',
          'success',
          undefined,
          () => setRsvpModal(null)
        );
      } else {
        const data = await response.json();
        showAlert(data.error || 'Failed to save RSVP');
      }
    } catch (error) {
      showAlert('An error occurred. Please try again.');
    } finally {
      setIsSubmittingRsvp(false);
    }
  };

  const handleDeleteRsvp = async (rsvpId: string, inviteeName: string) => {
    setDeleteRsvpConfirm({ rsvpId, inviteeName });
  };

  const confirmDeleteRsvp = async () => {
    if (!deleteRsvpConfirm) return;

    setIsDeletingRsvp(true);
    try {
      const response = await fetch(`/api/admin/rsvp?rsvpId=${deleteRsvpConfirm.rsvpId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        await loadData();
        showAlert('RSVP deleted successfully', 'success', undefined, () => {
          setDeleteRsvpConfirm(null);
          setRsvpModal(null);
        });
      } else {
        const data = await response.json();
        showAlert(data.error || 'Failed to delete RSVP');
      }
    } catch (error) {
      showAlert('An error occurred. Please try again.');
    } finally {
      setIsDeletingRsvp(false);
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
      {/* Loading Overlay */}
      {isLoadingInvitations && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-4 shadow-lg">
          <div className="max-w-7xl mx-auto flex items-center justify-center gap-3">
            <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span className="font-medium">Refreshing invitations...</span>
          </div>
        </div>
      )}
      
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <button
              onClick={loadData}
              disabled={isRefreshing}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Refresh data"
            >
              <svg className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
            {isRefreshing && (
              <span className="text-sm text-gray-500 animate-pulse">Refreshing...</span>
            )}
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => router.push('/')}>
              View Site
            </Button>
            <Button 
              onClick={handleLogout}
              className="bg-gradient-to-br from-[#C99A4D] via-[#A67C38] to-[#8B6B29] text-white hover:from-[#D4A857] hover:via-[#B18A3D] hover:to-[#9A7330] active:from-[#A67C38] active:to-[#7A5F25] relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/40 before:via-transparent before:to-black/20 before:transition-opacity after:absolute after:inset-0 after:bg-[linear-gradient(110deg,transparent_25%,rgba(255,255,255,0.3)_50%,transparent_75%)] after:translate-x-[-200%] hover:after:translate-x-[200%] after:transition-transform after:duration-700"
            >
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Stats */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">Responses / Invitees</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {summary.totalResponses} / {invitations.length}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {invitations.length > 0 ? Math.round((summary.totalResponses / invitations.length) * 100) : 0}%
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
                  <p className="text-xs text-gray-500 mt-1">
                    {invitations.length > 0 ? Math.round((summary.attending / invitations.length) * 100) : 0}%
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">Total Guests</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {summary.totalGuests} / {siteConfig.event.maxGuests}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {Math.round((summary.totalGuests / siteConfig.event.maxGuests) * 100)}%
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
                  <p className="text-xs text-gray-500 mt-1">
                    {invitations.length > 0 ? Math.round((summary.notAttending / invitations.length) * 100) : 0}%
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Invitation Codes List */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Invitation List ({invitations.filter(inv => {
                const matchesGroup = filterGroup === 'all' || inv.group.name === filterGroup;
                const matchesName = filterInviteeName === '' || (inv.inviteeName?.toLowerCase().includes(filterInviteeName.toLowerCase()) ?? false);
                const matchesRsvp = filterRsvpStatus === 'all' || 
                  (filterRsvpStatus === 'attending' && inv.rsvp?.attending) ||
                  (filterRsvpStatus === 'not-attending' && inv.rsvp && !inv.rsvp.attending) ||
                  (filterRsvpStatus === 'no-response' && !inv.rsvp);
                return matchesGroup && matchesName && matchesRsvp;
              }).length})</CardTitle>
              <div className="flex gap-2">
                <Button
                  onClick={() => setCreateInvitationModal(true)}
                  className="bg-gradient-to-br from-[#C99A4D] via-[#A67C38] to-[#8B6B29] text-white hover:from-[#D4A857] hover:via-[#B18A3D] hover:to-[#9A7330]"
                >
                  + Add Invitation
                </Button>
                <Button
                  variant="outline"
                  onClick={handleExport}
                  disabled={isExporting}
                >
                  {isExporting ? <LoadingSpinner size="sm" /> : 'Export CSV'}
                </Button>
              </div>
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
              {isLoadingInvitations ? (
                <div className="flex justify-center items-center py-12">
                  <LoadingSpinner />
                </div>
              ) : (
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
                      const matchesName = filterInviteeName === '' || (inv.inviteeName?.toLowerCase().includes(filterInviteeName.toLowerCase()) ?? false);
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
                                  disabled={isUpdating}
                                  className="text-green-600 hover:text-green-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                                >
                                  {isUpdating ? (
                                    <>
                                      <LoadingSpinner size="sm" />
                                      Saving...
                                    </>
                                  ) : (
                                    'Save'
                                  )}
                                </button>
                                <button
                                  onClick={() => {
                                    setEditingId(null);
                                    setEditInviteeName('');
                                    setEditGroupId('');
                                  }}
                                  disabled={isUpdating}
                                  className="text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span>{invitation.inviteeName || '-'}</span>
                              <button
                                onClick={() => {
                                  setEditingId(invitation.id);
                                  setEditInviteeName(invitation.inviteeName || '');
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
                              onClick={() => openRsvpModal(invitation)}
                              className="text-blue-600 hover:text-blue-800 font-medium"
                            >
                              {invitation.rsvp ? 'Edit RSVP' : 'Take RSVP'}
                            </button>
                            <button
                              onClick={() => handleToggleStatus(invitation.id, invitation.status)}
                              disabled={isTogglingStatus === invitation.id}
                              className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                                invitation.status === 'active'
                                  ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                              }`}
                            >
                              {isTogglingStatus === invitation.id ? (
                                <LoadingSpinner size="sm" />
                              ) : null}
                              {invitation.status}
                            </button>
                            <button
                              onClick={() => handleDelete(invitation.id, invitation.code, invitation.inviteeName || 'Unknown')}
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
              )}
            </div>
            {(() => {
              const filteredInvitations = invitations.filter(inv => {
                const matchesGroup = filterGroup === 'all' || inv.group.name === filterGroup;
                const matchesName = filterInviteeName === '' || (inv.inviteeName?.toLowerCase().includes(filterInviteeName.toLowerCase()) ?? false);
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
                      Group
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Invitee Name
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
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {rsvp.groupName || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {rsvp.inviteeName || '-'}
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
                <Button type="submit" className="h-[42px]" disabled={isCreatingGroup}>
                  {isCreatingGroup ? <LoadingSpinner size="sm" /> : 'Add'}
                </Button>
              </div>
            </form>
            {isLoadingGroups ? (
              <div className="flex justify-center items-center py-12">
                <LoadingSpinner />
              </div>
            ) : (
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
                                disabled={isUpdatingGroup}
                                className="text-green-600 hover:text-green-800 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                              >
                                {isUpdatingGroup ? (
                                  <>
                                    <LoadingSpinner size="sm" />
                                    Saving...
                                  </>
                                ) : (
                                  'Save'
                                )}
                              </button>
                              <button
                                onClick={() => {
                                  setEditingGroupId(null);
                                  setEditGroupIdInput('');
                                  setEditGroupDescriptionInput('');
                                }}
                                disabled={isUpdatingGroup}
                                className="text-gray-600 hover:text-gray-800 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
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
            )}
            {!isLoadingGroups && groups.length > 0 && (
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
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                variant="secondary"
                className="flex-1 !bg-gradient-to-br !from-red-700 !via-red-800 !to-red-900 hover:!from-red-800 hover:!via-red-900 hover:!to-red-950"
                onClick={confirmDelete}
                disabled={isDeleting}
              >
                {isDeleting ? <LoadingSpinner size="sm" /> : 'Delete'}
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
                disabled={isDeletingGroup}
              >
                Cancel
              </Button>
              <Button
                variant="secondary"
                className="flex-1 !bg-gradient-to-br !from-red-700 !via-red-800 !to-red-900 hover:!from-red-800 hover:!via-red-900 hover:!to-red-950"
                onClick={confirmDeleteGroup}
                disabled={isDeletingGroup}
              >
                {isDeletingGroup ? <LoadingSpinner size="sm" /> : 'Delete'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Alert Modal */}
      {alertModal && (
        <div 
          className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4"
          onClick={() => {
            if (alertModal.onClose) alertModal.onClose();
            setAlertModal(null);
          }}
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
                onClick={() => {
                  if (alertModal.onClose) alertModal.onClose();
                  setAlertModal(null);
                }}
              >
                OK
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Create Invitation Modal */}
      {createInvitationModal && (
        <div 
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => {
            setCreateInvitationModal(false);
            loadInvitations(true);
          }}
        >
          <div 
            className="bg-white rounded-xl p-6 max-w-4xl w-full shadow-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-semibold text-gray-900">
                Create Invitation Codes
              </h3>
              <button
                onClick={() => {
                  setCreateInvitationModal(false);
                  loadInvitations(true);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-6">
              {/* Import Options */}
              <div className="flex gap-2 pb-4 border-b">
                <Button
                  variant="outline"
                  onClick={handleDownloadTemplate}
                  className="flex items-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download CSV Template
                </Button>
                <Button
                  onClick={handleImportCSV}
                  disabled={isImporting}
                  className="flex items-center gap-2 bg-gradient-to-br from-[#C99A4D] via-[#A67C38] to-[#8B6B29] text-white hover:from-[#D4A857] hover:via-[#B18A3D] hover:to-[#9A7330]"
                >
                  {isImporting ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  )}
                  Import from CSV
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>

              {/* Import Result Summary */}
              {importResult && (
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-gray-900">Import Summary</h4>
                    <button
                      onClick={() => setImportResult(null)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className={`p-3 rounded-lg ${importResult.successCount > 0 ? 'bg-green-100' : 'bg-gray-100'}`}>
                      <div className="text-sm font-medium text-gray-600">Success</div>
                      <div className={`text-2xl font-bold ${importResult.successCount > 0 ? 'text-green-700' : 'text-gray-400'}`}>
                        {importResult.successCount}
                      </div>
                    </div>
                    <div className={`p-3 rounded-lg ${importResult.errorCount > 0 ? 'bg-red-100' : 'bg-gray-100'}`}>
                      <div className="text-sm font-medium text-gray-600">Failed</div>
                      <div className={`text-2xl font-bold ${importResult.errorCount > 0 ? 'text-red-700' : 'text-gray-400'}`}>
                        {importResult.errorCount}
                      </div>
                    </div>
                  </div>

                  {importResult.errorLog && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-gray-700">Error Log</label>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            navigator.clipboard.writeText(importResult.errorLog!);
                            showAlert('Error log copied to clipboard!', 'success');
                          }}
                          className="text-xs"
                        >
                          Copy to Clipboard
                        </Button>
                      </div>
                      <textarea
                        readOnly
                        value={importResult.errorLog}
                        className="w-full h-40 px-3 py-2 text-xs font-mono border border-gray-300 rounded-lg bg-white resize-none"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Create Form */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Add Single Invitation</h4>
                <form onSubmit={handleCreateCode} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                    <Input
                      label="Invitation Code (Optional)"
                      placeholder="Leave empty to auto-generate"
                      value={newCode}
                      onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                      error={createError}
                      disabled={isCreating}
                    />
                  </div>
                  <Button type="submit" disabled={isCreating} className="h-[42px] w-full md:w-auto">
                    {isCreating ? <LoadingSpinner size="sm" /> : '+ Add Invitation Code'}
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* RSVP Modal */}
      {rsvpModal && (
        <div 
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setRsvpModal(null)}
        >
          <div 
            className="bg-white rounded-xl p-6 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {rsvpModal.rsvp ? 'Edit RSVP' : 'Take RSVP'}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  For: {rsvpModal.invitation.inviteeName || 'Unknown'} ({rsvpModal.invitation.code})
                </p>
              </div>
              <button
                onClick={() => setRsvpModal(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmitRsvp} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Will You Attend? *
                </label>
                <select
                  value={rsvpFormData.attending.toString()}
                  onChange={(e) => setRsvpFormData({ 
                    ...rsvpFormData, 
                    attending: e.target.value === 'true',
                    guestsCount: e.target.value === 'true' ? 1 : 1,
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#B18A3D] focus:border-transparent"
                >
                  <option value="true">Attending</option>
                  <option value="false">Not Attending</option>
                </select>
              </div>

              {rsvpFormData.attending && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Number of Guests *
                    </label>
                    <select
                      value={rsvpFormData.guestsCount.toString()}
                      onChange={(e) => setRsvpFormData({ ...rsvpFormData, guestsCount: parseInt(e.target.value) || 1 })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#B18A3D] focus:border-transparent"
                    >
                      <option value="1">1 person</option>
                      <option value="2">2 people</option>
                      <option value="3">3 people</option>
                      <option value="4">4 people</option>
                      <option value="5">5 people</option>
                    </select>
                  </div>

                  {/* Dietary Restrictions */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Dietary Restrictions (Optional)
                    </label>
                    <p className="text-xs text-gray-500 mb-3">
                      Please let us know if you have any dietary restrictions
                    </p>
                    
                    <div className="space-y-2">
                      {[
                        { value: 'halalFood', label: 'Halal Food' },
                        { value: 'vegetarianFood', label: 'Vegetarian Food' },
                        { value: 'nonBeef', label: 'Non-Beef' },
                      ].map((pref) => (
                        <label key={pref.value} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={rsvpFormData.foodPreferences.includes(pref.value)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setRsvpFormData({
                                  ...rsvpFormData,
                                  foodPreferences: [...rsvpFormData.foodPreferences, pref.value],
                                });
                              } else {
                                setRsvpFormData({
                                  ...rsvpFormData,
                                  foodPreferences: rsvpFormData.foodPreferences.filter(p => p !== pref.value),
                                });
                              }
                            }}
                            className="w-4 h-4 text-[#B18A3D] border-gray-300 rounded focus:ring-[#B18A3D]"
                          />
                          <span className="text-sm text-gray-700">{pref.label}</span>
                        </label>
                      ))}
                      
                      {/* Other with text input */}
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={rsvpFormData.otherFood !== ''}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setRsvpFormData({ ...rsvpFormData, otherFood: ' ' });
                              } else {
                                setRsvpFormData({ ...rsvpFormData, otherFood: '' });
                              }
                            }}
                            className="w-4 h-4 text-[#B18A3D] border-gray-300 rounded focus:ring-[#B18A3D]"
                          />
                          <span className="text-sm text-gray-700">Other</span>
                        </label>
                        {rsvpFormData.otherFood !== '' && (
                          <input
                            type="text"
                            value={rsvpFormData.otherFood === ' ' ? '' : rsvpFormData.otherFood}
                            onChange={(e) => {
                              const value = e.target.value.slice(0, 200);
                              setRsvpFormData({ ...rsvpFormData, otherFood: value || ' ' });
                            }}
                            placeholder="Please specify..."
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#B18A3D] focus:border-transparent"
                          />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Allergic Food */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Allergic Food (Optional)
                    </label>
                    <textarea
                      value={rsvpFormData.allergicFood}
                      onChange={(e) => {
                        const value = e.target.value.slice(0, 200);
                        setRsvpFormData({ ...rsvpFormData, allergicFood: value });
                      }}
                      placeholder="Any food allergies?"
                      rows={2}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#B18A3D] focus:border-transparent resize-none"
                    />
                    <p className="text-xs text-gray-400 text-right">
                      {rsvpFormData.allergicFood.length}/200
                    </p>
                  </div>
                </>
              )}

              <div className="flex gap-3 pt-4">
                {rsvpModal.rsvp && (
                  <Button
                    type="button"
                    variant="secondary"
                    className="flex-1 !bg-gradient-to-br !from-red-700 !via-red-800 !to-red-900 hover:!from-red-800 hover:!via-red-900 hover:!to-red-950"
                    onClick={() => handleDeleteRsvp(rsvpModal.rsvp!.id, rsvpModal.invitation.inviteeName || 'Unknown')}
                  >
                    Delete RSVP
                  </Button>
                )}
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setRsvpModal(null)}
                  disabled={isSubmittingRsvp}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={isSubmittingRsvp}
                >
                  {isSubmittingRsvp ? <LoadingSpinner size="sm" /> : (rsvpModal.rsvp ? 'Update RSVP' : 'Create RSVP')}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete RSVP Confirmation Modal */}
      {deleteRsvpConfirm && (
        <div 
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setDeleteRsvpConfirm(null)}
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
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Delete RSVP</h3>
              <p className="text-gray-600 mb-1">
                Are you sure you want to delete the RSVP for
              </p>
              <p className="text-lg font-bold text-gray-900">
                "{deleteRsvpConfirm.inviteeName}"?
              </p>
              <p className="text-sm text-red-600 mt-2">
                This action cannot be undone.
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setDeleteRsvpConfirm(null)}
                disabled={isDeletingRsvp}
              >
                Cancel
              </Button>
              <Button
                variant="secondary"
                className="flex-1 !bg-gradient-to-br !from-red-700 !via-red-800 !to-red-900 hover:!from-red-800 hover:!via-red-900 hover:!to-red-950"
                onClick={confirmDeleteRsvp}
                disabled={isDeletingRsvp}
              >
                {isDeletingRsvp ? <LoadingSpinner size="sm" /> : 'Delete'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
