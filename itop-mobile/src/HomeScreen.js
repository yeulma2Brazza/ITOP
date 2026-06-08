import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  StatusBar,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { CONVERT_ENDPOINT } from './config';

const SUPPORTED_FORMATS = ['PNG', 'JPG', 'GIF', 'TIF', 'WEBP', 'HEIC', 'SVG'];

export default function HomeScreen() {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [status, setStatus] = useState('idle'); // idle | converting | done | error
  const [pdfUri, setPdfUri] = useState(null);

  const pickFromGallery = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission refusée', "Autorise l'accès à ta galerie dans les paramètres.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 1,
    });
    if (!result.canceled) {
      setSelectedFiles(result.assets);
      setStatus('idle');
      setPdfUri(null);
    }
  };

  const pickFromFiles = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: 'image/*',
      multiple: true,
    });
    if (!result.canceled) {
      setSelectedFiles(result.assets);
      setStatus('idle');
      setPdfUri(null);
    }
  };

  const convertToPdf = async () => {
    if (selectedFiles.length === 0) {
      Alert.alert('Aucune image', 'Sélectionne au moins une image à convertir.');
      return;
    }

    setStatus('converting');
    setPdfUri(null);

    const formData = new FormData();
    for (const file of selectedFiles) {
      const uri = file.uri;
      const name = file.fileName || file.name || uri.split('/').pop() || 'image.jpg';
      const type = file.mimeType || 'image/jpeg';
      formData.append('images', { uri, name, type });
    }

    try {
      const response = await fetch(CONVERT_ENDPOINT, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Erreur serveur: ${response.status}`);
      }

      const blob = await response.blob();

      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result;
          resolve(result.split(',')[1]);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });

      const pdfPath = FileSystem.documentDirectory + 'ITOP_Convert.pdf';
      await FileSystem.writeAsStringAsync(pdfPath, base64, {
        encoding: 'base64',
      });

      setPdfUri(pdfPath);
      setStatus('done');

    } catch (err) {
      setStatus('error');
      if (err.message.includes('Network request failed') || err.message.includes('Failed to fetch')) {
        Alert.alert(
          'Erreur de connexion',
          "Impossible de joindre le serveur.\n\nVérifie que :\n• Le backend Django tourne\n• L'IP dans config.js est correcte\n• Ton téléphone est sur le même WiFi"
        );
      } else {
        Alert.alert('Erreur', err.message);
      }
    }
  };

  const sharePdf = async () => {
    if (!pdfUri) return;
    const canShare = await Sharing.isAvailableAsync();
    if (canShare) {
      await Sharing.shareAsync(pdfUri, {
        mimeType: 'application/pdf',
        dialogTitle: 'Partager le PDF',
        UTI: 'com.adobe.pdf',
      });
    } else {
      Alert.alert('Partage indisponible', "Le partage n'est pas disponible sur cet appareil.");
    }
  };

  const reset = () => {
    setSelectedFiles([]);
    setStatus('idle');
    setPdfUri(null);
  };

  const isLoading = status === 'converting';

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2D4336" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>ITOP</Text>
        <Text style={styles.headerSubtitle}>Convertisseur d'images en PDF</Text>
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>

        <View style={styles.formatsContainer}>
          <Text style={styles.formatsLabel}>Formats supportés :</Text>
          <View style={styles.formatsBadges}>
            {SUPPORTED_FORMATS.map(fmt => (
              <View key={fmt} style={styles.badge}>
                <Text style={styles.badgeText}>{fmt}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.uploadZone}>
          <Text style={styles.uploadTitle}>
            {selectedFiles.length > 0
              ? `${selectedFiles.length} image${selectedFiles.length > 1 ? 's' : ''} sélectionnée${selectedFiles.length > 1 ? 's' : ''}`
              : 'Aucune image sélectionnée'}
          </Text>

          {selectedFiles.length > 0 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.fileList}>
              {selectedFiles.map((file, i) => (
                <View key={i} style={styles.fileChip}>
                  <Text style={styles.fileChipText} numberOfLines={1}>
                    {file.fileName || file.name || `Image ${i + 1}`}
                  </Text>
                </View>
              ))}
            </ScrollView>
          )}

          <View style={styles.pickButtons}>
            <TouchableOpacity style={styles.btnPick} onPress={pickFromGallery} disabled={isLoading}>
              <Text style={styles.btnPickText}>Galerie</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnPick} onPress={pickFromFiles} disabled={isLoading}>
              <Text style={styles.btnPickText}>Fichiers</Text>
            </TouchableOpacity>
          </View>
        </View>

        {selectedFiles.length > 0 && status !== 'done' && (
          <TouchableOpacity
            style={[styles.btnConvert, isLoading && styles.btnDisabled]}
            onPress={convertToPdf}
            disabled={isLoading}
          >
            {isLoading ? (
              <View style={styles.loadingRow}>
                <ActivityIndicator color="#fff" size="small" />
                <Text style={styles.btnConvertText}>  Conversion en cours...</Text>
              </View>
            ) : (
              <Text style={styles.btnConvertText}>Convertir en PDF</Text>
            )}
          </TouchableOpacity>
        )}

        {status === 'done' && pdfUri && (
          <View style={styles.resultContainer}>
            <Text style={styles.resultTitle}>PDF prêt !</Text>
            <TouchableOpacity style={styles.btnShare} onPress={sharePdf}>
              <Text style={styles.btnShareText}>Partager / Enregistrer le PDF</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnReset} onPress={reset}>
              <Text style={styles.btnResetText}>Nouvelle conversion</Text>
            </TouchableOpacity>
          </View>
        )}

        {status === 'error' && (
          <TouchableOpacity style={styles.btnReset} onPress={reset}>
            <Text style={styles.btnResetText}>Réessayer</Text>
          </TouchableOpacity>
        )}

      </ScrollView>

      <View style={styles.footer}>
        <Text style={styles.footerText}>© 2026 Afro Tech · Gratuit pour toujours</Text>
      </View>
    </View>
  );
}

const PRIMARY_RED  = '#cc3234';
const DARK_RED     = '#a82729';
const PRIMARY_GRAY = '#636769';
const DARK_GRAY    = '#343a40';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },

  header: {
    backgroundColor: PRIMARY_RED,
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 24,
  },
  headerTitle: { fontSize: 32, fontWeight: '900', color: '#fff', letterSpacing: 2 },
  headerSubtitle: { fontSize: 14, color: '#f5c0c0', marginTop: 4 },

  body: { padding: 20, paddingBottom: 40 },

  formatsContainer: { marginBottom: 24 },
  formatsLabel: { fontSize: 13, color: PRIMARY_GRAY, marginBottom: 8, fontWeight: '600' },
  formatsBadges: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  badge: {
    backgroundColor: '#fdeaea',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#e8b4b4',
  },
  badgeText: { fontSize: 12, color: PRIMARY_RED, fontWeight: '700' },

  uploadZone: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#e0e2e5',
    borderStyle: 'dashed',
    alignItems: 'center',
  },
  uploadTitle: { fontSize: 16, color: DARK_GRAY, marginBottom: 12, fontWeight: '500', textAlign: 'center' },
  fileList: { marginBottom: 12, maxHeight: 50 },
  fileChip: {
    backgroundColor: '#fdeaea',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    maxWidth: 160,
  },
  fileChipText: { fontSize: 12, color: PRIMARY_RED, fontWeight: '600' },
  pickButtons: { flexDirection: 'row', gap: 12 },
  btnPick: {
    backgroundColor: PRIMARY_RED,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
    minWidth: 110,
    alignItems: 'center',
  },
  btnPickText: { color: '#fff', fontWeight: '700', fontSize: 14 },

  btnConvert: {
    backgroundColor: PRIMARY_RED,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
    elevation: 3,
    shadowColor: PRIMARY_RED,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  btnDisabled: { backgroundColor: '#aaa' },
  btnConvertText: { color: '#fff', fontWeight: '800', fontSize: 16, letterSpacing: 0.5 },
  loadingRow: { flexDirection: 'row', alignItems: 'center' },

  resultContainer: { alignItems: 'center', gap: 12 },
  resultTitle: { fontSize: 20, fontWeight: '800', color: PRIMARY_RED },
  btnShare: {
    backgroundColor: DARK_GRAY,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    width: '100%',
    elevation: 3,
  },
  btnShareText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  btnReset: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    width: '100%',
    borderWidth: 2,
    borderColor: PRIMARY_RED,
  },
  btnResetText: { color: PRIMARY_RED, fontWeight: '700', fontSize: 14 },

  footer: {
    padding: 16,
    alignItems: 'center',
    backgroundColor: '#e9ecef',
    borderTopWidth: 1,
    borderTopColor: '#dee2e6',
  },
  footerText: { fontSize: 12, color: PRIMARY_GRAY },
});
