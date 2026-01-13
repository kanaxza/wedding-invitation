'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Section, SectionHeading } from './Section';
import { Card, CardContent } from './Card';
import { Button } from './Button';
import { Input, Select } from './Input';
import { LoadingSpinner } from './LoadingSpinner';

type Step = 'code' | 'form' | 'success';

interface RSVPData {
  name: string;
  phone: string;
  attending: boolean;
  guestsCount: number | null;
}

export function RSVPSection() {
  const searchParams = useSearchParams();
  const [step, setStep] = useState<Step>('code');
  const [code, setCode] = useState('');
  const [inviteeName, setInviteeName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<RSVPData>({
    name: '',
    phone: '',
    attending: true,
    guestsCount: 0,
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
        }

        const rsvpResponse = await fetch(
          `/api/rsvp?code=${encodeURIComponent(codeToVerify.trim())}`
        );
        if (rsvpResponse.ok) {
          const rsvpData = await rsvpResponse.json();
          if (rsvpData.rsvp) {
            const followerCount = rsvpData.rsvp.guestsCount ? Math.max(0, rsvpData.rsvp.guestsCount - 1) : 0;
            setFormData({
              name: rsvpData.rsvp.name,
              phone: rsvpData.rsvp.phone,
              attending: rsvpData.rsvp.attending,
              guestsCount: followerCount,
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
      setError('Please enter your invitation code');
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
              setFormData({
                name: rsvpData.rsvp.name,
                phone: rsvpData.rsvp.phone,
                attending: rsvpData.rsvp.attending,
                guestsCount: followerCount,
              });
            }
          }
          setStep('form');
        } else if (data.status === 'disabled') {
          setError('This invitation code has been deactivated. Please contact us for assistance.');
        }
      } else {
        if (data.status === 'not_found') {
          setError('Invalid invitation code. Please check and try again.');
        } else {
          setError('Unable to verify code. Please try again.');
        }
      }
    } catch (err) {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const submitRSVP = async () => {
    // Validate
    const errors: Record<string, string> = {};
    if (formData.attending && (formData.guestsCount === null || formData.guestsCount < 0)) {
      errors.guestsCount = 'Please specify number of followers';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsLoading(true);
    setError('');
    setFormErrors({});

    try {
      const response = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: code.trim(),
          name: formData.name.trim() || inviteeName,
          phone: formData.phone.trim() || '-',
          attending: formData.attending,
          guestsCount: formData.attending ? (formData.guestsCount || 0) + 1 : null,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setStep('success');
      } else {
        setError(data.error || 'Failed to submit RSVP. Please try again.');
      }
    } catch (err) {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Section id="rsvp">
      <SectionHeading subtitle="Let us know if you can join us">
      Celebrate With Us
      </SectionHeading>

      <div className="max-w-xl mx-auto">
        <Card>
          <CardContent>
            {step === 'code' && (
              <div className="space-y-4">
                <p className="text-center text-gray-600 mb-6">
                  Please enter your invitation code
                </p>
                <Input
                  label="Invitation Code"
                  placeholder="Enter your code"
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
                  {isLoading ? <LoadingSpinner size="sm" /> : 'Verify Code'}
                </Button>
              </div>
            )}

            {step === 'form' && (
              <div className="space-y-4">
                {inviteeName && (
                  <p className="text-center text-lg font-semibold mb-4" style={{ color: '#B18A3D' }}>
                    Hi, {inviteeName}!
                  </p>
                )}

                <Select
                  label="Will you attend? *"
                  options={[
                    { value: 'true', label: 'Yeah! See you.' },
                    { value: 'false', label: "Sorry, I can't make it." },
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
                  <Select
                    label="Number of Followers *"
                    options={[
                      { value: '0', label: '0 (Just me)' },
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
                    Back
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={submitRSVP}
                    disabled={isLoading}
                  >
                    {isLoading ? <LoadingSpinner size="sm" /> : 'OK'}
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
                  {formData.attending ? 'See you soon!' : "We'll miss you!"}
                </h3>
                <p className="text-gray-600">
                  {formData.attending
                    ? "We're excited to celebrate with you!"
                    : "But totally understand. Let's catch up soon!"}
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
                      });
                      setError('');
                      setFormErrors({});
                    }}
                  >
                    Back
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
