import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Image, Button, TextInput, BackHandler, Alert } from 'react-native';
import { Overlay } from 'react-native-elements';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';

export default function Preview(props) {
    const [visible, setVisible] = useState(false);
    const [user, setUser] = useState(props.prevUser);
    const [pairCode, setPairCode] = useState(props.prevPairCode);
    const [capturedImage, setCapturedImage] = useState(props.photo);
    // Back handler
    useEffect(() => {
      const backAction = () => {
        Alert.alert('Hold on!', 'Go back without saving?', [
          {
            text: 'Cancel',
            onPress: () => null,
            style: 'cancel',
          },
          { text: 'YES', onPress: () => props.switchView() },
        ]);
          return true;
        };
    
        const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    
        return () => backHandler.remove();
    }, []);
  
    // Everytime a preview is loaded, set capturedImage as props.photo.
    /* added from CAM 
        PLS REMOVE IF ANYTHG GOES WRONG
    */
    const ALBUM_NAME = 'EZ PRESENTATION';
    const [storedImage, setStoredImage] = useState(null);
    // EVERY TIME OPEN PREVIEW, GET PREVIOUS ITEM
    useEffect(() => {
        AsyncStorage.getItem('@imagekey')
          .then( results => {
            setStoredImage(results);
            console.log(results);
          })
          .catch((e) => {
            // console.log(e)
            console.log(e);
          });
    },[])
    // TAKE
    // SET FILE NAME
    const [fileName, setFileName] = useState("");
    const handleChange = ({target}) => {
        setFileName(target.value);
    }
    // RMBACK API
    const predictSalObj = (img) => {
        fetch('http://192.168.0.129:5000/predict', {
          method: 'POST',
          mode:'cors',
          cache:'no-cache',
          credentials:'same-origin',
          headers: {
            // Accept: 'application/json',
            'Content-Type': 'application/json'
           },
          body: JSON.stringify({
            base64: img
           })
        }).then( response => response.json() )
          .then( json => {
            setCapturedImage(`data:image/png;base64,${json['base64']}`)
          })
          .catch( err => console.log(err))
    }

    // PREDICT TEXT API
    const [predictedText,setPredictedText] = useState("");
    const predictText = (img) => {
      fetch('http://192.168.0.129:5000/predictText', {
        method: 'POST',
        mode:'cors',
        cache:'no-cache',
        credentials:'same-origin',
        headers: {
          // Accept: 'application/json',
          'Content-Type': 'application/json'
         },
        body: JSON.stringify({
          base64: img
         })
      }).then( response => response.json() )
        .then( json => {
          setPredictedText(json)
        })
        .catch( err => console.log(err))
  }
    
    // REMOVE BACKGROUND (CALL API);  
    const rmBack = (photo) => {
        if(photo != null){
            predictSalObj(capturedImage.split("data:image/png;base64,")[1])
        }
    }

    // SEND IMAGE TO ADDIN OFFICE (MONGODB)
    const postImg = async (photo) => {
        console.log("posting img....")
     
        const img = {
          user:user,
          base64: photo.split(",")[1],
          code:pairCode,
        }
        try {
        const post = await fetch('http://192.168.0.129:3000/postImg', {
          method: 'POST',
          mode:'cors',
          cache:'no-cache',
          credentials:'same-origin',
          headers: {
            // Accept: 'application/json',
            'Access-Control-Allow-Origin':'*',
            'Content-Type': 'application/json'
           },
          body: JSON.stringify(img)
        })
        console.log("done posting... first, check your mongodb")
        } catch (err) {
          console.log(err);
        }
        console.log("posting done...")
      }
    // TOGGLE OVERLAY
    const toggleOverlay = () => {
        setVisible(!visible);
    }

    // SAVE IMAGE TO MEDIA LIBRARY
    const saveToMediaLibrary = async () => {
        if(props.hasMediaLibraryPermission && capturedImage !== null){
            const albumId = await MediaLibrary.getAlbumAsync(ALBUM_NAME);
          try {
            let dir = FileSystem.documentDirectory;
            let capturedImageBase64 = capturedImage.split('data:image/png;base64,')[1]
            let capturedImageString = capturedImageBase64.substring(0,15)
            let pathToBase64 = capturedImageString.split("");
            pathToBase64 = pathToBase64.map((x) => { return x == '/' ? "A" : x});
            pathToBase64 = pathToBase64.join();
            dir = dir+'/'+pathToBase64+'.png';

            FileSystem.writeAsStringAsync(dir, capturedImageBase64, { encoding: FileSystem.EncodingType.Base64 } )
              .then(() => {
                  console.log("Successfully added...")
              })
              .catch( err => console.log(err));
            const asset = await MediaLibrary.createAssetAsync(dir);
    
            if ( albumId == null ){
                MediaLibrary.createAlbumAsync(ALBUM_NAME, asset)
                .then(() => {
                    console.log('Album created!');
                 })
                .catch(error => {
                    console.log('err', error);
                 });
            } else {
                MediaLibrary.addAssetsToAlbumAsync([asset], albumId);
                MediaLibrary.getAssetInfoAsync(asset).then( result => console.log(result))
            }
            // const results = await MediaLibrary.saveToLibraryAsync(capturedImage.uri);
            // setStoredImage( (prev) => {
            //     return [capturedImage, ...prev];
            // })
            storeData(asset);
            props.retakeImage();
            props.navigation.navigate('Library');
          } catch (err) {
            console.log("err is here :"+err)
          }
        } else {
            alert("Required permission for media library");
        }
      }

      const storeData = async (value) => {
        const jsonValue = JSON.stringify(value);
        let storedImgArr = [];
        try {
          if (storedImage == null){
            storedImgArr.push(jsonValue);
          } else {
            storedImgArr = storedImage.split(",");
            storedImgArr.push(jsonValue);
          }
          storedImgArr = storedImgArr.toString();
          await AsyncStorage.setItem('@imagekey', storedImgArr);
        } catch (e) {
          // saving error
          // console.log(e);
          console.log(e)
        }
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
                {/* OVERLAY END HERE */}
            </Overlay>
            <Image style={{ 
                    flex: 1, 
                    resizeMode: 'contain', 
                    height: '100%', 
                    width: '100%' 
                    }} 
                    source={{uri: capturedImage}}></Image>
            <Text>{ props.photo.substring(0, 35) }</Text>
            <Text>{predictedText}</Text>
            <TextInput style={{ borderWidth: 1 }} 
                       value={fileName} 
                       onChange={handleChange}></TextInput>
            <Button title="RETAKE" 
                    onPress={props.retakeImage}
                    disabled={props.retakeImage == null ? true : false}></Button>
            <Button title="REMOVE BACKGROUND"
                    onPress={() => { rmBack(props.photo) }}></Button>
            <Button title="SEND/POST"
                    onPress={() => {
                    if (user !== "" || pairCode !== "") {
                        postImg(capturedImage)
                    } else {
                        console.log("PLEASE ENTER YOUR PAIR CODE FIRST BEFORE POSTING")
                    }
                    }}></Button>
            <Button title="PREDICT TEXT" 
                onPress={( ) => {
                    predictText(props.photo)
                    }}></Button>        
            <Button title="CHANGE PAIR CODE" 
                    onPress={toggleOverlay}></Button>
            <Button title="SAVE TO LIBRARY" 
                onPress={( ) => {
                     saveToMediaLibrary()
                    }}></Button>
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