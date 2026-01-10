import { useState } from 'react';
import { HomeScreen } from './src/pages/HomeScreen';
import { TransplantQuestionnaire } from './src/pages/TransplantQuestionnaire';
import { StyleExamples } from './src/pages/StyleExamples';
import { StatusBar } from 'expo-status-bar';

import './src/styles/global.css';

type Screen = 'home' | 'questionnaire' | 'examples';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');

  return (
    <>
      {currentScreen === 'home' ? (
        <HomeScreen
          onNavigateToQuestionnaire={() => setCurrentScreen('questionnaire')}
          onNavigateToExamples={() => setCurrentScreen('examples')}
        />
      ) : currentScreen === 'questionnaire' ? (
        <TransplantQuestionnaire onNavigateToHome={() => setCurrentScreen('home')} />
      ) : (
        <StyleExamples onNavigateToHome={() => setCurrentScreen('home')} />
      )}
      <StatusBar style="dark" />
    </>
  );
}
