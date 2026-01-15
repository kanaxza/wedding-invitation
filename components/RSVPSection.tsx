'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Section, SectionHeading } from './Section';
import { Card, CardContent } from './Card';
import { Button } from './Button';
import { Input, Select } from './Input';
import { LoadingSpinner } from './LoadingSpinner';
import { useLanguage } from '@/lib/LanguageContext';

type Step = 'code' | 'form' | 'success';

interface RSVPData {
  name: string;
  phone: string;
  attending: boolean;
  guestsCount: number | null;
  foodPreferences: string[];
  otherFood: string;
  allergicFood: string;
}

export function RSVPSection() {
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  const [step, setStep] = useState<Step>('code');
  const [code, setCode] = useState('');
  const [inviteeName, setInviteeName] = useState('');
  const [groupName, setGroupName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<RSVPData>({
    name: '',
    phone: '',
    attending: true,
    guestsCount: 0,
    foodPreferences: [],
    otherFood: '',
    allergicFood: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Auto-verify code from URL parameter
  useEffect(() => {
    const urlCode = searchParams.get('code');
    if (urlCode && !code) {
      setCode(urlCode.toUpperCase());
      // Trigger verification after setting the code
      verifyCodeFromUrl(urlCode.toUpperCase());
    }
  }, [searchParams]);

  const verifyCodeFromUrl = async (codeToVerify: string) => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/invitations/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: codeToVerify.trim() }),
      });

      const data = await response.json();

      if (data.ok && data.status === 'active') {
        const invitationResponse = await fetch(
          `/api/invitations/verify`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code: codeToVerify.trim(), includeDetails: true }),
          }
        );
        
        if (invitationResponse.ok) {
          const invitationData = await invitationResponse.json();
          setInviteeName(invitationData.inviteeName || '');
          setGroupName(invitationData.groupName || '');
        }

        const rsvpResponse = await fetch(
          `/api/rsvp?code=${encodeURIComponent(codeToVerify.trim())}`
        );
        if (rsvpResponse.ok) {
          const rsvpData = await rsvpResponse.json();
          if (rsvpData.rsvp) {
            const followerCount = rsvpData.rsvp.guestsCount ? Math.max(0, rsvpData.rsvp.guestsCount - 1) : 0;
            const foodPrefsArray = rsvpData.rsvp.foodPreferences ? rsvpData.rsvp.foodPreferences.split('|').filter((p: string) => !p.startsWith('Other:')) : [];
            const otherMatch = rsvpData.rsvp.foodPreferences ? rsvpData.rsvp.foodPreferences.split('|').find((p: string) => p.startsWith('Other:')) : '';
            setFormData({
              name: rsvpData.rsvp.name,
              phone: rsvpData.rsvp.phone,
              attending: rsvpData.rsvp.attending,
              guestsCount: followerCount,
              foodPreferences: foodPrefsArray,
              otherFood: otherMatch ? otherMatch.replace('Other:', '') : '',
              allergicFood: rsvpData.rsvp.allergicFood || '',
            });
          }
        }
        setStep('form');
      } else if (data.status === 'disabled') {
        setError('This invitation code has been deactivated. Please contact us for assistance.');
      } else {
        setError('Invalid invitation code from URL.');
      }
    } catch (err) {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const verifyCode = async () => {
    if (!code.trim()) {
      setError(t('pleaseEnterCode'));
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/invitations/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim() }),
      });

      const data = await response.json();

      if (data.ok) {
        if (data.status === 'active') {
          // Fetch invitation details to get invitee name
          const invitationResponse = await fetch(
            `/api/invitations/verify`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ code: code.trim(), includeDetails: true }),
            }
          );
          
          if (invitationResponse.ok) {
            const invitationData = await invitationResponse.json();
            setInviteeName(invitationData.inviteeName || '');
            setGroupName(invitationData.groupName || '');
          }

          // Check if RSVP already exists
          const rsvpResponse = await fetch(
            `/api/rsvp?code=${encodeURIComponent(code.trim())}`
          );
          if (rsvpResponse.ok) {
            const rsvpData = await rsvpResponse.json();
            if (rsvpData.rsvp) {
              // Prefill form with existing data
              // Convert total guests back to follower count (subtract 1 for the invitee)
              const followerCount = rsvpData.rsvp.guestsCount ? Math.max(0, rsvpData.rsvp.guestsCount - 1) : 0;
              const foodPrefsArray = rsvpData.rsvp.foodPreferences ? rsvpData.rsvp.foodPreferences.split('|').filter((p: string) => !p.startsWith('Other:')) : [];
              const otherMatch = rsvpData.rsvp.foodPreferences ? rsvpData.rsvp.foodPreferences.split('|').find((p: string) => p.startsWith('Other:')) : '';
              setFormData({
                name: rsvpData.rsvp.name,
                phone: rsvpData.rsvp.phone,
                attending: rsvpData.rsvp.attending,
                guestsCount: followerCount,
                foodPreferences: foodPrefsArray,
                otherFood: otherMatch ? otherMatch.replace('Other:', '') : '',
                allergicFood: rsvpData.rsvp.allergicFood || '',
              });
            }
          }
          setStep('form');
        } else if (data.status === 'disabled') {
          setError(t('codeDeactivated'));
        }
      } else {
        if (data.status === 'not_found') {
          setError(t('invalidCode'));
        } else {
          setError('Unable to verify code. Please try again.');
        }
      }
    } catch (err) {
      setError(t('networkError'));
    } finally {
      setIsLoading(false);
    }
  };

  const submitRSVP = async () => {
    // Validate
    const errors: Record<string, string> = {};
    if (formData.attending && (formData.guestsCount === null || formData.guestsCount < 0)) {
      errors.guestsCount = t('pleaseSpecifyFollowers');
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsLoading(true);
    setError('');
    setFormErrors({});

    try {
      // Build food preferences string
      const foodPrefsArray = [...formData.foodPreferences];
      if (formData.otherFood.trim()) {
        foodPrefsArray.push(`Other:${formData.otherFood.trim()}`);
      }
      const foodPreferencesStr = foodPrefsArray.length > 0 ? foodPrefsArray.join('|') : undefined;
      
      const response = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: code.trim(),
          name: formData.name.trim() || inviteeName,
          phone: formData.phone.trim() || '-',
          attending: formData.attending,
          guestsCount: formData.attending ? (formData.guestsCount || 0) + 1 : null,
          foodPreferences: foodPreferencesStr,
          allergicFood: formData.allergicFood.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setStep('success');
      } else {
        setError(data.error || t('submitFailed'));
      }
    } catch (err) {
      setError(t('networkError'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Section id="rsvp">
      <SectionHeading subtitle={t('rsvpSubtitle')}>
        {t('celebrateWithUs')}
      </SectionHeading>

      <div className="max-w-xl mx-auto">
        <Card>
          <CardContent>
            {step === 'code' && (
              <div className="space-y-4">
                <p className="text-center text-gray-600 mb-6">
                  {t('pleaseEnterCode')}
                </p>
                <Input
                  label={t('invitationCode')}
                  placeholder={t('enterCode')}
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  onKeyDown={(e) => e.key === 'Enter' && verifyCode()}
                  disabled={isLoading}
                  error={error}
                />
                <Button
                  className="w-full"
                  onClick={verifyCode}
                  disabled={isLoading}
                >
                  {isLoading ? <LoadingSpinner size="sm" /> : t('verifyCode')}
                </Button>
              </div>
            )}

            {step === 'form' && (
              <div className="space-y-4">
                {inviteeName && (
                  <div className="text-center mb-4">
                    <p className="text-lg font-semibold" style={{ color: '#B18A3D' }}>
                      Hi, {inviteeName}!
                    </p>
                    {groupName && (
                      <p className="text-sm text-gray-600 mt-1">
                        ({groupName})
                      </p>
                    )}
                  </div>
                )}

                <Select
                  label={t('willYouAttend')}
                  options={[
                    { value: 'true', label: t('attending') },
                    { value: 'false', label: t('notAttending') },
                  ]}
                  value={formData.attending.toString()}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      attending: e.target.value === 'true',
                      guestsCount: e.target.value === 'true' ? 1 : null,
                    })
                  }
                  disabled={isLoading}
                />

                {formData.attending && (
                  <>
                    <Select
                      label={t('numberOfFollowers')}
                      options={[
                        { value: '0', label: t('justMe') },
                        { value: '1', label: '1' },
                        { value: '2', label: '2' },
                        { value: '3', label: '3' },
                        { value: '4', label: '4' },
                        { value: '5', label: '5' },
                      ]}
                      value={formData.guestsCount?.toString() || '0'}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          guestsCount: parseInt(e.target.value) || 0,
                        })
                      }
                      error={formErrors.guestsCount}
                      disabled={isLoading}
                    />

                    {/* Dietary Restrictions */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        {t('dietaryRestrictions')} {t('optional')}
                      </label>
                      <p className="text-xs text-gray-500 mb-3">
                        {t('dietaryRestrictionsDesc')}
                      </p>
                      
                      <div className="space-y-2">
                        {['halalFood', 'vegetarianFood', 'nonBeef'].map((pref) => (
                          <label key={pref} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={formData.foodPreferences.includes(pref)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setFormData({
                                    ...formData,
                                    foodPreferences: [...formData.foodPreferences, pref],
                                  });
                                } else {
                                  setFormData({
                                    ...formData,
                                    foodPreferences: formData.foodPreferences.filter(p => p !== pref),
                                  });
                                }
                              }}
                              disabled={isLoading}
                              className="w-4 h-4 text-[#B18A3D] border-gray-300 rounded focus:ring-[#B18A3D]"
                            />
                            <span className="text-sm text-gray-700">{t(pref as any)}</span>
                          </label>
                        ))}
                        
                        {/* Other with text input */}
                        <div className="space-y-2">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={formData.otherFood !== ''}
                              onChange={(e) => {
                                if (!e.target.checked) {
                                  setFormData({ ...formData, otherFood: '' });
                                }
                              }}
                              disabled={isLoading}
                              className="w-4 h-4 text-[#B18A3D] border-gray-300 rounded focus:ring-[#B18A3D]"
                            />
                            <span className="text-sm text-gray-700">{t('other')}</span>
                          </label>
                          {formData.otherFood !== '' && (
                            <input
                              type="text"
                              value={formData.otherFood}
                              onChange={(e) => {
                                const value = e.target.value.slice(0, 200);
                                setFormData({ ...formData, otherFood: value });
                              }}
                              placeholder={t('otherPlaceholder')}
                              disabled={isLoading}
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#B18A3D] focus:border-transparent"
                            />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Allergic Food */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        {t('allergicFood')} {t('optional')}
                      </label>
                      <textarea
                        value={formData.allergicFood}
                        onChange={(e) => {
                          const value = e.target.value.slice(0, 200);
                          setFormData({ ...formData, allergicFood: value });
                        }}
                        placeholder={t('allergicFoodPlaceholder')}
                        rows={2}
                        disabled={isLoading}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#B18A3D] focus:border-transparent resize-none"
                      />
                      <p className="text-xs text-gray-400 text-right">
                        {formData.allergicFood.length}/200
                      </p>
                    </div>
                  </>
                )}

                {error && (
                  <p className="text-sm text-red-600 text-center">{error}</p>
                )}

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setStep('code');
                      setError('');
                      setFormErrors({});
                      // Keep the code in the input box
                    }}
                    disabled={isLoading}
                  >
                    {t('back')}
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={submitRSVP}
                    disabled={isLoading}
                  >
                    {isLoading ? <LoadingSpinner size="sm" /> : t('ok')}
                  </Button>
                </div>
              </div>
            )}

            {step === 'success' && (
              <div className="text-center py-8 space-y-4 relative">
                {formData.attending && (
                  <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    {[...Array(30)].map((_, i) => (
                      <div
                        key={i}
                        className="absolute w-2 h-2 rounded-full animate-firework"
                        style={{
                          left: '50%',
                          top: '30%',
                          background: ['#B18A3D', '#C99A4D', '#8B6B29', '#D4AF37', '#FFD700'][i % 5],
                          animationDelay: `${Math.random() * 0.5}s`,
                          '--tx': `${(Math.random() - 0.5) * 400}px`,
                          '--ty': `${(Math.random() - 0.5) * 400}px`,
                        } as React.CSSProperties}
                      />
                    ))}
                  </div>
                )}
                <div className="mb-4 relative z-10 text-6xl">
                  {formData.attending ? '🎉' : '😢'}
                </div>
                <h3 className="text-2xl font-semibold text-gray-900">
                  {formData.attending ? t('thankYou') : t('wellMissYou')}
                </h3>
                <p className="text-gray-600">
                  {formData.attending
                    ? t('excitedMessage')
                    : t('missYouMessage')}
                </p>
                <div className="mt-6">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setStep('code');
                      // Keep the code for reuse
                      setFormData({
                        name: '',
                        phone: '',
                        attending: true,
                        guestsCount: 0,
                        foodPreferences: [],
                        otherFood: '',
                        allergicFood: '',
                      });
                      setError('');
                      setFormErrors({});
                    }}
                  >
                    {t('back')}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Section>
  );
}
