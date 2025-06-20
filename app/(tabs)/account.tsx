import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, ScrollView, Modal, TextInput, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { MemoryStorage } from '@/utils/storage';
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY, ROLE } from '@/constants';
import { useGlobalStore } from '@/context/store';
import ProfileAvatar from '@/components/ui/profile';
import QRCode from 'react-native-qrcode-svg';
import * as Clipboard from 'expo-clipboard';

// TOTP utility functions
const generateSecret = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let secret = '';
  for (let i = 0; i < 32; i++) {
    secret += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return secret;
};

const generateTOTP = (secret: string) => {
  // Simple TOTP implementation for demo
  // In production, use a proper library like 'react-native-otp-generate'
  const now = Math.floor(Date.now() / 1000);
  const counter = Math.floor(now / 30);
  return String(counter % 1000000).padStart(6, '0');
};

const generateQRCodeData = (secret: string, username: string, issuer: string = 'YourApp') => {
  return `otpauth://totp/${issuer}:${username}?secret=${secret}&issuer=${issuer}`;
};

export default function AccountScreen() {
  const router = useRouter();
  const { setIsLoggedIn, user, role } = useGlobalStore();
  const [avatar, setAvatar] = useState({
    name: user || '',
    profilePicture: null as string | null,
  });
  
  // 2FA States
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [showDisableModal, setShowDisableModal] = useState(false);
  const [secret, setSecret] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [disableCode, setDisableCode] = useState('');
  const [qrCodeData, setQrCodeData] = useState('');
  const [setupStep, setSetupStep] = useState(1); // 1: QR/Manual, 2: Verify

  useEffect(() => {
    loadTwoFactorStatus();
  }, []);

  const loadTwoFactorStatus = async () => {
    const storage = new MemoryStorage();
    const twoFAStatus = await storage.getItem('2fa_enabled');
    const userSecret = await storage.getItem('2fa_secret');
    
    if (twoFAStatus === 'true') {
      setIs2FAEnabled(true);
      setSecret(userSecret || '');
    }
  };

  const handleProfilePictureChange = (uri: string) => {
    setAvatar(prev => ({ ...prev, profilePicture: uri }));
  };

  const handleLogout = async () => {
    const storage = new MemoryStorage();
    await storage.removeItem(ACCESS_TOKEN_KEY);
    await storage.removeItem(REFRESH_TOKEN_KEY);
    await storage.removeItem('user');
    await storage.removeItem(ROLE);
    setIsLoggedIn(false);
    router.replace('/auth/login');
  };

  const handleEnable2FA = () => {
    const newSecret = generateSecret();
    setSecret(newSecret);
    setQrCodeData(generateQRCodeData(newSecret, user ?? ''));
    setSetupStep(1);
    setShow2FAModal(true);
  };

  const handleDisable2FA = () => {
    setDisableCode('');
    setShowDisableModal(true);
  };

  const copySecretToClipboard = async () => {
    await Clipboard.setStringAsync(secret);
    Alert.alert('Copied!', 'Secret key copied to clipboard');
  };

  const verifyAndEnable2FA = async () => {
   
    const expectedCode = generateTOTP(secret);
    
    if (verificationCode === expectedCode || verificationCode === '123456') { // Allow demo code
      const storage = new MemoryStorage();
      await storage.setItem('2fa_enabled', 'true');
      await storage.setItem('2fa_secret', secret);
      
      setIs2FAEnabled(true);
      setShow2FAModal(false);
      setVerificationCode('');
      setSetupStep(1);
      
      Alert.alert('Success!', 'Two-factor authentication has been enabled.');
    } else {
      Alert.alert('Invalid Code', 'The verification code is incorrect. Please try again.');
    }
  };

  const verifyAndDisable2FA = async () => {
    const expectedCode = generateTOTP(secret);
    
    if (disableCode === expectedCode || disableCode === '123456') { // Allow demo code
      const storage = new MemoryStorage();
      await storage.removeItem('2fa_enabled');
      await storage.removeItem('2fa_secret');
      
      setIs2FAEnabled(false);
      setShowDisableModal(false);
      setDisableCode('');
      setSecret('');
      
      Alert.alert('Disabled', 'Two-factor authentication has been disabled.');
    } else {
      Alert.alert('Invalid Code', 'The verification code is incorrect. Please try again.');
    }
  };

  const renderQRStep = () => (
    <View className="items-center">
      <Text className="text-lg font-semibold text-white mb-4">Set up Two-Factor Authentication</Text>
      
      <View className="bg-white p-4 rounded-lg mb-4">
        <QRCode
          value={qrCodeData}
          size={200}
          backgroundColor="white"
          color="black"
        />
      </View>
      
      <Text className="text-sm text-gray-300 text-center mb-4">
        Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
      </Text>
      
      <Text className="text-sm text-white font-medium mb-2">Or enter this code manually:</Text>
      
      <TouchableOpacity 
        onPress={copySecretToClipboard}
        className="bg-gray-700 p-3 rounded-lg mb-4 flex-row items-center justify-between"
      >
        <Text className="text-white font-mono text-sm flex-1">{secret}</Text>
        <Ionicons name="copy-outline" size={20} color="#fff" />
      </TouchableOpacity>
      
      <View className="flex-row gap-x-2 w-full">
        <TouchableOpacity
          onPress={() => setShow2FAModal(false)}
          className="flex-1 bg-gray-600 py-3 rounded-lg"
        >
          <Text className="text-white text-center font-medium">Cancel</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          onPress={() => setSetupStep(2)}
          className="flex-1 bg-primary py-3 rounded-lg"
        >
          <Text className="text-white text-center font-medium">Next</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderVerifyStep = () => (
    <View className="items-center">
      <Text className="text-lg font-semibold text-white mb-4">Verify Setup</Text>
      
      <Text className="text-sm text-gray-300 text-center mb-4">
        Enter the 6-digit code from your authenticator app to complete setup
      </Text>
      
      <TextInput
        value={verificationCode}
        onChangeText={setVerificationCode}
        placeholder="Enter 6-digit code"
        placeholderTextColor="#666"
        className="bg-gray-700 text-white px-4 py-3 rounded-lg mb-4 w-full text-center text-lg font-mono"
        keyboardType="numeric"
        maxLength={6}
        autoFocus
      />
      
      <View className="flex-row gap-x-2 w-full">
        <TouchableOpacity
          onPress={() => setSetupStep(1)}
          className="flex-1 bg-gray-600 py-3 rounded-lg"
        >
          <Text className="text-white text-center font-medium">Back</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          onPress={verifyAndEnable2FA}
          className="flex-1 bg-primary py-3 rounded-lg"
          disabled={verificationCode.length !== 6}
        >
          <Text className="text-white text-center font-medium">Enable 2FA</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="px-4 py-6">
        {/* Header with Logout */}
        <View className="flex-row items-center justify-between mb-4">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text className="text-lg font-semibold text-white">Account</Text>
          <TouchableOpacity onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

       
        <View className="items-center mb-6">
          <ProfileAvatar user={{ name: avatar.name, profilePicture: avatar.profilePicture ?? undefined }} onImageChange={handleProfilePictureChange} size={80} />
        </View>

       
        <View className="bg-background rounded-2xl shadow-sm p-4 mb-4">
          <Text className="text-white font-semibold mb-2">PERSONAL INFORMATION</Text>
          {[{ label: 'Username', value: user }].map((item, index) => (
            <TouchableOpacity
              key={index}
              className="flex-row justify-between items-center py-3 border-b border-gray-100 last:border-b-0"
            >
              <Text className="text-sm text-white">{item.label}</Text>
              <Text className="text-sm font-medium text-white">{item.value}</Text>
            </TouchableOpacity>
          ))}
          <View className="flex-row justify-between items-center py-3 border-b border-gray-100 last:border-b-0">
            <Text className="text-sm text-white">Role</Text>
            <Text className="text-sm font-medium bg-primary py-1.5 px-2 rounded-xl text-white uppercase">
              {role}
            </Text>
          </View>
        </View>

        {/* Login Info */}
        <View className="bg-background rounded-2xl shadow-sm p-4 mb-4">
          <Text className="text-white font-semibold mb-2">LOGIN INFORMATION</Text>
          <View className="flex justify-between py-5 border-b border-primary">
            <Text className="text-sm text-white">Email</Text>
            <Text className="text-sm font-medium text-white">john@example.com</Text>
          </View>
          <TouchableOpacity className="flex-row justify-between items-center py-3 border-b border-primary">
            <Text className="text-sm text-white">Update password</Text>
            <Ionicons name="chevron-forward" size={18} color="#fff" />
          </TouchableOpacity>
          
          {/* 2FA Section */}
          <View className="py-3">
            <View className="flex-row justify-between items-center mb-2">
              <View>
              <Text className="text-sm text-white">Two-Factor Authentication</Text>
              <View className="flex-row items-center">
                <Text className={`text-xs font-medium mr-2 ${is2FAEnabled ? 'text-green-400' : 'text-gray-400'}`}>
                  {is2FAEnabled ? 'Enabled' : 'Disabled'}
                </Text>
                <Ionicons 
                  name={is2FAEnabled ? "shield-checkmark" : "shield-outline"} 
                  size={16} 
                  color={is2FAEnabled ? "#10b981" : "#9ca3af"} 
                />
              </View>
              </View>
              <View className='flex-col items-center gap-2'>
                 <TouchableOpacity
              onPress={is2FAEnabled ? handleDisable2FA : handleEnable2FA}
              className={`py-2 px-4 rounded-lg mt-3 ${is2FAEnabled ? 'bg-red-600' : 'bg-primary'}`}
            >
              <Text className="text-white text-center font-medium">
                {is2FAEnabled ? 'Disable 2FA' : 'Enable 2FA'}
              </Text>
            </TouchableOpacity>
             
              
               </View>
            </View>
            
    
          </View>
        </View>
      </ScrollView>

      {/* 2FA Setup Modal */}
      <Modal
        visible={show2FAModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShow2FAModal(false)}
      >
        <View className="flex-1 bg-black bg-opacity-50 justify-center items-center">
          <View className="bg-background rounded-2xl p-6 w-11/12 max-w-md">
            {setupStep === 1 ? renderQRStep() : renderVerifyStep()}
          </View>
        </View>
      </Modal>

      {/* Disable 2FA Modal */}
      <Modal
        visible={showDisableModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowDisableModal(false)}
      >
        <View className="flex-1 bg-black bg-opacity-50 justify-center items-center">
          <View className="bg-background rounded-2xl p-6 w-11/12 max-w-md">
            <Text className="text-lg font-semibold text-white mb-4 text-center">Disable 2FA</Text>
            
            <Text className="text-sm text-gray-300 text-center mb-4">
              Enter your current 6-digit authentication code to disable two-factor authentication
            </Text>
            
            <TextInput
              value={disableCode}
              onChangeText={setDisableCode}
              placeholder="Enter 6-digit code"
              placeholderTextColor="#666"
              className="bg-gray-700 text-white px-4 py-3 rounded-lg mb-4 w-full text-center text-lg font-mono"
              keyboardType="numeric"
              maxLength={6}
              autoFocus
            />
            
            <View className="flex-row space-x-2">
              <TouchableOpacity
                onPress={() => setShowDisableModal(false)}
                className="flex-1 bg-gray-600 py-3 rounded-lg"
              >
                <Text className="text-white text-center font-medium">Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={verifyAndDisable2FA}
                className="flex-1 bg-red-600 py-3 rounded-lg"
                disabled={disableCode.length !== 6}
              >
                <Text className="text-white text-center font-medium">Disable</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}