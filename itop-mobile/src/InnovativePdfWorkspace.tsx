/**
 * InnovativePdfWorkspace.tsx
 * Composant principal de l'application ITOP.
 * Design SaaS sombre moderne : fond ardoise, coins très arrondis,
 * micro-animations fluides — à l'opposé du style classique iLovePDF.
 */

import React, {
  useState,
  useMemo,
  useCallback,
  useRef,
  useEffect,
} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  Alert,
  Dimensions,
  Animated,
  StatusBar,
  Platform,
  ListRenderItemInfo,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { CONVERT_ENDPOINT } from './config';

// ─── Dimensions ────────────────────────────────────────────────────────────────
const { width: SW } = Dimensions.get('window');
const COLUMNS   = 2;
// Largeur d'une carte : (largeur écran − 2×marge − 1×gouttière) / 2 colonnes
const CARD_W    = (SW - 48) / COLUMNS;
const CARD_H    = CARD_W * 1.35;

// ─── Palette de couleurs ────────────────────────────────────────────────────────
const C = {
  bg:            '#0D0D14',  // fond principal très sombre
  surface:       '#16161F',  // surface de carte
  surfaceHigh:   '#1E1E2A',  // surface surélevée
  border:        '#28283C',  // bordure subtile
  primary:       '#CC3234',  // rouge ITOP
  primaryMuted:  'rgba(204,50,52,0.14)',
  accent:        '#7B6EF6',  // violet SaaS
  accentMuted:   'rgba(123,110,246,0.14)',
  text:          '#EEEEF8',  // texte principal
  textSub:       '#7878A0',  // texte secondaire
  textDim:       '#3A3A52',  // texte très atténué
  success:       '#4ADE80',
  successMuted:  'rgba(74,222,128,0.12)',
  gold:          '#F59E0B',  // badge Smart Cropped
  white:         '#FFFFFF',
} as const;

// ─── Interfaces TypeScript ──────────────────────────────────────────────────────

/** Représente une image sélectionnée — future page du PDF. */
interface PdfPage {
  /** Identifiant unique généré côté client */
  id: string;
  /** URI locale du fichier sur l'appareil */
  localUri: string;
  /** Vrai si la page est cochée dans la sélection multiple */
  isSelected: boolean;
  /** Dimensions originales de l'image en pixels */
  dimensions: { width: number; height: number };
  /** Nom du fichier d'origine */
  fileName: string;
}

/** Les trois états possibles du flux de travail */
type WorkspaceStep = 'selection' | 'loading' | 'workspace';

// ─── Sous-composant : PageCard ──────────────────────────────────────────────────

interface PageCardProps {
  item:      PdfPage;
  index:     number;
  onToggle:  (id: string) => void;
  onShare:   (uri: string) => void;
  /** Valeur partagée d'opacité pour l'animation d'entrée */
  fadeAnim:  Animated.Value;
  /** Valeur partagée de translation verticale pour l'animation d'entrée */
  slideAnim: Animated.Value;
}

/** Miniature d'une page dans la galerie, mémoïsée pour éviter les re-rendus inutiles. */
const PageCard: React.FC<PageCardProps> = React.memo(
  ({ item, index, onToggle, onShare, fadeAnim, slideAnim }) => {
    // Animation de scale au toucher (micro-feedback)
    const pressScale = useRef(new Animated.Value(1)).current;

    const handlePressIn = useCallback(() => {
      Animated.spring(pressScale, {
        toValue:  0.94,
        tension:  250,
        friction: 12,
        useNativeDriver: true,
      }).start();
    }, [pressScale]);

    const handlePressOut = useCallback(() => {
      Animated.spring(pressScale, {
        toValue:  1,
        tension:  250,
        friction: 12,
        useNativeDriver: true,
      }).start();
    }, [pressScale]);

    return (
      <Animated.View
        style={[
          styles.cardWrapper,
          {
            opacity:   fadeAnim,
            transform: [{ translateY: slideAnim }, { scale: pressScale }],
          },
        ]}
      >
        {/* Zone principale de la carte — appui pour cocher/décocher */}
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => onToggle(item.id)}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
        >
          {/* Miniature de l'image */}
          <Image
            source={{ uri: item.localUri }}
            style={styles.cardImage}
            resizeMode="cover"
          />

          {/* Overlay rouge + coche quand la page est sélectionnée */}
          {item.isSelected && (
            <View style={styles.selectedOverlay}>
              <View style={styles.checkCircle}>
                <Text style={styles.checkIcon}>✓</Text>
              </View>
            </View>
          )}

          {/* Bordure discrète quand la page est désélectionnée */}
          {!item.isSelected && <View style={styles.deselectedBorder} />}

          {/* Badge "Smart Cropped" en bas à gauche */}
          <View style={styles.smartBadge}>
            <Text style={styles.smartBadgeText}>✦ Smart Cropped</Text>
          </View>

          {/* Numéro de page en haut à gauche */}
          <View style={styles.pageNumBadge}>
            <Text style={styles.pageNumText}>#{index + 1}</Text>
          </View>
        </TouchableOpacity>

        {/* Bouton de partage rapide, positionné hors de la carte */}
        <TouchableOpacity
          style={styles.quickShareBtn}
          onPress={() => onShare(item.localUri)}
          activeOpacity={0.75}
        >
          <Text style={styles.quickShareIcon}>⬆</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  }
);

// ─── Composant Principal ────────────────────────────────────────────────────────

const InnovativePdfWorkspace: React.FC = () => {
  // ── États ─────────────────────────────────────────────────────────────────
  const [step,       setStep]       = useState<WorkspaceStep>('selection');
  const [pages,      setPages]      = useState<PdfPage[]>([]);
  const [pdfUri,     setPdfUri]     = useState<string | null>(null);
  const [loadingMsg, setLoadingMsg] = useState<string>('Initialisation…');

  // ── Références d'animation ───────────────────────────────────────────────
  const fadeAnim       = useRef(new Animated.Value(0)).current;
  const slideAnim      = useRef(new Animated.Value(40)).current;
  const loaderRotation = useRef(new Animated.Value(0)).current;
  // Référence vers la boucle du loader pour pouvoir l'arrêter proprement
  const loaderLoop = useRef<ReturnType<typeof Animated.loop> | null>(null);

  // ── Valeurs mémoïsées ────────────────────────────────────────────────────
  /** Pages cochées — recalculé uniquement quand `pages` change */
  const selectedPages = useMemo(
    () => pages.filter(p => p.isSelected),
    [pages]
  );

  /** Interpolation CSS-like : 0→1 devient '0deg'→'360deg' */
  const spin = loaderRotation.interpolate({
    inputRange:  [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // ── Nettoyage ────────────────────────────────────────────────────────────
  useEffect(() => {
    // Arrêt de l'animation infinie à la destruction du composant
    return () => { loaderLoop.current?.stop(); };
  }, []);

  // ── Animations ───────────────────────────────────────────────────────────

  /** Lance l'animation d'entrée du workspace (fondu + glissement vers le haut). */
  const animateWorkspaceIn = useCallback(() => {
    fadeAnim.setValue(0);
    slideAnim.setValue(40);
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1, duration: 500, useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0, tension: 60, friction: 10, useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  /** Démarre la rotation infinie du spinner de chargement. */
  const startLoader = useCallback(() => {
    loaderRotation.setValue(0);
    loaderLoop.current = Animated.loop(
      Animated.timing(loaderRotation, {
        toValue: 1, duration: 1100, useNativeDriver: true,
      })
    );
    loaderLoop.current.start();
  }, [loaderRotation]);

  /** Arrête le spinner proprement. */
  const stopLoader = useCallback(() => {
    loaderLoop.current?.stop();
    loaderLoop.current = null;
  }, []);

  // ── Actions utilisateur ──────────────────────────────────────────────────

  /** Demande la permission et ouvre le sélecteur d'images système. */
  const handlePickImages = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Autorisation requise',
        'L\'accès à la galerie photo est nécessaire pour sélectionner des images.',
        [{ text: 'Compris' }]
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes:            ['images'],
      allowsMultipleSelection: true,
      quality:               1,
    });

    if (result.canceled || result.assets.length === 0) return;

    const newPages: PdfPage[] = result.assets.map((asset, i) => ({
      id:         `page-${Date.now()}-${i}`,
      localUri:   asset.uri,
      isSelected: true,
      dimensions: { width: asset.width ?? CARD_W, height: asset.height ?? CARD_H },
      fileName:   asset.fileName ?? `image_${i + 1}.jpg`,
    }));

    setPages(newPages);
    await convertImages(newPages);
  }, []);

  /**
   * Envoie les images au backend Django (multipart/form-data),
   * récupère le PDF binaire, l'écrit localement et bascule vers le workspace.
   */
  const convertImages = useCallback(async (imagesToConvert: PdfPage[]) => {
    setStep('loading');
    startLoader();

    try {
      const formData = new FormData();

      // Ajout de chaque image au formulaire avec son type MIME
      for (let i = 0; i < imagesToConvert.length; i++) {
        const page = imagesToConvert[i];
        setLoadingMsg(`Analyse de la page ${i + 1} sur ${imagesToConvert.length}…`);

        const info = await FileSystem.getInfoAsync(page.localUri);
        if (!info.exists) continue;

        const ext      = page.fileName.split('.').pop()?.toLowerCase() ?? 'jpg';
        const mimeType = ext === 'png' ? 'image/png' : 'image/jpeg';

        formData.append('images', {
          uri:  page.localUri,
          name: page.fileName,
          type: mimeType,
        } as unknown as Blob);
      }

      setLoadingMsg('Génération du PDF en cours…');

      const response = await fetch(CONVERT_ENDPOINT, {
        method:  'POST',
        body:    formData,
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      setLoadingMsg('Optimisation et finalisation…');

      // Lecture du corps binaire via FileReader → base64
      const blob = await response.blob();
      const base64: string = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const dataUrl = reader.result as string;
          resolve(dataUrl.split(',')[1]);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });

      // Écriture locale du PDF
      const destPath = `${FileSystem.documentDirectory}itop_${Date.now()}.pdf`;
      await FileSystem.writeAsStringAsync(destPath, base64, { encoding: 'base64' });

      stopLoader();
      setPdfUri(destPath);
      setStep('workspace');
      animateWorkspaceIn();

    } catch {
      stopLoader();
      Alert.alert(
        'Conversion échouée',
        'Impossible de joindre le serveur. Vérifiez votre connexion et réessayez.',
        [
          { text: 'Annuler',   style: 'cancel', onPress: () => setStep('selection') },
          { text: 'Réessayer', onPress: () => convertImages(imagesToConvert) },
        ]
      );
    }
  }, [startLoader, stopLoader, animateWorkspaceIn]);

  /** Bascule la sélection d'une page par son identifiant. */
  const togglePage = useCallback((id: string) => {
    setPages(prev =>
      prev.map(p => (p.id === id ? { ...p, isSelected: !p.isSelected } : p))
    );
  }, []);

  /** Sélectionne tout ou désélectionne tout selon l'état courant. */
  const toggleAll = useCallback(() => {
    const allSelected = selectedPages.length === pages.length;
    setPages(prev => prev.map(p => ({ ...p, isSelected: !allSelected })));
  }, [selectedPages.length, pages.length]);

  /** Partage une image individuelle via la feuille de partage système. */
  const shareImage = useCallback(async (uri: string) => {
    const available = await Sharing.isAvailableAsync();
    if (!available) {
      Alert.alert('Indisponible', 'Le partage n\'est pas pris en charge sur cet appareil.');
      return;
    }
    await Sharing.shareAsync(uri);
  }, []);

  /**
   * Enregistre les images sélectionnées.
   * Pour une image unique → partage direct.
   * Pour plusieurs images → partage l'une après l'autre via l'API système.
   */
  const saveSelection = useCallback(async () => {
    if (selectedPages.length === 0) {
      Alert.alert('Aucune page sélectionnée', 'Cochez au moins une page avant d\'enregistrer.');
      return;
    }
    if (selectedPages.length === 1) {
      await shareImage(selectedPages[0].localUri);
    } else {
      Alert.alert(
        `${selectedPages.length} images sélectionnées`,
        'Partagez ou enregistrez chaque image individuellement en appuyant sur son bouton ⬆.',
        [{ text: 'Compris' }]
      );
    }
  }, [selectedPages, shareImage]);

  /** Exporte le PDF généré via la feuille de partage système. */
  const exportPdf = useCallback(async () => {
    if (!pdfUri) {
      Alert.alert('PDF non disponible', 'Aucun PDF n\'a encore été généré.');
      return;
    }
    const available = await Sharing.isAvailableAsync();
    if (!available) return;
    await Sharing.shareAsync(pdfUri, {
      mimeType:    'application/pdf',
      dialogTitle: 'Exporter le PDF',
      UTI:         'com.adobe.pdf',
    });
  }, [pdfUri]);

  /**
   * Simule la création d'un lien de collaboration partageable.
   * Dans une version production, ce lien serait généré par le backend
   * et associé à un espace de travail persistant côté serveur.
   */
  const inviteCollaborator = useCallback(() => {
    const randomId  = Math.random().toString(36).substring(2, 10);
    const shareLink = `https://formation.mayscorp.net/workspace/${randomId}`;
    Alert.alert(
      '👥 Invitation créée',
      `Lien copié dans votre presse-papiers :\n\n${shareLink}\n\nVotre collaborateur pourra visualiser et annoter ce document.`,
      [{ text: 'Parfait !' }]
    );
  }, []);

  /** Réinitialise l'ensemble du workspace et revient à l'écran de sélection. */
  const resetWorkspace = useCallback(() => {
    setPages([]);
    setPdfUri(null);
    setStep('selection');
  }, []);

  // ── Rendu de la FlatList ─────────────────────────────────────────────────

  const renderPage = useCallback(
    ({ item, index }: ListRenderItemInfo<PdfPage>) => (
      <PageCard
        item={item}
        index={index}
        onToggle={togglePage}
        onShare={shareImage}
        fadeAnim={fadeAnim}
        slideAnim={slideAnim}
      />
    ),
    [togglePage, shareImage, fadeAnim, slideAnim]
  );

  const keyExtractor = useCallback((item: PdfPage) => item.id, []);

  // ══════════════════════════════════════════════════════════════════════════
  // RENDU — ÉTAPE 1 : Sélection immersive
  // ══════════════════════════════════════════════════════════════════════════
  if (step === 'selection') {
    return (
      <View style={styles.root}>
        <StatusBar barStyle="light-content" backgroundColor={C.bg} />

        {/* En-tête de l'application */}
        <View style={styles.appHeader}>
          <View style={styles.logoRow}>
            <View style={styles.logoMark}>
              <Text style={styles.logoMarkText}>IT</Text>
            </View>
            <View>
              <Text style={styles.appName}>ITOP</Text>
              <Text style={styles.appTagline}>PDF Workspace</Text>
            </View>
          </View>
        </View>

        {/* Zone de dépôt principale */}
        <TouchableOpacity
          style={styles.dropZone}
          onPress={handlePickImages}
          activeOpacity={0.88}
        >
          {/* Orbe central animée */}
          <View style={styles.dropOrb}>
            <Text style={styles.dropOrbSymbol}>⊕</Text>
          </View>

          <Text style={styles.dropHeading}>Sélectionner des images</Text>
          <Text style={styles.dropHint}>
            PNG · JPEG · WEBP · GIF · PSD · HEIC · SVG
          </Text>

          {/* Bandeau de confidentialité */}
          <View style={styles.privacyPill}>
            <Text style={styles.privacyPillIcon}>🔒</Text>
            <Text style={styles.privacyPillText}>
              Vos données ne quittent jamais votre appareil
            </Text>
          </View>
        </TouchableOpacity>

        {/* Chips de fonctionnalités */}
        <View style={styles.chipsRow}>
          {(
            [
              { icon: '⚡', label: 'Rapide' },
              { icon: '✦', label: 'Smart Crop' },
              { icon: '↑', label: 'Partage' },
              { icon: '👥', label: 'Collaboratif' },
            ] as const
          ).map((chip, i) => (
            <View key={i} style={styles.chip}>
              <Text style={styles.chipIcon}>{chip.icon}</Text>
              <Text style={styles.chipLabel}>{chip.label}</Text>
            </View>
          ))}
        </View>

        {/* Pied de page */}
        <Text style={styles.footerNote}>
          Propulsé par ITOP · formation.mayscorp.net
        </Text>
      </View>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // RENDU — ÉTAPE 2 : Chargement animé
  // ══════════════════════════════════════════════════════════════════════════
  if (step === 'loading') {
    return (
      <View style={[styles.root, styles.center]}>
        <StatusBar barStyle="light-content" backgroundColor={C.bg} />

        {/* Orbe qui tourne */}
        <Animated.View style={{ transform: [{ rotate: spin }] }}>
          <View style={styles.loaderOrb}>
            <Text style={styles.loaderOrbSymbol}>✦</Text>
          </View>
        </Animated.View>

        <Text style={styles.loadingTitle}>Traitement intelligent</Text>
        <Text style={styles.loadingDetail}>{loadingMsg}</Text>

        <View style={styles.loadingPrivacyPill}>
          <Text style={styles.loadingPrivacyText}>🔒 Traitement local & sécurisé</Text>
        </View>
      </View>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // RENDU — ÉTAPE 3 : Workspace interactif
  // ══════════════════════════════════════════════════════════════════════════
  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />

      {/* En-tête du workspace */}
      <View style={styles.wsHeader}>
        <TouchableOpacity style={styles.wsBackBtn} onPress={resetWorkspace}>
          <Text style={styles.wsBackText}>← Nouveau</Text>
        </TouchableOpacity>

        <View style={styles.wsHeaderCenter}>
          <Text style={styles.wsPageCount}>
            {pages.length} page{pages.length > 1 ? 's' : ''}
          </Text>
          <Text style={styles.wsSelCount}>
            {selectedPages.length} sélectionnée{selectedPages.length > 1 ? 's' : ''}
          </Text>
        </View>

        <TouchableOpacity style={styles.wsToggleBtn} onPress={toggleAll}>
          <Text style={styles.wsToggleText}>
            {selectedPages.length === pages.length ? 'Aucune' : 'Tout'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* ── Galerie en grille 2 colonnes ── */}
      <FlatList<PdfPage>
        data={pages}
        renderItem={renderPage}
        keyExtractor={keyExtractor}
        numColumns={COLUMNS}
        contentContainerStyle={styles.galleryContainer}
        columnWrapperStyle={styles.galleryRow}
        showsVerticalScrollIndicator={false}
      />

      {/* ── Barre d'actions flottante ── */}
      <View style={styles.actionBar}>
        {/* Bouton principal : Enregistrer la sélection */}
        <TouchableOpacity
          style={styles.actionPrimary}
          onPress={saveSelection}
          activeOpacity={0.85}
        >
          <Text style={styles.actionPrimaryText}>
            ↓ Enregistrer la sélection ({selectedPages.length})
          </Text>
        </TouchableOpacity>

        {/* Ligne de boutons secondaires */}
        <View style={styles.actionSecRow}>
          {/* Export PDF complet */}
          <TouchableOpacity
            style={styles.actionSec}
            onPress={exportPdf}
            activeOpacity={0.85}
          >
            <Text style={styles.actionSecText}>Exporter PDF ⬆</Text>
          </TouchableOpacity>

          {/* Inviter un collaborateur */}
          <TouchableOpacity
            style={[styles.actionSec, styles.actionAccent]}
            onPress={inviteCollaborator}
            activeOpacity={0.85}
          >
            <Text style={styles.actionSecText}>👥 Inviter</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

// ─── StyleSheet ─────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  // Conteneur racine
  root: {
    flex:            1,
    backgroundColor: C.bg,
  },
  center: {
    justifyContent: 'center',
    alignItems:     'center',
    gap:            20,
  },

  // ── En-tête ──────────────────────────────────────────────────────────────
  appHeader: {
    paddingHorizontal: 24,
    paddingTop:        Platform.OS === 'android' ? 48 : 60,
    paddingBottom:     20,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           12,
  },
  logoMark: {
    width:           42,
    height:          42,
    borderRadius:    13,
    backgroundColor: C.primary,
    justifyContent:  'center',
    alignItems:      'center',
  },
  logoMarkText: {
    color:         C.white,
    fontSize:      14,
    fontWeight:    '800',
    letterSpacing: 1,
  },
  appName: {
    color:         C.text,
    fontSize:      20,
    fontWeight:    '800',
    letterSpacing: 1.5,
  },
  appTagline: {
    color:     C.textSub,
    fontSize:  11,
    marginTop: 1,
  },

  // ── Zone de dépôt ─────────────────────────────────────────────────────────
  dropZone: {
    marginHorizontal:  20,
    marginBottom:      16,
    borderRadius:      28,
    borderWidth:       1.5,
    borderColor:       C.border,
    borderStyle:       'dashed',
    backgroundColor:   C.surface,
    alignItems:        'center',
    paddingVertical:   44,
    paddingHorizontal: 24,
    gap:               14,
  },
  dropOrb: {
    width:           80,
    height:          80,
    borderRadius:    40,
    backgroundColor: C.primaryMuted,
    borderWidth:     1.5,
    borderColor:     C.primary,
    justifyContent:  'center',
    alignItems:      'center',
  },
  dropOrbSymbol: {
    fontSize: 34,
    color:    C.primary,
  },
  dropHeading: {
    color:      C.text,
    fontSize:   22,
    fontWeight: '700',
    textAlign:  'center',
  },
  dropHint: {
    color:         C.textSub,
    fontSize:      12,
    textAlign:     'center',
    letterSpacing: 0.5,
  },
  privacyPill: {
    flexDirection:     'row',
    alignItems:        'center',
    backgroundColor:   C.successMuted,
    borderRadius:      20,
    paddingHorizontal: 14,
    paddingVertical:   8,
    gap:               8,
    marginTop:         4,
  },
  privacyPillIcon: { fontSize: 14 },
  privacyPillText: {
    color:      C.success,
    fontSize:   11,
    fontWeight: '600',
    flexShrink: 1,
  },

  // ── Chips de fonctionnalités ──────────────────────────────────────────────
  chipsRow: {
    flexDirection:     'row',
    flexWrap:          'wrap',
    justifyContent:    'center',
    gap:               8,
    paddingHorizontal: 16,
  },
  chip: {
    flexDirection:     'row',
    alignItems:        'center',
    backgroundColor:   C.surfaceHigh,
    borderRadius:      20,
    paddingHorizontal: 12,
    paddingVertical:   7,
    gap:               6,
    borderWidth:       1,
    borderColor:       C.border,
  },
  chipIcon:  { fontSize: 13 },
  chipLabel: { color: C.textSub, fontSize: 12, fontWeight: '500' },

  // ── Pied de page ─────────────────────────────────────────────────────────
  footerNote: {
    color:     C.textDim,
    fontSize:  11,
    textAlign: 'center',
    position:  'absolute',
    bottom:    28,
    left:      0,
    right:     0,
  },

  // ── Loader ───────────────────────────────────────────────────────────────
  loaderOrb: {
    width:           100,
    height:          100,
    borderRadius:    50,
    backgroundColor: C.primaryMuted,
    borderWidth:     2,
    borderColor:     C.primary,
    justifyContent:  'center',
    alignItems:      'center',
  },
  loaderOrbSymbol: { fontSize: 42, color: C.primary },
  loadingTitle: {
    color:      C.text,
    fontSize:   22,
    fontWeight: '700',
  },
  loadingDetail: {
    color:      C.textSub,
    fontSize:   14,
    textAlign:  'center',
    maxWidth:   260,
  },
  loadingPrivacyPill: {
    backgroundColor:   C.successMuted,
    borderRadius:      20,
    paddingHorizontal: 16,
    paddingVertical:   8,
  },
  loadingPrivacyText: {
    color:      C.success,
    fontSize:   12,
    fontWeight: '600',
  },

  // ── En-tête du workspace ──────────────────────────────────────────────────
  wsHeader: {
    flexDirection:     'row',
    alignItems:        'center',
    paddingHorizontal: 16,
    paddingTop:        Platform.OS === 'android' ? 48 : 60,
    paddingBottom:     14,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  wsBackBtn: {
    paddingVertical:   8,
    paddingHorizontal: 12,
    borderRadius:      12,
    backgroundColor:   C.surfaceHigh,
  },
  wsBackText:     { color: C.textSub, fontSize: 13, fontWeight: '600' },
  wsHeaderCenter: { flex: 1, alignItems: 'center' },
  wsPageCount:    { color: C.text,    fontSize: 16, fontWeight: '700' },
  wsSelCount:     { color: C.textSub, fontSize: 11, marginTop: 2 },
  wsToggleBtn: {
    paddingVertical:   8,
    paddingHorizontal: 12,
    borderRadius:      12,
    backgroundColor:   C.surfaceHigh,
  },
  wsToggleText: { color: C.accent, fontSize: 13, fontWeight: '600' },

  // ── Galerie ───────────────────────────────────────────────────────────────
  galleryContainer: {
    padding:       16,
    paddingBottom: 190, // espace réservé pour la barre d'actions flottante
  },
  galleryRow: {
    justifyContent: 'space-between',
    marginBottom:   16,
  },

  // ── Carte de page ────────────────────────────────────────────────────────
  cardWrapper: {
    width:    CARD_W,
    overflow: 'visible',
  },
  cardImage: {
    width:           CARD_W,
    height:          CARD_H,
    borderRadius:    18,
    backgroundColor: C.surfaceHigh,
  },
  selectedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(204,50,52,0.22)',
    borderRadius:    18,
    borderWidth:     2,
    borderColor:     C.primary,
    justifyContent:  'flex-start',
    alignItems:      'flex-end',
    padding:         10,
  },
  checkCircle: {
    width:           26,
    height:          26,
    borderRadius:    13,
    backgroundColor: C.primary,
    justifyContent:  'center',
    alignItems:      'center',
  },
  checkIcon:      { color: C.white, fontSize: 13, fontWeight: '900' },
  deselectedBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 18,
    borderWidth:  1.5,
    borderColor:  C.border,
  },

  // Badge "Smart Cropped" — coin inférieur gauche
  smartBadge: {
    position:          'absolute',
    bottom:            10,
    left:              10,
    backgroundColor:   'rgba(13,13,20,0.82)',
    borderRadius:      8,
    paddingHorizontal: 8,
    paddingVertical:   4,
  },
  smartBadgeText: {
    color:         C.gold,
    fontSize:      9,
    fontWeight:    '700',
    letterSpacing: 0.4,
  },

  // Numéro de page — coin supérieur gauche
  pageNumBadge: {
    position:          'absolute',
    top:               10,
    left:              10,
    backgroundColor:   'rgba(13,13,20,0.82)',
    borderRadius:      8,
    paddingHorizontal: 8,
    paddingVertical:   4,
  },
  pageNumText: { color: C.textSub, fontSize: 10, fontWeight: '700' },

  // Bouton de partage rapide — coin inférieur droit, hors de la carte
  quickShareBtn: {
    position:        'absolute',
    bottom:          -12,
    right:           -6,
    width:           36,
    height:          36,
    borderRadius:    18,
    backgroundColor: C.surfaceHigh,
    borderWidth:     1,
    borderColor:     C.border,
    justifyContent:  'center',
    alignItems:      'center',
    zIndex:          10,
    elevation:       4,
  },
  quickShareIcon: { color: C.textSub, fontSize: 14 },

  // ── Barre d'actions flottante ─────────────────────────────────────────────
  actionBar: {
    position:          'absolute',
    bottom:            0,
    left:              0,
    right:             0,
    backgroundColor:   C.surface,
    borderTopWidth:    1,
    borderTopColor:    C.border,
    paddingHorizontal: 16,
    paddingTop:        16,
    paddingBottom:     Platform.OS === 'android' ? 20 : 36,
    gap:               10,
  },
  actionPrimary: {
    backgroundColor: C.primary,
    borderRadius:    16,
    paddingVertical: 16,
    alignItems:      'center',
  },
  actionPrimaryText: {
    color:      C.white,
    fontSize:   16,
    fontWeight: '700',
  },
  actionSecRow: {
    flexDirection: 'row',
    gap:           10,
  },
  actionSec: {
    flex:              1,
    backgroundColor:   C.surfaceHigh,
    borderRadius:      14,
    paddingVertical:   13,
    alignItems:        'center',
    borderWidth:       1,
    borderColor:       C.border,
  },
  actionAccent: {
    backgroundColor: C.accentMuted,
    borderColor:     C.accent,
  },
  actionSecText: {
    color:      C.text,
    fontSize:   14,
    fontWeight: '700',
  },
});

export default InnovativePdfWorkspace;
