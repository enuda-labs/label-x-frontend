import React, {useState} from 'react';
import {
	View,
	Text,
	KeyboardAvoidingView,
	Platform,
	ScrollView,
	TouchableOpacity,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useLocalSearchParams, useRouter} from 'expo-router';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Ionicons} from '@expo/vector-icons';
import {AxiosClient} from '@/utils/axios';
import {isAxiosError} from 'axios';
import {MemoryStorage} from '@/utils/storage';
import {ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY} from '@/constants';
import {useGlobalStore} from '@/context/store';

interface LoginBody {
	username: string;
	password: string;
}

interface UserData {
	id: number;
	username: string;
	email: string;
}

interface LoginResponse {
	refresh: string;
	access: string;
	user_data: UserData;
}

export default function LoginScreen() {
	const params = useLocalSearchParams();
	const [username, setUsername] = useState((params?.username as string) || '');
	const [password, setPassword] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const [errorMessage, setErrorMessage] = useState('');
	const {setIsLoggedIn} = useGlobalStore();
	const router = useRouter();

	const handleLogin = async () => {
		try {
			if (!username || !password) {
				return setErrorMessage('Please enter username and password');
			}
			setIsLoading(true);
			setErrorMessage('');
			const axiosClient = new AxiosClient();
			const storage = new MemoryStorage();
			storage.removeItem(ACCESS_TOKEN_KEY);
			storage.removeItem(REFRESH_TOKEN_KEY);

			const response = await axiosClient.post<LoginBody, LoginResponse>(
				'/account/login/',
				{
					username,
					password,
				}
			);

			if (response.status === 200) {
				await storage.setItem(ACCESS_TOKEN_KEY, response.data.access);
				await storage.setItem(REFRESH_TOKEN_KEY, response.data.refresh);
				setIsLoggedIn(true);
				router.replace('/tasks/new');
			}
		} catch (error: any) {
			console.log(error.response?.data);
			if (isAxiosError(error)) {
				setErrorMessage(
					error.response?.data?.error || 'Unexpected error occurred'
				);
			} else {
				setErrorMessage(error.message || 'Unexpected error occurred');
			}
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<SafeAreaView className="flex-1 bg-background">
			<KeyboardAvoidingView
				behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
				className="flex-1"
			>
				<ScrollView
					contentContainerClassName="flex-grow justify-center px-6 py-12"
					keyboardShouldPersistTaps="handled"
				>
					<TouchableOpacity
						onPress={() => router.back()}
						className="absolute top-10 left-4 z-10"
					>
						<Ionicons name="arrow-back" size={24} color="#fff" />
					</TouchableOpacity>

					<View className="animate-fade-in flex-col gap-y-6 w-full max-w-sm mx-auto">
						<View className="space-y-2 text-center">
							<Text className="text-3xl font-bold tracking-tight text-foreground">
								Welcome back
							</Text>
							<Text className="text-muted-foreground text-sm">
								Sign in to your account to continue
							</Text>
						</View>

						<View className="flex-col gap-y-4">
							<Input
								label="Username"
								placeholder="Enter your username"
								value={username}
								onChangeText={setUsername}
								autoCapitalize="none"
							/>

							<Input
								label="Password"
								placeholder="Enter your password"
								value={password}
								onChangeText={setPassword}
								secureTextEntry
							/>

							<View className="flex items-end">
								<TouchableOpacity onPress={() => router.push('/')}>
									<Text className="text-sm text-primary">Forgot password?</Text>
								</TouchableOpacity>
							</View>
						</View>
						<Text className="text-red-500">{errorMessage}</Text>

						<Button
							onPress={handleLogin}
							isLoading={isLoading}
							//disabled={username === '' || password === ''}
							className="w-full"
						>
							Sign In
						</Button>

						<View className="flex-row justify-center space-x-1">
							<Text className="text-muted-foreground text-sm">
								Don't have an account?
							</Text>
							<TouchableOpacity onPress={() => router.push('/auth/register')}>
								<Text className="text-primary ml-2 font-medium">Sign up</Text>
							</TouchableOpacity>
						</View>
					</View>
				</ScrollView>
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
}
