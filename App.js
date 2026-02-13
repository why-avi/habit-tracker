import React, { useState, useEffect } from 'react';

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
//Acts like permanent storage (similar to localStorage)

//Data survives app restarts

// Storage key for AsyncStorage
const STORAGE_KEY = '@habit_tracker_data';
//This is just a name used to store data. ... Save my habit data under this label.”
// Initial habits data
const INITIAL_HABITS = [
  { id: '1', name: '💧 Drink Water', description: 'Drink 8 glasses', completed: false },
  { id: '2', name: '🏃 Exercise', description: '30 minutes workout', completed: false },
  { id: '3', name: '📚 Read', description: 'Read for 20 minutes', completed: false },
  { id: '4', name: '🧘 Meditate', description: '10 minutes meditation', completed: false },
  { id: '5', name: '🥗 Eat Healthy', description: 'Include vegetables', completed: false },
];

export default function App() {
  // State: List of habits
  //useState → stores data that changes (habits, date)

  const [habits, setHabits] = useState(INITIAL_HABITS);
  
  // State: Current date
  const [currentDate, setCurrentDate] = useState('');

  // Effect: Load saved data when app starts
  //useEffect → runs code when the app starts or when data changes
  useEffect(() => {
    loadHabits();
    updateDate();
  }, []);

  // Effect: Save data whenever habits change
  useEffect(() => {
    saveHabits();
  }, [habits]);

  // Function: Format and update current date
  const updateDate = () => {
    const now = new Date();
    const options = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    setCurrentDate(now.toLocaleDateString('en-US', options));
  };

  // Function: Load habits from AsyncStorage
  //loadHabits: loadHabits looks at the saved date. If the saved date is "Yesterday" but the phone says it's "Today," the app says, "Wait, it's a new day! Reset all the checkboxes to 'false' so the user can start over."

  const loadHabits = async () => {
    try {
      //await AsyncStorage.getItem(STORAGE_KEY);;
      const savedData = await AsyncStorage.getItem(STORAGE_KEY);
      // Get the data that was saved under the name @habit_tracker_data.
      if (savedData !== null) {
        const { habits: savedHabits, date: savedDate } = JSON.parse(savedData);
        
        // Check if it's a new day
        // This is a clever way to handle daily resets without a backend. It compares the date string 
        //saved in storage to the current date. If they don't match, it maps through the habits and forces 
        //completed: false before setting the state.
        const today = new Date().toDateString();
        if ((savedDate) === today) {
          // Same day, load saved habits
          setHabits(savedHabits);
        } else {
          // New day, reset all habits to incomplete
         // We use .map() because it returns a new array. Inside, we use the spread operator (...habit) 
         //to create a shallow copy of the object and overwrite just the completed property. 
         //This ensures React detects the change and triggers a re-render.
          const resetHabits = savedHabits.map(habit => ({
            ...habit,
            completed: false
          }));
          setHabits(resetHabits);
        }
      }
    } catch (error) {
      console.error('Error loading habits:', error);
    }
  };

  // Function: Save habits to AsyncStorage
  //saveHabits: It takes your list of habits, turns it into a long string of text (JSON), 
  //and tucks it away in AsyncStorage under the label @habit_tracker_data.
    const saveHabits = async () => {
    try {
      const dataToSave = {
        habits,
        date: new Date().toDateString()
      };
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
      //Save this data under the name @habit_tracker_data
    } catch (error) {
      console.error('Error saving habits:', error);
    }
  };

  // Function: Toggle habit completion status
  const toggleHabit = (id) => {
    setHabits(prevHabits =>
      prevHabits.map(habit =>
        habit.id === id
          ? { ...habit, completed: !habit.completed }
          : habit
      )
    );
  };

  // Tyler S.
  // Function: Edit Habit

  // Function: Delete Habit
  const deleteHabit = (id) => {
    // Find habit in storage
    // remove habit by returning array without habit in it to storage
    // report result to user 
  }

  // Function: Add Habit
  const addHabit = () => {
    // Open add/edit dialogue
    // User input
    // save to storage with new key
  }

  // Calculate completion percentage
  const completedCount = habits.filter(h => h.completed).length;
  const percentage = Math.round((completedCount / habits.length) * 100);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Habit Tracker</Text>
        <Text style={styles.headerDate}>{currentDate}</Text>
        <Text style={styles.headerProgress}>
          {completedCount} / {habits.length} completed ({percentage}%)
        </Text>
      </View>

      {/* Habit List */}
      <ScrollView style={styles.habitList}>
        {habits.map(habit => (
          <HabitItem
            key={habit.id}
            habit={habit}
            onToggle={() => toggleHabit(habit.id)}
            onEdit={() => editHabit(habit)}
            onDelete={() => deleteHabit(habit.id)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

// Reusable Habit Item Component
function HabitItem({ habit, onToggle, onEdit, onDelete }) {
  return (
    <View style={[
      styles.habitItem,
      habit.completed && styles.habitItemCompleted
    ]}>
      <View style={styles.habitInfo}>
        <Text style={[
          styles.habitName,
          habit.completed && styles.habitNameCompleted
        ]}>
          {habit.name}
        </Text>
        <Text style={styles.habitDescription}>
          {habit.description}
        </Text>

        {/* Edit and Delete buttoms */}
      </View>

      {/* Toggle Button */}
      <TouchableOpacity
        style={[
          styles.toggleButton,
          habit.completed && styles.toggleButtonActive
        ]}
        onPress={onToggle}
      >
        <View style={[
          styles.toggleCircle,
          habit.completed && styles.toggleCircleActive
        ]} />
      </TouchableOpacity>
  
    </View>
  );
}

/*Summary for your notes:
State (useState): The app’s short-term memory (what’s happening right now).
AsyncStorage: The app’s long-term memory (saving to the phone's "hard drive").
Props: Passing information from the main App down to the individual Habit items.
Mapping: Taking a list of data and turning it into a list of visual items on the screen.
*/

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#061603',
    padding: 30,
    paddingTop: 60,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  headerDate: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 10,
  },
  headerProgress: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  habitList: {
    flex: 1,
    padding: 20,
  },
  habitItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  habitItemCompleted: {
    backgroundColor: '#e8f5e9',
  },
  habitInfo: {
    flex: 1,
  },
  habitName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  habitNameCompleted: {
    textDecorationLine: 'line-through',
    color: '#4caf50',
  },
  habitDescription: {
    fontSize: 14,
    color: '#666',
  },
  toggleButton: {
    width: 60,
    height: 30,
    backgroundColor: '#ccc',
    borderRadius: 15,
    justifyContent: 'center',
    padding: 3,
  },
  toggleButtonActive: {
    backgroundColor: '#4caf50',
  },
  toggleCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'white',
  },
  toggleCircleActive: {
    alignSelf: 'flex-end',
  },
});