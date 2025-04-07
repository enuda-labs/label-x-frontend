import React, {useState} from 'react';
import {
	View,
	Text,
	KeyboardAvoidingView,
	Platform,
	ScrollView,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useRouter} from 'expo-router';
import {TaskForm} from '@/components/task-form';
import {TouchableOpacity} from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import {AxiosClient} from '@/utils/axios';
import {isAxiosError} from 'axios';

interface TaskResponse {
	status: 'success' | 'error' | string; // Adjust based on possible values
	data: {
		celery_task_id: string;
		message: string;
		serial_no: string;
		status: 'PENDING' | 'SUCCESS' | 'FAILURE' | string; // You can make this more specific if needed
		submitted_by: string;
		task_id: number;
	};
}

export default function NewTaskScreen() {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);

	const handleSubmit = async (data: any) => {
		setIsLoading(true);
		try {
			const axiosClient = new AxiosClient();
			const response = await axiosClient.post<
				{task_type: string; data: string; priority: string},
				TaskResponse
			>('/tasks/', {
				task_type: data.type.toUpperCase(),
				data: data.data,
				priority: data.priority.toUpperCase(),
			});
			console.log(response.data);
			if (response.status === 201) {
				router.push(`/tasks/${response.data.data.task_id}`);
			}
		} catch (error) {
			if (isAxiosError(error)) {
				console.log(error.response?.data);
			}
			console.log(error);
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
				<View className="flex-row items-center px-4 py-4 border-b border-border">
					<TouchableOpacity
						onPress={() => router.push('/tasks/history')}
						className="mr-4"
					>
						<MaterialCommunityIcons name="menu" size={24} color="white" />
					</TouchableOpacity>
					<Text className="text-xl font-bold text-foreground text-center">
						Create New Task
					</Text>
				</View>

				<ScrollView
					contentContainerClassName="flex-grow p-4 mt-4"
					keyboardShouldPersistTaps="handled"
					showsVerticalScrollIndicator={false}
				>
					<TaskForm onSubmit={handleSubmit} isLoading={isLoading} />
				</ScrollView>
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
}
