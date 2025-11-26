import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Dimensions } from 'react-native';
import { Tab } from '../types';
import { Icon } from './Icons';

interface TabBarProps {
  currentTab: Tab;
  onTabChange: (tab: Tab) => void;
}

const { width } = Dimensions.get('window');

export const TabBar: React.FC<TabBarProps> = ({ currentTab, onTabChange }) => {
  const tabs = [
    { id: Tab.HOME, icon: 'home', label: 'Home' },
    { id: Tab.SEARCH, icon: 'search', label: 'Search' },
    { id: Tab.UPLOAD, icon: 'plus-circle', label: 'Upload', isSpecial: true },
    { id: Tab.LIBRARY, icon: 'library', label: 'Library' },
    { id: Tab.PROFILE, icon: 'user', label: 'Profile' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {tabs.map((tab) => {
           const isActive = currentTab === tab.id;
           if (tab.isSpecial) {
             return (
               <TouchableOpacity 
                key={tab.id}
                onPress={() => onTabChange(tab.id)}
                style={styles.specialButtonContainer}
                activeOpacity={0.8}
               >
                 <View style={[
                   styles.specialButton, 
                   isActive ? styles.specialButtonActive : styles.specialButtonInactive
                 ]}>
                   <Icon name="plus" size={28} color={isActive ? "black" : "white"} />
                 </View>
               </TouchableOpacity>
             );
           }
           return (
             <TouchableOpacity
               key={tab.id}
               onPress={() => onTabChange(tab.id)}
               style={styles.tabButton}
               activeOpacity={0.7}
             >
               <View style={styles.iconContainer}>
                 <Icon name={tab.icon} size={24} color={isActive ? '#22c55e' : '#71717a'} />
               </View>
               <Text style={[styles.label, { color: isActive ? '#22c55e' : '#52525b' }]}>
                 {tab.label}
               </Text>
             </TouchableOpacity>
           );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.9)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
    paddingBottom: 20,
    paddingTop: 8,
    paddingHorizontal: 8,
    zIndex: 50,
    height: 80,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  iconContainer: {
    marginBottom: 4,
  },
  label: {
    fontSize: 10,
    fontWeight: '500',
  },
  specialButtonContainer: {
    position: 'relative',
    top: -20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  specialButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.30,
    shadowRadius: 4.65,
    elevation: 8,
  },
  specialButtonActive: {
    backgroundColor: '#22c55e',
    shadowColor: '#22c55e',
  },
  specialButtonInactive: {
    backgroundColor: '#27272a',
    borderWidth: 1,
    borderColor: '#3f3f46',
  }
});