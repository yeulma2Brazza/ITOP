import { useEffect, useState } from 'react'
import { View, ActivityIndicator } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import Onboarding from './src/Onboarding'
import InnovativePdfWorkspace from './src/InnovativePdfWorkspace'

const ONBOARDING_KEY = 'itop_onboarding_done'

export default function App() {
  const [ready,       setReady]       = useState(false)
  const [showOnboard, setShowOnboard] = useState(false)

  useEffect(() => {
    AsyncStorage.getItem(ONBOARDING_KEY).then(value => {
      setShowOnboard(value === null)
      setReady(true)
    })
  }, [])

  const handleOnboardingDone = async () => {
    await AsyncStorage.setItem(ONBOARDING_KEY, 'true')
    setShowOnboard(false)
  }

  if (!ready) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0D0D14', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator color="#CC3234" size="large" />
      </View>
    )
  }

  if (showOnboard) {
    return <Onboarding onDone={handleOnboardingDone} />
  }

  return <InnovativePdfWorkspace />
}
