import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Image, Button, TextInput } from 'react-native';
import { Overlay } from 'react-native-elements';
export default function Preview(props) {
    const [visible, setVisible] = useState(false);
    const [user, setUser] = useState(props.prevUser);
    const [pairCode, setPairCode] = useState(props.prevPairCode);
    const toggleOverlay = () => {
        setVisible(!visible);
    }
    return (
        <View style={{ width: '100%', height: '100%', flex: 1 }}>
            <Text>THIS IS A PREVIEW</Text>
            <Overlay style={styles.overlay} isVisible={visible} onBackdropPress={toggleOverlay}>
                <Text>Enter username</Text>
                <TextInput
                    style={styles.input}
                    onChangeText={setUser}
                    value={user}
                />
                <Text>Enter pair code</Text>
                <TextInput
                    style={styles.input}
                    onChangeText={setPairCode}
                    value={pairCode}
                />
                <Button title="confirm" onPress={() => {
                    props.changeCode(user, pairCode);
                    toggleOverlay();
                }}></Button>
            </Overlay>
            <Image style={{ flex: 1, resizeMode: 'contain', height: '100%', width: '100%' }} source={props.uri.length > 100 ? { uri: props.uri } : props.uri}></Image>
            <Text>{props.uri.length > 100 ? props.uri.substring(0, 35) : "hi"}</Text>
            <TextInput style={{ borderWidth: 1 }} value={props.fileName} onChange={props.handleChange}></TextInput>
            <Button title="RETAKE" onPress={props.retakeImage}></Button>
            <Button title="REMOVE BACKGROUND" onPress={() => { props.rmBack(props.photo) }}></Button>
            <Button title="SEND/POST" onPress={() => {
                if (user !== "" || pairCode !== "") {
                    props.postImg(props.photo)
                } else {
                    console.log("PLEASE ENTER YOUR PAIR CODE FIRST BEFORE POSTING")
                }
            }}></Button>
            <Button title="CHANGE PAIR CODE" onPress={toggleOverlay}></Button>
            <Button title="SAVE TO LIBRARY" onPress={props.saveToMediaLibrary}></Button>
        </View>
    )
}

const styles = StyleSheet.create({
    input: {
        height: 40,
        margin: 12,
        borderWidth: 1,
    },
    overlay: {
        height: 600,
        width: 400,
    }
});