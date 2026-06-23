import { NextRequest } from 'next/server';
import { authenticateChannel } from '@/lib/pusher';
import { store } from '@/lib/store';
import { apiSuccess, ApiError } from '@/lib/api';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const socketId = formData.get('socket_id') as string;
    const channelName = formData.get('channel_name') as string;

    if (!socketId || !channelName) {
      return ApiError.validation('Missing socket_id or channel_name');
    }

    // For private channels, verify user authentication
    if (channelName.startsWith('private-') || channelName.startsWith('presence-')) {
      // For admin channel, check for admin JWT token
      if (channelName === 'private-admin') {
        const authHeader = request.headers.get('authorization');
        if (!authHeader?.startsWith('Bearer ')) {
          return ApiError.unauthorized('Admin access required');
        }
      } else {
        // Regular private channels require customer auth via Quickdash JWT
        const authHeader = request.headers.get('authorization');
        const token = authHeader?.replace('Bearer ', '');

        if (!token) {
          return ApiError.unauthorized('Authentication required for private channels');
        }

        // Verify token by checking profile
        try {
          await store.auth.getProfile();
        } catch {
          return ApiError.unauthorized('Invalid or expired token');
        }
      }

      try {
        const authResponse = authenticateChannel(socketId, channelName);
        return apiSuccess(authResponse);
      } catch (error) {
        console.error('Pusher auth error:', error);
        return ApiError.internal('Failed to authenticate channel');
      }
    }

    // Public channels don't need authentication
    return ApiError.badRequest('Channel does not require authentication');
  } catch (error) {
    console.error('Pusher auth error:', error);
    return ApiError.internal('Authentication failed');
  }
}
