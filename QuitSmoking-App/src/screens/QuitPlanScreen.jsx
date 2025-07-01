import React, { useState, useContext, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { createQuitPlan, getSuggestedStages } from '../api/quitPlan';
import { fetchSmokingStatus } from '../api/user';
import { Ionicons } from '@expo/vector-icons';
import DateTimePickerModal from "react-native-modal-datetime-picker";

const QuitPlanScreen = ({ navigation }) => {
  const { user, token } = useAuth();
  const [goal, setGoal] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [note, setNote] = useState('');
  const [reasons, setReasons] = useState(['']);
  const [reasonsDetail, setReasonsDetail] = useState('');
  const [loading, setLoading] = useState(false);
  const [smokingData, setSmokingData] = useState(null);
  const [suggestedStages, setSuggestedStages] = useState(null);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      if (user && token) {
        try {
          // Fetch smoking status
          const status = await fetchSmokingStatus(token);
          if (status) {
            setSmokingData(status);
          }

          // Get suggested stages
          const stages = await getSuggestedStages(token);
          if (stages && stages.suggested_stages) {
            setSuggestedStages(stages.suggested_stages);
          }
        } catch (error) {
        }
      }
    };
    loadData();
  }, [user, token]);

  const addReason = () => {
    setReasons([...reasons, '']);
  };

  const updateReason = (text, index) => {
    const newReasons = [...reasons];
    newReasons[index] = text;
    setReasons(newReasons);
  };

  const removeReason = (index) => {
    const newReasons = reasons.filter((_, i) => i !== index);
    setReasons(newReasons);
  };

  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleConfirm = (date) => {
    const selectedDate = new Date(date);
    setStartDate(selectedDate.toISOString().split('T')[0]);

    const calculatedEndDate = new Date(selectedDate);
    calculatedEndDate.setDate(selectedDate.getDate() + 20);
    setEndDate(calculatedEndDate.toISOString().split('T')[0]);

    hideDatePicker();
  };

  const handleCreateQuitPlan = async () => {
    if (!user || !token) {
      Alert.alert('Error', 'User not authenticated.');
      return;
    }

    if (!goal || !startDate) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(startDate)) {
      Alert.alert('Error', 'Please enter a valid date in YYYY-MM-DD format');
      return;
    }

    setLoading(true);
    try {
      const planData = {
        user_id: user._id,
        coach_user_id: null,
        goal: goal,
        start_date: new Date(startDate).toISOString(),
        end_date: new Date(endDate).toISOString(),
        status: 'ongoing',
        note: note,
        reasons: reasons.filter(reason => reason.trim() !== ''),
        reasons_detail: reasonsDetail
      };

      const response = await createQuitPlan(planData, token);
      Alert.alert('Success', 'Quit Plan created successfully!');
      navigation.navigate('Main', { screen: 'QuitStage', params: { planId: response.plan._id } });
    } catch (error) {
      console.error('Failed to create quit plan:', error);
      Alert.alert('Error', error.message || 'Failed to create quit plan. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back-outline" size={28} color="#2C3E50" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Quit Plan</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.formContainer}>
          {suggestedStages && (
            <View style={styles.suggestedStagesContainer}>
              <Text style={styles.sectionTitle}>Suggested Plan Stages</Text>
              {suggestedStages.map((stage, index) => (
                <View key={index} style={styles.stageItem}>
                  <Text style={styles.stageName}>{stage.name}</Text>
                  <Text style={styles.stageDescription}>{stage.description}</Text>
                </View>
              ))}
            </View>
          )}

          <Text style={styles.label}>Goal *</Text>
          <TextInput
            style={styles.input}
            placeholder="What is your goal? (e.g., Quit completely, Reduce gradually)"
            value={goal}
            onChangeText={setGoal}
          />

          <Text style={styles.label}>Start Date *</Text>
          <TouchableOpacity onPress={showDatePicker} style={styles.input}>
            <Text style={{ color: startDate ? '#000' : '#ccc' }}>
              {startDate ? startDate : "YYYY-MM-DD"}
            </Text>
          </TouchableOpacity>

          <DateTimePickerModal
            isVisible={isDatePickerVisible}
            mode="date"
            onConfirm={handleConfirm}
            onCancel={hideDatePicker}
            minimumDate={new Date()}
          />

          <Text style={styles.label}>End Date</Text>
          <TextInput
            style={styles.input}
            value={endDate}
            editable={false}
            placeholder="End Date will be calculated automatically"
          />

          <Text style={styles.label}>Note</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Add any additional notes about your quit plan"
            value={note}
            onChangeText={setNote}
            multiline
            numberOfLines={4}
          />

          
          <TouchableOpacity 
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleCreateQuitPlan}
            disabled={loading}
          >
            <Text style={styles.submitButtonText}>
              {loading ? "Creating..." : "Create Quit Plan"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  headerRight: {
    width: 28,
  },
  scrollView: {
    flex: 1,
  },
  formContainer: {
    padding: 20,
  },
  suggestedStagesContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 18,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 15,
    textAlign: 'center',
  },
  stageItem: {
    marginBottom: 12,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  stageName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#4CAF50',
    marginBottom: 5,
  },
  stageDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 10,
    marginTop: 15,
  },
  input: {
    height: 55,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
    paddingTop: 15,
    marginBottom: 20,
  },
  reasonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  reasonInput: {
    flex: 1,
    marginRight: 10,
  },
  removeButton: {
    padding: 5,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
    alignSelf: 'flex-start',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: '#E8F5E9',
  },
  addButtonText: {
    color: '#4CAF50',
    fontSize: 16,
    marginLeft: 8,
    fontWeight: 'bold',
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 18,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 30,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 19,
    fontWeight: '700',
  },
});

export default QuitPlanScreen;



