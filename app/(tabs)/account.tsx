import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ScrollView,
  Modal,
  TextInput,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { MemoryStorage } from '@/utils/storage';
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY, ROLE } from '@/constants';
import { useGlobalStore } from '@/context/store';
import ProfileAvatar from '@/components/ui/profile';
import * as Clipboard from 'expo-clipboard';
import {
  changePassword,
  disable2FASetup,
  get2FASetup,
  updateUsername,
  verify2FASetup,
} from '@/services/apis/auth';

export default function AccountScreen() {
  const router = useRouter();
  const { setIsLoggedIn, user, role } = useGlobalStore();
  const [avatar, setAvatar] = useState({
    name: user || '',
    profilePicture: null as string | null,
  });
  const [userData, setUserData] = useState<{ username: string; email: string } | null>(null);

  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [show2FAModal, setShow2FAModal] = useState(false);
  // const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [showDisableModal, setShowDisableModal] = useState(false);
  const [secret, setSecret] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [disableCode, setDisableCode] = useState('');
  const [qrCodeData, setQrCodeData] = useState('');
  const [setupStep, setSetupStep] = useState(1);

  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [username, setUsername] = useState(userData?.username ?? '');

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    loadTwoFactorStatus();
    loadUserData(); // Load user info
  }, []);

  useEffect(() => {
    if (userData?.username) {
      setUsername(userData.username);
    }
  }, [userData]);

  const loadUserData = async () => {
    try {
      const storage = new MemoryStorage();
      const storedUser = await storage.getItem('user');

      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUserData({
          username: parsedUser.username || 'N/A',
          email: parsedUser.email || 'N/A',
        });
      }
    } catch (err) {
      console.error('Failed to load user data:', err);
    }
  };

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

  const handleEnable2FA = async () => {
    try {
      const setupData = await get2FASetup(); // Call API
      setSecret(setupData.secret_key); // Set secret if you need it locally (optional)
      setQrCodeData(setupData.qr_code_url); // Show QR code from backend
      setSetupStep(1);
      setShow2FAModal(true);
    } catch (error) {
      Alert.alert('Error', 'Failed to initialize 2FA setup.');
      console.error(error);
    }
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
    try {
      const success = await verify2FASetup(verificationCode); // Call API

      if (success) {
        const storage = new MemoryStorage();
        await storage.setItem('2fa_enabled', 'true');

        setIs2FAEnabled(true);
        setShow2FAModal(false);
        setVerificationCode('');
        setSetupStep(1);

        Alert.alert('Success!', 'Two-factor authentication has been enabled.');
      } else {
        Alert.alert('Invalid Code', 'The verification code is incorrect. Please try again.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to verify 2FA setup.');
      console.error(error);
    }
  };

  const verifyAndDisable2FA = async () => {
    try {
      const success = await disable2FASetup(disableCode); // Send password (not OTP) to backend

      if (success) {
        const storage = new MemoryStorage();
        await storage.removeItem('2fa_enabled');
        await storage.removeItem('2fa_secret');

        setIs2FAEnabled(false);
        setShowDisableModal(false);
        setDisableCode('');
        setSecret('');

        Alert.alert('Disabled', 'Two-factor authentication has been disabled.');
      } else {
        Alert.alert('Invalid Password', 'The password is incorrect. Please try again.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to disable 2FA.');
      console.error(error);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'All fields are required.');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match.');
      return;
    }

    try {
      const response = await changePassword({
        current_password: currentPassword,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });

      if (response.status !== 'success') {
        throw new Error(response.message || 'Failed to change password.');
      }

      setShowPasswordModal(false); // ✅ Close modal first
      Alert.alert('Password changed successfully'); // ✅ Show success message
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'An error occurred.');
    }
  };

  const handleUpdateUsername = async () => {
    if (!username.trim()) {
      Alert.alert('Error', 'Username cannot be empty.');
      return;
    }

    try {
      const response = await updateUsername({ username });

      if (response.status === 'success') {
        Alert.alert('Success', 'Username updated successfully.');
        setIsEditingUsername(false); // ✅ Closes the edit mode
        // Optionally update the user data here
      } else {
        throw new Error(response.message || 'Failed to update username.');
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'An error occurred.');
    }
  };

  const renderQRStep = () => (
    <View className="items-center">
      <Text className="text-lg font-semibold text-white mb-4">
        Set up Two-Factor Authentication
      </Text>

      <View className="bg-white p-4 rounded-lg mb-4">
        <Image
          source={{ uri: qrCodeData }}
          style={{ width: 200, height: 200 }}
          resizeMode="contain"
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
          <ProfileAvatar
            user={{
              name: typeof avatar.name === 'string' ? avatar.name : avatar.name?.username || 'User',
              profilePicture: avatar.profilePicture ?? undefined,
            }}
            onImageChange={handleProfilePictureChange}
            size={80}
          />
        </View>

        <View className="bg-background rounded-2xl shadow-sm p-4 mb-4">
          <Text className="text-white font-semibold mb-2">PERSONAL INFORMATION</Text>
          <View className="py-3 border-b border-gray-100">
            <Text className="text-sm text-white mb-1">Username</Text>

            {isEditingUsername ? (
              <View className="flex-row items-center justify-between">
                <TextInput
                  value={username}
                  onChangeText={setUsername}
                  className="flex-1 bg-white text-black rounded px-2 py-1 mr-2"
                  placeholder="Enter username"
                />

                <TouchableOpacity onPress={handleUpdateUsername}>
                  <Text className="text-primary font-medium">Save</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    setUsername(userData?.username ?? '');
                    setIsEditingUsername(false);
                  }}
                >
                  <Text className="text-red-500 font-medium ml-2">Cancel</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                className="flex-row justify-between items-center"
                onPress={() => setIsEditingUsername(true)}
              >
                <Text className="text-sm font-medium text-white">{username}</Text>
                <Ionicons name="create-outline" size={18} color="#fff" />
              </TouchableOpacity>
            )}
          </View>

          <View className="flex-row justify-between items-center py-3 border-b border-gray-100 last:border-b-0">
            <Text className="text-sm text-white">Role</Text>
            <Text className="text-sm font-medium bg-primary py-1.5 px-2 rounded-xl text-white capitalize">
              {role}
            </Text>
          </View>
        </View>
        <Modal visible={showPasswordModal} transparent animationType="slide">
          <View className="flex-1 justify-center items-center bg-black/70 px-4">
            <View className="bg-background rounded-2xl p-6 w-full">
              <Text className="text-lg font-bold mb-4 text-white text-center">Change Password</Text>

              <TextInput
                placeholder="Current Password"
                placeholderTextColor="#9ca3af"
                secureTextEntry
                value={currentPassword}
                onChangeText={setCurrentPassword}
                className="border border-primary rounded-xl p-3 mb-3 text-white"
              />
              <TextInput
                placeholder="New Password"
                placeholderTextColor="#9ca3af"
                secureTextEntry
                value={newPassword}
                onChangeText={setNewPassword}
                className="border border-primary rounded-xl p-3 mb-3 text-white"
              />
              <TextInput
                placeholder="Confirm Password"
                placeholderTextColor="#9ca3af"
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                className="border border-primary rounded-xl p-3 mb-4 text-white"
              />

              <TouchableOpacity
                onPress={handleChangePassword}
                className="bg-primary rounded-xl py-3 mb-3"
              >
                <Text className="text-white text-center font-semibold">Submit</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setShowPasswordModal(false)}>
                <Text className="text-center text-red-500 font-medium">Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Login Info */}
        <View className="bg-background rounded-2xl shadow-sm p-4 mb-4">
          <Text className="text-white font-semibold mb-2">LOGIN INFORMATION</Text>
          <View className="flex justify-between py-5 border-b border-primary">
            <Text className="text-sm text-white">Email</Text>
            <Text className="text-sm font-medium text-white">{userData?.email ?? 'N/A'}</Text>
          </View>
          <TouchableOpacity
            onPress={() => setShowPasswordModal(true)}
            className="flex-row justify-between items-center py-5 border-b border-primary"
          >
            <Text className="text-sm text-white">Update password</Text>
            <Ionicons name="chevron-forward" size={18} color="#fff" />
          </TouchableOpacity>

          {/* 2FA Section Starts here */}
          <View className="py-3">
            <View className="flex-row justify-between items-center mb-2">
              <View>
                <Text className="text-sm text-white">Two-Factor Authentication</Text>
                <View className="flex-row items-center">
                  <Text
                    className={`text-xs font-medium mr-2 ${is2FAEnabled ? 'text-green-400' : 'text-gray-400'}`}
                  >
                    {is2FAEnabled ? 'Enabled' : 'Disabled'}
                  </Text>
                  <Ionicons
                    name={is2FAEnabled ? 'shield-checkmark' : 'shield-outline'}
                    size={16}
                    color={is2FAEnabled ? '#10b981' : '#9ca3af'}
                  />
                </View>
              </View>
              <View className="flex-col items-center gap-2">
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
              Enter your account password to disable two-factor authentication.
            </Text>

            <TextInput
              value={disableCode}
              onChangeText={setDisableCode}
              placeholder="Enter your password"
              placeholderTextColor="#666"
              className="bg-gray-700 text-white px-4 py-3 rounded-lg mb-4 w-full text-center text-base"
              keyboardType="default"
              secureTextEntry
              autoCapitalize="none"
            />

            <View className="flex-row gap-x-2">
              <TouchableOpacity
                onPress={() => setShowDisableModal(false)}
                className="flex-1 bg-gray-600 py-3 rounded-lg"
              >
                <Text className="text-white text-center font-medium">Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={verifyAndDisable2FA}
                className="flex-1 bg-red-600 py-3 rounded-lg"
                disabled={disableCode.trim().length < 6} // minimum password length check
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
