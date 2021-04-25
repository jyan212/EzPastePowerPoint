import React from 'react';
import { StyleSheet, Text, View, Button } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
export default function About(){
    const test = async () => {
        try {
          await AsyncStorage.clear()
        } catch(e) {
          // clear error
          console.log(e);
        }
      }
    return (
        <View>
            <Text>About tab</Text>
            <Button title="delete" onPress={test}></Button>
        </View>
    )
}