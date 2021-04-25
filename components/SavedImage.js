import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Image, Button, Dimensions, TouchableOpacity} from 'react-native';

const width = Dimensions.get('window').width;
export default function SavedImage(props) {
    return (
        <View key={props.keys} style={styles.bar}> 
            <TouchableOpacity style={{ width: '100%', height: '100%', flex: 1 }} onPress={() => { props.showPreview(props.keys)}}>
                <Image style={styles.img} source={{uri:props.storedImgUri}}></Image>
                <View>
                <Text>Date: {props.date}</Text>
                <Text>Size: {props.size}</Text>
                </View>
                <Button title="Delete" onPress={()=> {props.deleteItem(props.keys)}}></Button>
            </TouchableOpacity>
        </View>
        
    )
}

const styles = StyleSheet.create({
    bar: {
        width: width,
        alignSelf:'stretch',
        height: 200,
        borderWidth:1,
    },
    img: {
        width:100,
        height:100,
    }
})