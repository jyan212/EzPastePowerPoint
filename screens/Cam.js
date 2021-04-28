import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image} from 'react-native';
import { Camera } from 'expo-camera';
import Preview from '../components/Preview';
import * as MediaLibrary from 'expo-media-library';

export default function CameraTab({navigation}){
  /* TO DO :
    MOVE SIDE EFFECT AND MODULES TO
    PREVIEW COMPONENTS.

    PROVIDE IMG ID, DEN PREVIEW SPECIFICC IMAGE
    PASS TO PHOTO
    KEEP:
    photo,source=uri, changePairCode(), retakeImage()
  */
  const [hasCaptured, setHasCaptured]  = useState(false);
  const [hasPermission, setHasPermission] = useState(null);
  const [hasMediaLibraryPermission, setHasMediaLibraryPermission] = useState(null);
  const [type, setType] = useState(Camera.Constants.Type.back);
  const [capturedImage, setCapturedImage] = useState(null);
  const [user,setUser] = useState("");
  const [pairCode,setPairCode] = useState("");

  // camera ref
  const camera = useRef(null);
  // Granting Camera Permission
  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);
  
  // Granting Library Permission
  useEffect(() => {
    (async () => {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      setHasMediaLibraryPermission(status === 'granted');
    })();
  }, []);

  if (hasPermission === null) {
    return <View />;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }
  const takeImage = async () => {
    if (camera) {
        const options = {quality: 1, base64: true};
        const photo  = await camera.current.takePictureAsync(options);
        setHasCaptured(true);
        setCapturedImage(`data:image/png;base64,${photo.base64}`)
        console.log("FIRST:"+photo.base64.substring(20,30));
        // This data is then send to U-NET API to remove background
        // The processed image is then store to media library
    }
  }
  // CHG CODE, SAVE CODE AT MAIN SCREEN
  const changeCode = (user,pairCode) => {
    setPairCode(pairCode);
    setUser(user);
  }
  // RETAKE IMAGE
  const retakeImage = () => {
      setHasCaptured(false);
      setCapturedImage(null);
  }
  
    /*
      FUNCTION MIGHT NEED TO MOVE TO PREVIEWJS FOR CONSISTENCY/DATA TRANSFER
    */
  return  (
    <View style={styles.container}>
      {hasCaptured && capturedImage ? 
        <Preview 
              photo={capturedImage} 
              retakeImage={retakeImage}
              changeCode={changeCode}
              navigation={navigation}
              hasMediaLibraryPermission={hasMediaLibraryPermission}
              prevUser={user}
              prevPairCode={pairCode}
              switchView={retakeImage}
              ></Preview> :
        <Camera style={styles.camera} 
                type={type} 
                ratio="1:1" 
                pictureSize="2448x2448" 
                ref={camera} >
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => {
              setType(
                type === Camera.Constants.Type.back
                  ? Camera.Constants.Type.front
                  : Camera.Constants.Type.back
              );
            }}>
            <Text style={styles.text}> Flip </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.snapButton}     
            onPress={()=>{ takeImage() }}>
            <Text style={styles.text}> Snap </Text>
          </TouchableOpacity>
        </View>
      </Camera>}
    </View>
  );
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent:'center'
    },
    camera: {
      flex: 0.6,
      marginTop:50,
    },
    buttonContainer: {
      flex: 1,
      backgroundColor: 'transparent',
      flexDirection: 'column',
      marginTop:10,
      marginBottom:10,
      justifyContent:'space-between',
      alignItems:'flex-start'
    },
    button: {
      alignSelf:'auto'
    },
    snapButton: {
      alignSelf:'center'
    },
    text: {
      fontSize: 18,
      color: 'white',
    },
  });