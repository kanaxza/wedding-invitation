'use client';

import { useState } from 'react';
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
  const [step, setStep] = useState<Step>('code');
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<RSVPData>({
    name: '',
    phone: '',
    attending: true,
    guestsCount: 1,
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

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
          // Check if RSVP already exists
          const rsvpResponse = await fetch(
            `/api/rsvp?code=${encodeURIComponent(code.trim())}`
          );
          if (rsvpResponse.ok) {
            const rsvpData = await rsvpResponse.json();
            if (rsvpData.rsvp) {
              // Prefill form with existing data
              setFormData({
                name: rsvpData.rsvp.name,
                phone: rsvpData.rsvp.phone,
                attending: rsvpData.rsvp.attending,
                guestsCount: rsvpData.rsvp.guestsCount,
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
    if (!formData.name.trim()) errors.name = 'Full name is required';
    if (!formData.phone.trim()) errors.phone = 'Phone number is required';
    if (formData.attending && (!formData.guestsCount || formData.guestsCount < 1)) {
      errors.guestsCount = 'Please specify number of guests (minimum 1)';
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
          name: formData.name.trim(),
          phone: formData.phone.trim(),
          attending: formData.attending,
          guestsCount: formData.attending ? formData.guestsCount : null,
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
                <p className="text-center text-sm text-green-600 mb-4">
                  ✓ Code verified successfully
                </p>

                <Input
                  label="Full Name *"
                  placeholder="Your full name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  error={formErrors.name}
                  disabled={isLoading}
                />

                <Input
                  label="Phone Number *"
                  placeholder="Your phone number"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  error={formErrors.phone}
                  disabled={isLoading}
                />

                <Select
                  label="Will you attend? *"
                  options={[
                    { value: 'true', label: 'Attending' },
                    { value: 'false', label: 'Regret' },
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
                  <Input
                    label="Number of Guests *"
                    type="number"
                    min="1"
                    placeholder="1"
                    value={formData.guestsCount || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        guestsCount: parseInt(e.target.value) || null,
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
                    {isLoading ? <LoadingSpinner size="sm" /> : 'Submit RSVP'}
                  </Button>
                </div>
              </div>
            )}

            {step === 'success' && (
              <div className="text-center py-8 space-y-4">
                <div className="text-green-600 mb-4">
                  <svg
                    className="w-16 h-16 mx-auto"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-2xl font-semibold text-gray-900">
                  Thank You!
                </h3>
                <p className="text-gray-600">
                  {formData.attending
                    ? "We're excited to celebrate with you!"
                    : 'Thank you for letting us know.'}
                </p>
                {formData.attending && formData.guestsCount && (
                  <p className="text-sm text-gray-500">
                    Party size: {formData.guestsCount}{' '}
                    {formData.guestsCount === 1 ? 'guest' : 'guests'}
                  </p>
                )}
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => {
                    setStep('code');
                    setCode('');
                    setFormData({
                      name: '',
                      phone: '',
                      attending: true,
                      guestsCount: 1,
                    });
                    setError('');
                    setFormErrors({});
                  }}
                >
                  Submit Another RSVP
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Section>
  );
}
