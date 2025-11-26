import React, { useState } from 'react';
import { View, Text, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'; // <--- IMPORT THIS
import { PlayerProvider } from './context/PlayerContext';
import { ToastProvider } from './context/ToastContext';
import { HomeScreen } from './screens/HomeScreen';
import { UploadScreen } from './screens/UploadScreen';
import { LibraryScreen } from './screens/LibraryScreen';
import { SearchScreen } from './screens/SearchScreen';
import { TabBar } from './components/TabBar';
import { MiniPlayer } from './components/MiniPlayer';
import { Tab } from './types';
import { Icon } from './components/Icons';

const AppContent: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<Tab>(Tab.HOME);

  const renderScreen = () => {
    switch (currentTab) {
      case Tab.HOME:
        return <HomeScreen />;
      case Tab.UPLOAD:
        return <UploadScreen onSuccess={() => setCurrentTab(Tab.HOME)} />;
      case Tab.LIBRARY:
        return <LibraryScreen />;
      case Tab.SEARCH:
        return <SearchScreen />;
      case Tab.PROFILE:
        return (
          <View style={styles.centerContainer}>
            <Icon name="construction" size={48} color="#a855f7" style={{ marginBottom: 16 }} />
            <Text style={styles.text}>Coming Soon</Text>
          </View>
        );
      default:
        return <HomeScreen />;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      
      <View style={[styles.glow, styles.glowTop]} />
      <View style={[styles.glow, styles.glowBottom]} />

      <View style={styles.mainContent}>
        {renderScreen()}
      </View>

      <View style={styles.bottomContainer}>
         <MiniPlayer />
         <TabBar currentTab={currentTab} onTabChange={setCurrentTab} />
      </View>
    </SafeAreaView>
  );
};

const App: React.FC = () => {
  return (
    // WRAP EVERYTHING IN SAFE AREA PROVIDER
    <SafeAreaProvider>
      <PlayerProvider>
        <ToastProvider>
          <AppContent />
        </ToastProvider>
      </PlayerProvider>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  mainContent: {
    flex: 1,
    position: 'relative',
    zIndex: 1,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#71717a',
    fontSize: 16,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 20,
  },
  glow: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    opacity: 0.2,
  },
  glowTop: {
    top: -50,
    left: -50,
    backgroundColor: '#a855f7',
  },
  glowBottom: {
    bottom: -50,
    right: -50,
    backgroundColor: '#22c55e',
  },
});

export default App;