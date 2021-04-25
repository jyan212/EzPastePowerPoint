import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image} from 'react-native';
import { Camera } from 'expo-camera';
import Preview from '../components/Preview';
import * as MediaLibrary from 'expo-media-library';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';

export default function CameraTab({navigation}){
  /* TO DO :
    MOVE THESE SIDE EFFECT AND MODULES TO
    PREVIEW COMPONENTS, FOR EASIER DATA SHARING
  */
  const [hasCaptured, setHasCaptured]  = useState(false);
  const [hasPermission, setHasPermission] = useState(null);
  const [hasMediaLibraryPermission, setHasMediaLibraryPermission] = useState(null);
  const [type, setType] = useState(Camera.Constants.Type.back);
  const [fileName, setFileName] = useState("");
  const [capturedImage, setCapturedImage] = useState(null);
  const [storedImage, setStoredImage] = useState(null);
  const [user,setUser] = useState("");
  const [pairCode,setPairCode] = useState("");
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

  useEffect(() => {
      AsyncStorage.getItem('@imagekey')
        .then( results => {
          setStoredImage(results);
        })
        .catch((e) => {
          // console.log(e)
          console.log(e);
        });
  },[capturedImage])
  
  if (hasPermission === null) {
    return <View />;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  const ALBUM_NAME = 'EZ PRESENTATION';
  
  predictSalObj = (img) => {
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
  const takeImage = async () => {
    console.log("here: "+ user+" "+pairCode);
    if (this.camera) {
        const options = {quality: 1, base64: true};
        const photo  = await this.camera.takePictureAsync(options);
        setHasCaptured(true);
        setCapturedImage(`data:image/png;base64,${photo.base64}`)
        // This data is then send to U-NET API to remove background
        // The processed image is then store to media library
    }
  }

  const changeCode = (user,pairCode) => {
    setPairCode(pairCode);
    setUser(user);
  }

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

  const handleChange = ({target}) => {
      setFileName(target.value);
  }
  
  const rmBack = (photo) => {
    predictSalObj(photo.base64)
  }

  const retakeImage = () => {
      setHasCaptured(false);
      setCapturedImage(null);
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
  const getSize = async () => {
   try{
      const res = await this.camera.getAvailablePictureSizesAsync("1:1");
      console.log(res);
   } catch (err) {
     console.log(err);
   }
  }
  const saveToMediaLibrary = async () => {
    if(hasMediaLibraryPermission && capturedImage !== null){
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
        navigation.navigate('Library');
        retakeImage();
      } catch (err) {
        console.log("err is here :"+err)
      }
    } else {
        alert("Required permission for media library");
    }
  } 
    /*
      FUNCTION MIGHT NEED TO MOVE TO PREVIEWJS FOR CONSISTENCY/DATA TRANSFER
    */
    return  (
    <View style={styles.container}>
      {hasCaptured && capturedImage ? 
      <Preview 
              uri={capturedImage} 
              retakeImage={retakeImage} 
              saveToMediaLibrary={saveToMediaLibrary} 
              fileName={fileName}
              handleChange={handleChange} 
              rmBack={rmBack} 
              photo={capturedImage}
              postImg={postImg}
              changeCode={changeCode}
              prevUser={user}
              prevPairCode={pairCode}
              ></Preview> :
        <Camera style={styles.camera} 
                type={type} 
                ratio="1:1" 
                pictureSize="2448x2448" 
                ref={(ref) => {
                  this.camera=ref
                  }} >
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
            style={styles.button}
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
    },
    camera: {
      flex: 0.9,
      marginTop:50,
    },
    buttonContainer: {
      flex: 1,
      backgroundColor: 'transparent',
      flexDirection: 'row',
      margin: 20,
    },
    button: {
      flex: 0.1,
      alignSelf: 'flex-end',
      alignItems: 'center',
    },
    text: {
      fontSize: 18,
      color: 'white',
    },
  });