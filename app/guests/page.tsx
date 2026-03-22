'use client';

import { useState, useEffect, useMemo } from 'react';

interface RSVP {
  attending: boolean;
  guestsCount: number | null;
  foodPreferences: string | null;
  allergicFood: string | null;
  updatedAt: string;
}

interface Invitation {
  id: string;
  code: string;
  status: string;
  inviteeName: string | null;
  rsvp: RSVP | null;
}

interface Group {
  id: string;
  name: string;
  description: string | null;
  tableLabel: string | null;
  invitationCodes: Invitation[];
}

function rsvpBadge(rsvp: RSVP | null) {
  if (!rsvp) return <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-500">No response</span>;
  return <span className="px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-700 font-medium">Attending</span>;
}

function foodLabel(prefs: string | null) {
  if (!prefs) return null;
  return prefs.split('|').map(p => p.startsWith('Other:') ? p.replace('Other:', '').trim() : p).filter(Boolean).join(', ');
}

export default function GuestsPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch('/api/guests')
      .then(r => r.json())
      .then(data => {
        setGroups(data.groups || []);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const toggleGroup = (id: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return groups
      .filter(g => !selectedGroupId || g.id === selectedGroupId)
      .map(g => ({
        ...g,
        // Only show attending or no-response guests (exclude declined)
        invitationCodes: g.invitationCodes.filter(inv =>
          inv.rsvp?.attending !== false &&
          (!q ||
            inv.inviteeName?.toLowerCase().includes(q) ||
            inv.code.toLowerCase().includes(q))
        ),
      }))
      .filter(g => !q || g.invitationCodes.length > 0 || g.name.toLowerCase().includes(q));
  }, [groups, search, selectedGroupId]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FBF7F0' }}>
      {/* Header */}
      <div className="sticky top-0 z-10 shadow-sm" style={{ backgroundColor: '#FBF7F0', borderBottom: '1px solid #E8D9B5' }}>
        <div className="max-w-4xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold mb-1" style={{ color: '#B18A3D' }}>Guest List</h1>
          <p className="text-sm text-gray-500 mb-3">Group & table information for your team</p>

          <div className="flex flex-col sm:flex-row gap-2">
            {/* Group dropdown */}
            <select
              value={selectedGroupId}
              onChange={e => setSelectedGroupId(e.target.value)}
              className="px-3 py-2 rounded-lg border text-sm focus:outline-none bg-white"
              style={{ borderColor: '#E8D9B5', color: selectedGroupId ? '#111' : '#9ca3af' }}
            >
              <option value="">All groups</option>
              {[...groups]
                .sort((a, b) => (b.description || '').localeCompare(a.description || ''))
                .map(g => (
                  <option key={g.id} value={g.id}>
                    {g.description ? `${g.description}:` : ''}{g.name}{g.tableLabel ? `(${g.tableLabel})` : ''}
                  </option>
                ))}
            </select>

            {/* Search */}
            <input
              type="text"
              placeholder="Search by name or code..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="flex-1 px-4 py-2 rounded-lg border text-sm focus:outline-none"
              style={{ borderColor: '#E8D9B5' }}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
        {isLoading && (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: '#B18A3D', borderTopColor: 'transparent' }} />
          </div>
        )}

        {!isLoading && filtered.length === 0 && (
          <p className="text-center text-gray-400 py-20">No groups found.</p>
        )}

        {!isLoading && filtered.map(group => {
          const attending = group.invitationCodes.filter(i => i.rsvp?.attending).length;
          const responded = group.invitationCodes.filter(i => i.rsvp).length;

          const isExpanded = expandedGroups.has(group.id);

          return (
            <div key={group.id} className="rounded-2xl overflow-hidden shadow-sm" style={{ border: '1px solid #E8D9B5', backgroundColor: '#fff' }}>
              {/* Group header */}
              <button
                className="w-full flex items-center justify-between px-5 py-4 text-left"
                style={{ backgroundColor: '#F9F3E8' }}
                onClick={() => toggleGroup(group.id)}
              >
                <div>
                  <p className="font-semibold text-gray-900">
                    {group.name}
                    {group.tableLabel && (
                      <span className="ml-2 text-sm font-normal" style={{ color: '#B18A3D' }}>Table {group.tableLabel}</span>
                    )}
                  </p>
                  {group.description && <p className="text-xs text-gray-500">{group.description}</p>}
                  <p className="text-xs mt-0.5" style={{ color: '#B18A3D' }}>
                    {responded}/{group.invitationCodes.length} responded &middot; {attending} attending
                  </p>
                </div>
                <span className="text-gray-400 ml-4">{isExpanded ? '▲' : '▼'}</span>
              </button>

              {/* Invitations */}
              {isExpanded && <div className="divide-y" style={{ borderColor: '#F0E6CC' }}>
                {group.invitationCodes.length === 0 && (
                  <p className="px-5 py-4 text-sm text-gray-400">No guests to show.</p>
                )}
                {group.invitationCodes.map(inv => (
                  <div key={inv.id} className="px-5 py-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {inv.inviteeName || <span className="text-gray-400 italic">Unnamed</span>}
                        </p>
                        <p className="text-xs text-gray-400 font-mono mt-0.5">{inv.code}</p>
                      </div>
                      <div className="flex-shrink-0">{rsvpBadge(inv.rsvp)}</div>
                    </div>

                    {inv.rsvp?.attending && (
                      <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-600">
                        {inv.rsvp.guestsCount != null && (
                          <span className="px-2 py-0.5 rounded bg-gray-100">
                            {inv.rsvp.guestsCount} guest{inv.rsvp.guestsCount !== 1 ? 's' : ''}
                          </span>
                        )}
                        {foodLabel(inv.rsvp.foodPreferences) && (
                          <span className="px-2 py-0.5 rounded bg-yellow-50 text-yellow-700">
                            {foodLabel(inv.rsvp.foodPreferences)}
                          </span>
                        )}
                        {inv.rsvp.allergicFood && (
                          <span className="px-2 py-0.5 rounded bg-orange-50 text-orange-700">
                            Note: {inv.rsvp.allergicFood}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
