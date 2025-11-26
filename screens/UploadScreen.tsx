import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { api } from '../services/mockBackend';
import { Icon } from '../components/Icons';

export const UploadScreen: React.FC<{ onSuccess: () => void }> = ({ onSuccess }) => {
  const [file, setFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [title, setTitle] = useState('');
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleFilePick = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'audio/*',
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      const asset = result.assets[0];
      if (asset) {
        setFile(asset);
        if (!title) {
          const name = asset.name.replace(/\.[^/.]+$/, "");
          setTitle(name);
        }
      }
    } catch (err) {
      console.warn(err);
      Alert.alert("Error", "Failed to pick file");
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    
    setUploading(true);
    try {
      const user = await api.getCurrentUser();
      await api.uploadSong({ uri: file.uri, name: file.name }, user, title);
      
      setSuccess(true);
      
      setTimeout(() => {
        setSuccess(false);
        setFile(null);
        setTitle('');
        onSuccess();
      }, 1500);
    } catch (e) {
      console.error(e);
      Alert.alert("Upload failed", "Please check if the file is too large or try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Upload Track</Text>

      <View style={styles.content}>
        {success ? (
          <View style={styles.successContainer}>
             <View style={styles.successIconContainer}>
               <Icon name="check-circle" size={48} color="#22c55e" />
             </View>
             <Text style={styles.successTitle}>Upload Complete!</Text>
             <Text style={styles.successSubtitle}>Your track is now live.</Text>
          </View>
        ) : (
          <View style={styles.formContainer}>
            
            <TouchableOpacity 
              onPress={handleFilePick}
              style={[styles.dropZone, file ? styles.dropZoneActive : styles.dropZoneInactive]}
              activeOpacity={0.8}
            >
               <Icon 
                 name={file ? "music" : "upload"} 
                 size={48} 
                 color={file ? "#22c55e" : "#71717a"} 
               />
               <Text style={styles.dropZoneText}>
                 {file ? file.name : "Tap to select audio file"}
               </Text>
               <Text style={styles.dropZoneSubtext}>MP3, WAV, AAC supported</Text>
            </TouchableOpacity>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>TRACK TITLE</Text>
              <TextInput 
                value={title}
                onChangeText={setTitle}
                placeholder="Enter song name..."
                placeholderTextColor="#52525b"
                style={styles.input}
              />
            </View>

            <TouchableOpacity 
              disabled={!file || uploading}
              onPress={handleUpload}
              style={[
                styles.uploadButton, 
                (!file || uploading) ? styles.uploadButtonDisabled : styles.uploadButtonActive
              ]}
            >
              {uploading ? (
                <View style={styles.uploadingContent}>
                  <ActivityIndicator size="small" color="#000" style={{ marginRight: 8 }} />
                  <Text style={styles.uploadButtonTextActive}>Uploading...</Text>
                </View>
              ) : (
                <Text style={styles.uploadButtonText}>Publish Track</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    paddingTop: 48,
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 32,
    textShadowColor: 'rgba(34, 197, 94, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingBottom: 100,
  },
  successContainer: {
    alignItems: 'center',
  },
  successIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#22c55e',
  },
  successTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  successSubtitle: {
    color: '#a1a1aa',
  },
  formContainer: {
    backgroundColor: 'rgba(24, 24, 27, 0.5)',
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  dropZone: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 32,
    marginBottom: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropZoneActive: {
    borderColor: '#22c55e',
    backgroundColor: 'rgba(34, 197, 94, 0.05)',
  },
  dropZoneInactive: {
    borderColor: '#3f3f46',
  },
  dropZoneText: {
    marginTop: 16,
    fontSize: 14,
    color: '#a1a1aa',
    fontWeight: '500',
    textAlign: 'center',
  },
  dropZoneSubtext: {
    fontSize: 12,
    color: '#52525b',
    marginTop: 4,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#71717a',
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    backgroundColor: 'black',
    borderWidth: 1,
    borderColor: '#27272a',
    borderRadius: 8,
    padding: 12,
    color: 'white',
    fontSize: 16,
  },
  uploadButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadButtonActive: {
    backgroundColor: '#22c55e',
    shadowColor: "#22c55e",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 5,
  },
  uploadButtonDisabled: {
    backgroundColor: '#27272a',
  },
  uploadButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#71717a',
  },
  uploadButtonTextActive: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'black',
  },
  uploadingContent: {
    flexDirection: 'row',
    alignItems: 'center',
  }
});