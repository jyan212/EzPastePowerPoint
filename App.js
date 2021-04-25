import 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet, Text, View } from 'react-native';
import About from './screens/About';
import Library from './screens/Library';
import CameraTab from './screens/Cam';

// const Stack = createStackNavigator();


const Tabs = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tabs.Navigator>
        <Tabs.Screen name="Library" component={Library}></Tabs.Screen>
        <Tabs.Screen name="Camera" component={CameraTab}></Tabs.Screen>
        <Tabs.Screen name="About" component={About}></Tabs.Screen>
      </Tabs.Navigator>
    </NavigationContainer>
  );
}
