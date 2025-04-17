import React, {useEffect, useState} from 'react';
import {
	View,
	Text,
	ScrollView,
	TouchableOpacity,
	ActivityIndicator,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useLocalSearchParams, useRouter} from 'expo-router';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import {cn} from '@/lib/cn';
import {MemoryStorage} from '@/utils/storage';
import {ACCESS_TOKEN_KEY} from '@/constants';
import {BASE_API_URL} from '../../constants/env-vars';
import {AxiosClient} from '@/utils/axios';

type Task = {
	task_id: number;
	serial_no: string;
	title: string;
	priority: 'low' | 'normal' | 'high';
	task_type: 'TEXT' | 'IMAGE' | 'VIDEO';
	status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
	human_reviewed: boolean;
	submitted_by: string;
	assigned_to: string | null;
	created_at: string;
	updated_at: string;
};

export default function TaskDetailScreen() {
	const router = useRouter();
	const {id} = useLocalSearchParams<{id: string}>();
	const [task, setTask] = useState<Task | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const priorityColors = {
		low: 'bg-blue-100 text-blue-800',
		normal: 'bg-green-100 text-green-800',
		high: 'bg-orange-100 text-orange-800',
	};

	const statusColors = {
		PENDING: 'bg-yellow-100 text-yellow-800',
		PROCESSING: 'bg-purple-100 text-purple-800',
		COMPLETED: 'bg-green-100 text-green-800',
		FAILED: 'bg-red-100 text-red-800',
	};

	const TaskIcon = () => {
		switch (task?.task_type) {
			case 'TEXT':
				return <MaterialCommunityIcons name="file-document" size={24} color="#F97316" />;
			case 'IMAGE':
				return <MaterialCommunityIcons name="file-image" size={24} color="#F97316" />;
			case 'VIDEO':
				return <MaterialCommunityIcons name="file-video" size={24} color="#F97316" />;
			default:
				return null;
		}
	};

	const StatusIcon = () => {
		switch (task?.status) {
			case 'PENDING':
				return <MaterialCommunityIcons name="clock" size={24} color="#eab308" />;
			case 'PROCESSING':
				return <MaterialCommunityIcons name="progress-clock" size={24} color="#a855f7" />;
			case 'COMPLETED':
				return <MaterialCommunityIcons name="check-circle" size={24} color="#22c55e" />;
			case 'FAILED':
				return <MaterialCommunityIcons name="alert-circle-outline" size={24} color="#ef4444" />;
			default:
				return null;
		}
	};

	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		return date.toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
		});
	};

	useEffect(() => {
		const fetchTaskDetails = async () => {
			try {
				const axiosClient = new AxiosClient();
				const response = await axiosClient.get<{status: string; data: Task}>(`/tasks/status/${id}/`);
				if (response.status === 200) {
					setTask(response.data.data);
				}
			} catch (err) {
				setError('Failed to load task details.');
			} finally {
				setLoading(false);
			}
		};

		fetchTaskDetails();
	}, [id]);

	useEffect(() => {
		let socket: WebSocket | null = null;

		const initializeWebSocket = async () => {
			if (id) {
				const storage = new MemoryStorage();
				const token = await storage.getItem(ACCESS_TOKEN_KEY);
				const url = `${BASE_API_URL.replace('https', 'wss').replace('/api/v1', '')}/ws/task/?token=${token}`;

				socket = new WebSocket(url);

				socket.onmessage = event => {
					const data = JSON.parse(event.data);
					if (data.id === Number(id)) {
						setTask(prev => (prev ? {...prev, ...data} : null));
					}
				};

				socket.onerror = () => setError('WebSocket connection error.');

				socket.onclose = e => console.log('WebSocket closed:', e.reason);
			}
		};

		initializeWebSocket();

		return () => {
			if (socket) socket.close();
		};
	}, [id]);

	if (loading) {
		return (
			<SafeAreaView className="flex-1 bg-background">
				<View className="flex-1 justify-center items-center p-4">
					<ActivityIndicator size="large" color="#00ff00" />
				</View>
			</SafeAreaView>
		);
	}

	if (error) {
		return (
			<SafeAreaView className="flex-1 bg-background">
				<View className="flex-1 justify-center items-center p-4">
					<Text className="text-lg text-foreground">{error}</Text>
					<TouchableOpacity
						onPress={() => router.back()}
						className="mt-4 px-4 py-2 bg-primary rounded-md"
					>
						<Text className="text-white">Go Back</Text>
					</TouchableOpacity>
				</View>
			</SafeAreaView>
		);
	}

	if (!task) {
		return (
			<SafeAreaView className="flex-1 bg-background">
				<View className="flex-1 justify-center items-center p-4">
					<Text className="text-lg text-foreground">Task not found</Text>
					<TouchableOpacity
						onPress={() => router.back()}
						className="mt-4 px-4 py-2 bg-primary rounded-md"
					>
						<Text className="text-white">Go Back</Text>
					</TouchableOpacity>
				</View>
			</SafeAreaView>
		);
	}

	return (
		<SafeAreaView className="flex-1 bg-background">
			<View className="flex-row items-center px-4 py-4 border-b border-border">
				<TouchableOpacity onPress={() => router.back()} className="mr-4">
					<MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
				</TouchableOpacity>
				<Text className="text-xl font-bold text-center flex-1 text-foreground">Task Details</Text>
			</View>

			<ScrollView className="flex-1 p-4">
				<View className="bg-card rounded-lg border border-border p-5 mb-6">
					<View className="flex-row items-center mb-4">
						<TaskIcon />
						<Text className="text-xl font-bold text-foreground ml-2 p-3">{task.title}</Text>
					</View>

					<View className="space-y-4">
						<View className="flex-row justify-between">
							<View>
								<Text className="text-sm text-muted-foreground">Status</Text>
								<View className="flex-row items-center mt-1">
									<StatusIcon />
									<Text className={cn('ml-1 font-medium px-2 py-1 rounded-md', statusColors[task.status])}>
										{task.status.charAt(0) + task.status.slice(1).toLowerCase()}
									</Text>
								</View>
							</View>

							<View>
								<Text className="text-sm text-muted-foreground">Priority</Text>
								<Text className={cn('mt-1 font-medium px-2 py-1 rounded-md', priorityColors[task.priority])}>
									{task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
								</Text>
							</View>

							<View>
								<Text className="text-sm text-muted-foreground py-1">Type</Text>
								<Text className="mt-1 font-medium text-foreground">
									{task.task_type.charAt(0) + task.task_type.slice(1).toLowerCase()}
								</Text>
							</View>
						</View>

						<View>
							<Text className="text-sm text-muted-foreground mt-3">Created At</Text>
							<Text className="mt-1 text-foreground">{formatDate(task.created_at)}</Text>
						</View>

						<View>
							<Text className="text-sm text-muted-foreground mb-2 mt-3">Sample Data</Text>
							<View className="p-4 bg-muted rounded-md">
								<Text className="text-foreground">
									{task.task_type === 'TEXT' && 'Sample text data for processing...'}
									{task.task_type === 'IMAGE' && 'Image URL or Base64 data would be here...'}
									{task.task_type === 'VIDEO' && 'Video URL or metadata would be here...'}
								</Text>
							</View>
						</View>
					</View>
				</View>

				<View className="bg-card rounded-lg border border-border p-5">
					<Text className="text-lg font-semibold text-foreground mb-4">Results</Text>

					{task.status === 'COMPLETED' ? (
						<View className="p-4 bg-muted rounded-md">
							<Text className="text-foreground">
								{task.task_type === 'TEXT' && 'Processed text analysis results...'}
								{task.task_type === 'IMAGE' && 'Processed image analysis results...'}
								{task.task_type === 'VIDEO' && 'Processed video analysis results...'}
							</Text>
						</View>
					) : (
						<View className="flex items-center justify-center py-8">
							<Text className="text-muted-foreground">
								{task.status === 'PENDING' && 'Task is pending processing...'}
								{task.status === 'PROCESSING' && 'Task is currently being processed...'}
								{task.status === 'FAILED' && 'Task processing failed. Please try again.'}
							</Text>
						</View>
					)}
				</View>
			</ScrollView>
		</SafeAreaView>
	);
}
