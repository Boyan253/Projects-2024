import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, FlatList, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function App() {
  const [task, setTask] = useState(''); // State to hold the current task input
  const [tasks, setTasks] = useState([]); // State to hold the list of tasks
  const [filter, setFilter] = useState('all'); // State to track current filter (all, completed, pending)

  useEffect(() => {
    loadTasks();
  }, []);

  useEffect(() => {
    saveTasks();
  }, [tasks]);

  const loadTasks = async () => {
    try {
      const storedTasks = await AsyncStorage.getItem('@tasks');
      if (storedTasks) {
        setTasks(JSON.parse(storedTasks));
      }
    } catch (error) {
      console.error('Failed to load tasks', error);
    }
  };

  const saveTasks = async () => {
    try {
      await AsyncStorage.setItem('@tasks', JSON.stringify(tasks));
    } catch (error) {
      console.error('Failed to save tasks', error);
    }
  };

  const addTask = () => {
    if (task.trim() === '') {
      Alert.alert('Error', 'Task cannot be empty');
      return;
    }
    setTasks([...tasks, { id: Date.now().toString(), text: task, completed: false }]);
    setTask('');
  };

  const editTask = (id, newText) => {
    setTasks(tasks.map((item) => (item.id === id ? { ...item, text: newText } : item)));
  };

  const toggleTaskCompletion = (id) => {
    setTasks(tasks.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item)));
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter((item) => item.id !== id));
  };

  const applyFilter = () => {
    switch (filter) {
      case 'completed':
        return tasks.filter((task) => task.completed);
      case 'pending':
        return tasks.filter((task) => !task.completed);
      default:
        return tasks;
    }
  };

  const renderTask = ({ item }) => (
    <View style={styles.taskContainer}>
      <TouchableOpacity 
        style={[styles.taskTextContainer, item.completed && styles.completedTask]} 
        onPress={() => toggleTaskCompletion(item.id)}
      >
        <TextInput 
          style={styles.taskText} 
          value={item.text} 
          onChangeText={(newText) => editTask(item.id, newText)} 
        />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => deleteTask(item.id)}>
        <Text style={styles.deleteButton}>X</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Todo List</Text>
      
      <View style={styles.inputContainer}>
        <TextInput 
          style={styles.input} 
          placeholder="Add a new task" 
          value={task} 
          onChangeText={setTask} 
        />
        <TouchableOpacity style={styles.addButton} onPress={addTask}>
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.filterContainer}>
        <TouchableOpacity onPress={() => setFilter('all')} style={styles.filterButton}>
          <Text>All</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setFilter('completed')} style={styles.filterButton}>
          <Text>Completed</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setFilter('pending')} style={styles.filterButton}>
          <Text>Pending</Text>
        </TouchableOpacity>
      </View>

      <FlatList 
        data={applyFilter()} 
        renderItem={renderTask} 
        keyExtractor={(item) => item.id} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  input: {
    flex: 1,
    height: 40,
    borderColor: '#888',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
  },
  addButton: {
    backgroundColor: '#007BFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    paddingHorizontal: 16,
    marginLeft: 10,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 24,
  },
  taskContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  taskTextContainer: {
    flex: 1,
  },
  taskText: {
    fontSize: 16,
  },
  completedTask: {
    textDecorationLine: 'line-through',
    color: '#888',
  },
  deleteButton: {
    color: '#FF6347',
    fontWeight: 'bold',
    fontSize: 16,
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  filterButton: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#ddd',
  },
});
