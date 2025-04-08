import React from 'react';
import { View, Text, TextInput, TouchableOpacity, Image } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Input } from './ui/input';
import { Button } from './ui/button';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';

import CustomSelect from './ui/select';
const taskSchema = z.object({
  title: z.string().min(3, { message: 'Title must be at least 3 characters' }),
  type: z.enum(['text', 'image', 'video'], {
    required_error: 'Please select a task type',
  }),
  data: z.string().min(1, { message: 'Data is required' }),
  priority: z.enum(['low', 'normal', 'high'], {
    required_error: 'Please select a priority level',
  }),
});

type TaskFormData = z.infer<typeof taskSchema>;

type TaskFormProps = {
  onSubmit: (data: TaskFormData) => void;
  isLoading?: boolean;
};

const FilePicker = ({
  type,
  onFileSelect,
}: {
  type: 'image' | 'video';
  onFileSelect: (uri: string) => void;
}) => {
  const pickFile = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes:
        type === 'image'
          ? ImagePicker.MediaTypeOptions.Images
          : ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      onFileSelect(result.assets[0].uri);
    }
  };

  return (
    <TouchableOpacity
      onPress={pickFile}
      className="flex-row items-center justify-center gap-2 bg-foreground rounded-lg border border-[#e2e8f0]"
      style={{
        padding: 12,
      }}
    >
      <Ionicons name="cloud-upload-outline" size={24} color="black" />
      <Text className="">Pick {type === 'image' ? 'Image' : 'Video'}</Text>
    </TouchableOpacity>
  );
};

export const TaskForm = ({ onSubmit, isLoading = false }: TaskFormProps) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: { title: '', type: 'text', data: '', priority: 'normal' },
  });
  const [selectedFile, setSelectedFile] = React.useState<string | null>(null);

  return (
    <View style={{ width: '100%', gap: 24 }}>
      <Controller
        control={control}
        name="title"
        render={({ field: { onChange, value } }) => (
          <Input
            label="Task Title"
            placeholder="Enter task title"
            value={value}
            onChangeText={onChange}
            error={errors.title?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="type"
        render={({ field: { onChange, value } }) => (
          <View style={{ gap: 8 }}>
            <Text className="text-white font-semibold">Task Type</Text>
            <CustomSelect
              value={value}
              onValueChange={onChange}
              options={[
                { label: 'Text', value: 'text' },
                { label: 'Image', value: 'image' },
                { label: 'Video', value: 'video' },
              ]}
              placeholder="Select task type"
              error={errors.type?.message}
            />
          </View>
        )}
      />

      <Controller
        control={control}
        name="priority"
        render={({ field: { onChange, value } }) => (
          <View style={{ gap: 8 }}>
            <Text className="text-white font-semibold">Priority</Text>
            <CustomSelect
              value={value}
              onValueChange={onChange}
              options={[
                { label: 'Low', value: 'low' },
                { label: 'Normal', value: 'normal' },
                { label: 'High', value: 'high' },
              ]}
              placeholder="Select priority"
              error={errors.priority?.message}
            />
          </View>
        )}
      />

      <Controller
        control={control}
        name="data"
        render={({ field: { onChange, value } }) => (
          <View style={{ gap: 8 }}>
            <Text className="font-semibold text-white mt-3">Data to Process</Text>
            {watch('type') === 'text' ? (
              <TextInput
                placeholder="Enter or paste your data here"
                value={value}
                onChangeText={onChange}
                multiline
                numberOfLines={5}
                style={{
                  borderWidth: 1,
                  borderColor: errors.data ? '#ef4444' : '#e2e8f0',
                  borderRadius: 8,
                  padding: 12,
                  textAlignVertical: 'top',
                  minHeight: 120,
                  backgroundColor: '#fff',
                }}
              />
            ) : (
              <FilePicker
                type={watch('type') as 'image' | 'video'}
                onFileSelect={uri => {
                  setSelectedFile(uri);
                  onChange(uri);
                }}
              />
            )}

            {selectedFile && (
              <View>
                {watch('type') === 'image' ? (
                  <Image
                    source={{ uri: selectedFile }}
                    style={{ width: 100, height: 100, marginTop: 10 }}
                  />
                ) : (
                  <Text style={{ color: '#9ca3af', marginTop: 10 }}>Video Selected</Text>
                )}
              </View>
            )}

            {errors.data?.message && (
              <Text style={{ color: '#ef4444', fontSize: 12 }}>{errors.data.message}</Text>
            )}
          </View>
        )}
      />

      <Button onPress={handleSubmit(onSubmit)} isLoading={isLoading} className="w-full">
        Create Task
      </Button>
    </View>
  );
};
