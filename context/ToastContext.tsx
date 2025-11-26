import React, { createContext, useContext, useState, useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Icon } from '../components/Icons';

interface ToastContextType {
  showToast: (message: string, type?: 'success' | 'info') => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info'; visible: boolean } | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'info' = 'success') => {
    setToast({ message, type, visible: true });
    
    setTimeout(() => {
      setToast(prev => prev ? { ...prev, visible: false } : null);
    }, 2500); 
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && toast.visible && (
        <View style={[
          styles.toastContainer, 
          toast.type === 'success' ? styles.successBg : styles.infoBg
        ]}>
          <Icon 
            name={toast.type === 'success' ? 'check-circle' : 'info'} 
            size={20} 
            color={toast.type === 'success' ? '#22c55e' : '#a1a1aa'}
            style={{ marginRight: 8 }}
          />
          <Text style={styles.toastText}>{toast.message}</Text>
        </View>
      )}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within ToastProvider");
  return context;
};

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    top: 60,
    alignSelf: 'center',
    zIndex: 100,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 50,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  successBg: {
    backgroundColor: '#18181b',
    borderColor: '#22c55e',
  },
  infoBg: {
    backgroundColor: '#18181b',
    borderColor: 'rgba(255,255,255,0.2)',
  },
  toastText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  }
});