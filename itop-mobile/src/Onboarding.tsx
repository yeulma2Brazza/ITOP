import React, { useRef, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated,
  StatusBar,
} from 'react-native'

const { width, height } = Dimensions.get('window')

const C = {
  bg:      '#0D0D14',
  surface: '#16161F',
  border:  '#2A2A3A',
  primary: '#CC3234',
  accent:  '#7B6EF6',
  text:    '#EAEAEA',
  muted:   '#6B6B80',
}

interface Slide {
  icon:     string
  title:    string
  subtitle: string
  accent:   string
  bg:       string
}

const SLIDES: Slide[] = [
  {
    icon:     '🔴',
    title:    'Bienvenue sur ITOP',
    subtitle: 'Convertissez n\'importe quelle image en PDF professionnel en quelques secondes.',
    accent:   '#CC3234',
    bg:       '#1A0F0F',
  },
  {
    icon:     '🖼️',
    title:    'Tous les formats acceptés',
    subtitle: 'PNG, JPG, GIF, TIFF, WEBP, HEIC, SVG, PSD — importez plusieurs images à la fois.',
    accent:   '#7B6EF6',
    bg:       '#0F0F1A',
  },
  {
    icon:     '⚡',
    title:    'Conversion instantanée',
    subtitle: 'Un seul appui suffit. Votre PDF est généré en quelques secondes sur nos serveurs sécurisés.',
    accent:   '#2ECC8B',
    bg:       '#0A1A13',
  },
  {
    icon:     '📤',
    title:    'Téléchargez & Partagez',
    subtitle: 'Sauvegardez votre PDF ou partagez-le directement depuis l\'application.',
    accent:   '#F59E0B',
    bg:       '#1A1508',
  },
]

interface OnboardingProps {
  onDone: () => void
}

export default function Onboarding({ onDone }: OnboardingProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const scrollRef = useRef<ScrollView>(null)
  const fadeAnim  = useRef(new Animated.Value(1)).current

  const goTo = (index: number) => {
    scrollRef.current?.scrollTo({ x: index * width, animated: true })
    setActiveIndex(index)
  }

  const handleNext = () => {
    if (activeIndex < SLIDES.length - 1) {
      goTo(activeIndex + 1)
    } else {
      onDone()
    }
  }

  const handleScroll = (e: { nativeEvent: { contentOffset: { x: number } } }) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / width)
    setActiveIndex(index)
  }

  const slide = SLIDES[activeIndex]
  const isLast = activeIndex === SLIDES.length - 1

  return (
    <View style={[styles.container, { backgroundColor: slide.bg }]}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Bouton Passer */}
      {!isLast && (
        <TouchableOpacity style={styles.skipBtn} onPress={onDone}>
          <Text style={styles.skipText}>Passer</Text>
        </TouchableOpacity>
      )}

      {/* Slides */}
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        scrollEventThrottle={16}
        style={styles.scroll}
      >
        {SLIDES.map((s, i) => (
          <View key={i} style={[styles.slide, { backgroundColor: s.bg }]}>

            {/* Icône principale */}
            <View style={[styles.iconWrap, { borderColor: s.accent + '44', backgroundColor: s.accent + '18' }]}>
              <Text style={styles.iconText}>{s.icon}</Text>
            </View>

            {/* Décoration — cercle flou */}
            <View style={[styles.glowCircle, { backgroundColor: s.accent + '14' }]} />

            <View style={styles.textBlock}>
              <Text style={[styles.title, { color: s.accent }]}>{s.title}</Text>
              <Text style={styles.subtitle}>{s.subtitle}</Text>
            </View>

          </View>
        ))}
      </ScrollView>

      {/* Bas — dots + bouton */}
      <View style={styles.bottom}>

        {/* Indicateurs de page */}
        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <TouchableOpacity key={i} onPress={() => goTo(i)}>
              <Animated.View
                style={[
                  styles.dot,
                  i === activeIndex
                    ? [styles.dotActive, { backgroundColor: slide.accent }]
                    : styles.dotInactive,
                ]}
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* Bouton Suivant / Commencer */}
        <TouchableOpacity
          style={[styles.nextBtn, { backgroundColor: slide.accent }]}
          onPress={handleNext}
          activeOpacity={0.85}
        >
          <Text style={styles.nextText}>
            {isLast ? 'Commencer →' : 'Suivant'}
          </Text>
        </TouchableOpacity>

        {/* Numérotation */}
        <Text style={styles.counter}>
          {activeIndex + 1} / {SLIDES.length}
        </Text>

      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.bg,
  },
  skipBtn: {
    position:  'absolute',
    top:       56,
    right:     24,
    zIndex:    10,
    paddingVertical:   8,
    paddingHorizontal: 16,
    borderRadius:      20,
    backgroundColor:   'rgba(255,255,255,0.08)',
  },
  skipText: {
    color:    C.muted,
    fontSize: 13,
    fontWeight: '600',
  },
  scroll: {
    flex: 1,
  },
  slide: {
    width,
    flex: 1,
    alignItems:     'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingTop:        80,
  },
  glowCircle: {
    position:     'absolute',
    width:        300,
    height:       300,
    borderRadius: 150,
    top:          height * 0.15,
  },
  iconWrap: {
    width:        130,
    height:       130,
    borderRadius: 40,
    borderWidth:  1.5,
    alignItems:     'center',
    justifyContent: 'center',
    marginBottom:   40,
    shadowColor:    '#000',
    shadowOpacity:  0.4,
    shadowRadius:   20,
    shadowOffset:   { width: 0, height: 8 },
    elevation:      12,
  },
  iconText: {
    fontSize: 60,
  },
  textBlock: {
    alignItems: 'center',
    gap:        16,
  },
  title: {
    fontSize:   30,
    fontWeight: '800',
    textAlign:  'center',
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize:   16,
    color:      C.muted,
    textAlign:  'center',
    lineHeight: 26,
    maxWidth:   300,
  },
  bottom: {
    paddingBottom:    48,
    paddingHorizontal: 32,
    alignItems:       'center',
    gap:              20,
  },
  dots: {
    flexDirection: 'row',
    gap:           8,
  },
  dot: {
    borderRadius: 4,
  },
  dotActive: {
    width:  28,
    height: 8,
  },
  dotInactive: {
    width:           8,
    height:          8,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  nextBtn: {
    width:          '100%',
    paddingVertical: 18,
    borderRadius:    20,
    alignItems:      'center',
    shadowOpacity:   0.35,
    shadowRadius:    16,
    shadowOffset:    { width: 0, height: 6 },
    elevation:       8,
  },
  nextText: {
    color:      '#fff',
    fontSize:   17,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  counter: {
    color:    C.muted,
    fontSize: 12,
  },
})
