// native_assignment/services/mediaService.ts
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';

export type MediaSource = 'camera' | 'gallery';

export interface MediaResult {
  success: boolean;
  imageUri?: string;
  error?: string;
  cancelled?: boolean;
}

// Request camera permission
async function requestCameraPermission(): Promise<boolean> {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  return status === 'granted';
}

// Request gallery permission (iOS only, Android doesn't strictly need it)
async function requestGalleryPermission(): Promise<boolean> {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  return status === 'granted';
}

// Compress image silently in the background to prevent memory crashes
async function compressImage(uri: string): Promise<string> {
  const result = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: 1200 } }], // Resize to max 1200px width
    { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
  );
  return result.uri;
}

// Take photo with camera
export async function takePhoto(): Promise<MediaResult> {
  const hasPermission = await requestCameraPermission();
  
  if (!hasPermission) {
    return {
      success: false,
      error: 'Camera permission was denied. You can allow camera access in your device settings or choose an image from the gallery instead.',
    };
  }
  
  try {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false, // <-- IMMEDIATE SELECTION (No cropping UI)
      quality: 0.8,
    });
    
    if (result.canceled) {
      return { success: false, cancelled: true };
    }
    
    const compressedUri = await compressImage(result.assets[0].uri);
    return { success: true, imageUri: compressedUri };
  } catch (error) {
    return { success: false, error: 'Failed to capture photo. Please try again.' };
  }
}

// Choose image from gallery
export async function chooseFromGallery(): Promise<MediaResult> {
  const hasPermission = await requestGalleryPermission();
  
  if (!hasPermission) {
    return {
      success: false,
      error: 'Gallery permission was denied. You can allow access in your device settings or take a photo instead.',
    };
  }
  
  try {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false, // <-- IMMEDIATE SELECTION (No cropping UI)
      quality: 0.8,
    });
    
    if (result.canceled) {
      return { success: false, cancelled: true };
    }
    
    const compressedUri = await compressImage(result.assets[0].uri);
    return { success: true, imageUri: compressedUri };
  } catch (error) {
    return { success: false, error: 'Failed to select image. Please try again.' };
  }
}