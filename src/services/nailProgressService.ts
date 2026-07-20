import { supabase } from '../lib/supabase';
import * as ImageManipulator from 'expo-image-manipulator';
import AsyncStorage from '@react-native-async-storage/async-storage';
import sessionService from './sessionService';

export interface NailProgressPhoto {
  id: string;
  user_id: string;
  photo_url: string;
  thumbnail_url?: string;
  days_clean: number;
  streak_seconds_at_photo: number;
  caption?: string;
  hand_type: 'left' | 'right' | 'both';
  created_at: string;
  updated_at: string;
  metadata?: Record<string, any>;
}

export interface UploadPhotoParams {
  uri: string;
  daysClean: number;
  streakSeconds: number;
  caption?: string;
  handType?: 'left' | 'right' | 'both';
}

class NailProgressService {
  private readonly STORAGE_KEY_BASE = '@nail_progress_photos';
  private readonly BUCKET_NAME = 'nail-progress';
  private localCache: NailProgressPhoto[] | null = null;

  private async getStorageKey(): Promise<string> {
    return sessionService.getUserStorageKey(this.STORAGE_KEY_BASE);
  }

  /**
   * Upload a nail progress photo
   */
  async uploadPhoto(params: UploadPhotoParams): Promise<NailProgressPhoto | null> {
    try {
      const { uri, daysClean, streakSeconds, caption, handType = 'both' } = params;

      // Get user ID using the same method as profile upload
      const userId = await sessionService.getCurrentUserId();
      console.log('✅ User ID obtained:', userId);

      // Compress image to optimize storage
      const compressedImage = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 1080 } }], // Resize to 1080px width (maintains aspect ratio)
        { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
      );

      // Create thumbnail
      const thumbnail = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 300 } }],
        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
      );

      // Generate unique filename
      const timestamp = Date.now();
      const photoFilename = `${userId}/${timestamp}-photo.jpg`;
      const thumbnailFilename = `${userId}/${timestamp}-thumb.jpg`;

      // Upload main photo using ArrayBuffer (React Native compatible)
      console.log('Uploading main photo...');
      const photoResponse = await fetch(compressedImage.uri);
      const photoArrayBuffer = await photoResponse.arrayBuffer();
      const { data: photoData, error: photoError } = await supabase.storage
        .from(this.BUCKET_NAME)
        .upload(photoFilename, photoArrayBuffer, {
          contentType: 'image/jpeg',
          upsert: false,
        });

      if (photoError) {
        console.error('Error uploading photo:', photoError);
        return null;
      }
      console.log('✅ Main photo uploaded successfully');

      // Upload thumbnail using ArrayBuffer
      console.log('Uploading thumbnail...');
      const thumbResponse = await fetch(thumbnail.uri);
      const thumbArrayBuffer = await thumbResponse.arrayBuffer();
      const { data: thumbData, error: thumbError } = await supabase.storage
        .from(this.BUCKET_NAME)
        .upload(thumbnailFilename, thumbArrayBuffer, {
          contentType: 'image/jpeg',
          upsert: false,
        });
      
      if (!thumbError) {
        console.log('✅ Thumbnail uploaded successfully');
      }

      // Get public URLs
      const { data: photoUrlData } = supabase.storage
        .from(this.BUCKET_NAME)
        .getPublicUrl(photoFilename);

      const { data: thumbUrlData } = supabase.storage
        .from(this.BUCKET_NAME)
        .getPublicUrl(thumbnailFilename);

      // Insert record into database
      const { data, error } = await supabase
        .from('nail_progress_photos')
        .insert({
          user_id: userId,
          photo_url: photoUrlData.publicUrl,
          thumbnail_url: thumbError ? null : thumbUrlData.publicUrl,
          days_clean: daysClean,
          streak_seconds_at_photo: streakSeconds,
          caption: caption || null,
          hand_type: handType,
        })
        .select()
        .single();

      if (error) {
        console.error('Error saving photo record:', error);
        return null;
      }

      // Clear cache
      this.localCache = null;
      await this.clearLocalCache();

      console.log('✅ Nail progress photo uploaded successfully');
      return data as NailProgressPhoto;

    } catch (error) {
      console.error('Error in uploadPhoto:', error);
      return null;
    }
  }

  /**
   * Get all photos for current user (with caching)
   */
  async getPhotos(): Promise<NailProgressPhoto[]> {
    try {
      // Return from memory cache if available
      if (this.localCache) {
        return this.localCache;
      }

      // Try local storage cache
      const cached = await this.getLocalCache();
      if (cached.length > 0) {
        this.localCache = cached;
        
        // Background refresh
        setTimeout(() => this.refreshCache(), 100);
        
        return cached;
      }

      // Fetch from database
      return await this.refreshCache();

    } catch (error) {
      console.error('Error getting photos:', error);
      return [];
    }
  }

  /**
   * Refresh cache from database
   */
  private async refreshCache(): Promise<NailProgressPhoto[]> {
    try {
      const userId = await sessionService.getCurrentUserId();

      const { data, error } = await supabase
        .from('nail_progress_photos')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching photos:', error);
        return [];
      }

      const photos = (data || []) as NailProgressPhoto[];
      
      // Update caches
      this.localCache = photos;
      await this.saveLocalCache(photos);

      return photos;

    } catch (error) {
      console.error('Error refreshing cache:', error);
      return [];
    }
  }

  /**
   * Delete a photo
   */
  async deletePhoto(photoId: string): Promise<boolean> {
    try {
      const userId = await sessionService.getCurrentUserId();

      // Get photo details
      const { data: photo } = await supabase
        .from('nail_progress_photos')
        .select('*')
        .eq('id', photoId)
        .eq('user_id', userId)
        .single();

      if (!photo) {
        console.error('Photo not found');
        return false;
      }

      // Extract filenames from URLs
      const photoFilename = photo.photo_url.split('/').pop();
      const thumbFilename = photo.thumbnail_url?.split('/').pop();

      // Delete from storage
      if (photoFilename) {
        await supabase.storage
          .from(this.BUCKET_NAME)
          .remove([`${userId}/${photoFilename}`]);
      }

      if (thumbFilename) {
        await supabase.storage
          .from(this.BUCKET_NAME)
          .remove([`${userId}/${thumbFilename}`]);
      }

      // Delete database record
      const { error } = await supabase
        .from('nail_progress_photos')
        .delete()
        .eq('id', photoId)
        .eq('user_id', userId);

      if (error) {
        console.error('Error deleting photo record:', error);
        return false;
      }

      // Clear cache
      this.localCache = null;
      await this.clearLocalCache();

      console.log('✅ Photo deleted successfully');
      return true;

    } catch (error) {
      console.error('Error in deletePhoto:', error);
      return false;
    }
  }

  /**
   * Update photo caption
   */
  async updateCaption(photoId: string, caption: string): Promise<boolean> {
    try {
      const userId = await sessionService.getCurrentUserId();

      const { error } = await supabase
        .from('nail_progress_photos')
        .update({ caption })
        .eq('id', photoId)
        .eq('user_id', userId);

      if (error) {
        console.error('Error updating caption:', error);
        return false;
      }

      // Clear cache
      this.localCache = null;
      await this.clearLocalCache();

      return true;

    } catch (error) {
      console.error('Error in updateCaption:', error);
      return false;
    }
  }

  /**
   * Get comparison data (first vs latest photo)
   */
  async getComparisonPhotos(): Promise<{ first: NailProgressPhoto | null; latest: NailProgressPhoto | null }> {
    try {
      const photos = await this.getPhotos();
      
      if (photos.length === 0) {
        return { first: null, latest: null };
      }

      // Photos are already sorted by created_at DESC
      const latest = photos[0];
      const first = photos[photos.length - 1];

      return { first, latest };

    } catch (error) {
      console.error('Error getting comparison photos:', error);
      return { first: null, latest: null };
    }
  }

  /**
   * Local cache management
   */
  private async getLocalCache(): Promise<NailProgressPhoto[]> {
    try {
      const key = await this.getStorageKey();
      const cached = await AsyncStorage.getItem(key);
      return cached ? JSON.parse(cached) : [];
    } catch (error) {
      console.error('Error reading local cache:', error);
      return [];
    }
  }

  private async saveLocalCache(photos: NailProgressPhoto[]): Promise<void> {
    try {
      const key = await this.getStorageKey();
      await AsyncStorage.setItem(key, JSON.stringify(photos));
    } catch (error) {
      console.error('Error saving local cache:', error);
    }
  }

  private async clearLocalCache(): Promise<void> {
    try {
      const key = await this.getStorageKey();
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('Error clearing local cache:', error);
    }
  }
}

export default new NailProgressService();
