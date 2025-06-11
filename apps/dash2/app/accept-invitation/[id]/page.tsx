'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { authClient } from '@databuddy/auth/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

export default function AcceptInvitationPage() {
    const router = useRouter();
    const params = useParams();
    const invitationId = params.id as string;

    const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'expired'>('loading');
    const [organizationName, setOrganizationName] = useState<string>('');
    const [error, setError] = useState<string>('');

    useEffect(() => {
        const acceptInvitation = async () => {
            try {
                if (!invitationId) {
                    setStatus('error');
                    setError('Invalid invitation link');
                    return;
                }

                const result = await authClient.organization.acceptInvitation({
                    invitationId,
                });

                if (result.data) {
                    setOrganizationName(result.data.organization.name);
                    setStatus('success');
                    // Redirect to dashboard after 2 seconds
                    setTimeout(() => {
                        router.push('/dashboard');
                    }, 2000);
                } else {
                    setStatus('error');
                    setError('Failed to accept invitation');
                }
            } catch (err: any) {
                console.error('Error accepting invitation:', err);
                if (err.message?.includes('expired') || err.message?.includes('invalid')) {
                    setStatus('expired');
                } else {
                    setStatus('error');
                    setError(err.message || 'An unexpected error occurred');
                }
            }
        };

        acceptInvitation();
    }, [invitationId, router]);

    const renderContent = () => {
        switch (status) {
            case 'loading':
                return (
                    <div className="flex flex-col items-center space-y-4">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                        <p className="text-gray-600">Processing your invitation...</p>
                    </div>
                );

            case 'success':
                return (
                    <div className="flex flex-col items-center space-y-4">
                        <CheckCircle className="h-12 w-12 text-green-600" />
                        <div className="text-center">
                            <h2 className="text-xl font-semibold text-gray-900">Welcome aboard!</h2>
                            <p className="text-gray-600 mt-2">
                                You've successfully joined <strong>{organizationName}</strong>
                            </p>
                            <p className="text-sm text-gray-500 mt-2">
                                Redirecting you to the dashboard...
                            </p>
                        </div>
                    </div>
                );

            case 'expired':
                return (
                    <div className="flex flex-col items-center space-y-4">
                        <XCircle className="h-12 w-12 text-red-600" />
                        <div className="text-center">
                            <h2 className="text-xl font-semibold text-gray-900">Invitation Expired</h2>
                            <p className="text-gray-600 mt-2">
                                This invitation link has expired or is no longer valid.
                            </p>
                            <p className="text-sm text-gray-500 mt-2">
                                Please contact the organization admin for a new invitation.
                            </p>
                        </div>
                        <Button
                            onClick={() => router.push('/login')}
                            className="mt-4"
                        >
                            Go to Login
                        </Button>
                    </div>
                );

            case 'error':
                return (
                    <div className="flex flex-col items-center space-y-4">
                        <XCircle className="h-12 w-12 text-red-600" />
                        <div className="text-center">
                            <h2 className="text-xl font-semibold text-gray-900">Something went wrong</h2>
                            <p className="text-gray-600 mt-2">{error}</p>
                        </div>
                        <Button
                            onClick={() => router.push('/login')}
                            className="mt-4"
                        >
                            Go to Login
                        </Button>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <CardTitle>Organization Invitation</CardTitle>
                    <CardDescription>
                        Processing your invitation to join the organization
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {renderContent()}
                </CardContent>
            </Card>
        </div>
    );
} 