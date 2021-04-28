import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Button, FlatList, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SavedImage from '../components/SavedImage';
import { useIsFocused } from '@react-navigation/native';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';
import Preview from '../components/Preview';

const { WIDTH , HEIGHT } = Dimensions.get('window')
const convertStringToJsonArray = (imgs) => {
  let data = imgs.split('');
  let arr = [];
  let jsonString = "";
  for ( let i = 0 ; i < data.length; i++) {
   if ( data[i] == '}' ) {
      jsonString += data[i];
      let obj = JSON.parse(jsonString)
      arr.push(obj);
      // next json ...
      jsonString = "";
    } else if ( data[i] == ',' && data[i-1] == '}' ) {
      jsonString = jsonString; // nothing change
    } else {
      jsonString += data[i];
    }
  }
  return arr;
}
export default function Library(){
    const [isPreview, togglePreview] = useState(false);
    const [previewImg, setPreviewImg] = useState(null);
    const [storedImagesUri, setStoredImagesUri] = useState([])
    const focused = useIsFocused();
    useEffect(() => {
        console.log("I AM RENDERING AGAINNNN")
        AsyncStorage.getItem('@imagekey')
        .then((data) => {
          if (data != null) {
            let storedData = convertStringToJsonArray(data);
            setStoredImagesUri(storedData);
          } else {
            setStoredImagesUri([]);
          }
        })
        .catch((e) => {
          console.log(e);
        })
    },[focused]);

    const renderItem = ({ item }) => ((
      <SavedImage storedImgUri={item.uri} date={item.modificationTime} showPreview={() => { showPreview(item.id) }} keys={item.id} size={item.width+"*"+item.height} deleteItem={deleteItem}></SavedImage>
   ))

    const deleteItem = (id) => {
      setStoredImagesUri((prev) => prev.filter((item) => item.id !== id));
      storeData(storedImagesUri.filter( item => item.id !== id ));
      MediaLibrary.deleteAssetsAsync(id)
      .then( results => console.log(results))
      .catch( err => console.log(err));
    }

    const storeData = async (jsonArr) => {
      jsonArr = jsonArr.map((json) => JSON.stringify(json));
      const jsonValue = jsonArr.toString();
      try {
        await AsyncStorage.setItem('@imagekey', jsonValue);
      } catch (err) {
        console.log(err);
      }
    }
    
    const showPreview = (id) => {
      storedImagesUri.forEach( async (item) => {
        try {
          if ( item.id === id ) {
            const img = await FileSystem.readAsStringAsync(item.uri,{ encoding: FileSystem.EncodingType.Base64 });
            setPreviewImg(`data:image/png;base64,${img}`);
          }
        } catch (err) {
            console.log(err);
        }
      })
      togglePreview(!isPreview);
    }

    const switchView = () => {
      togglePreview(!isPreview);
    }
    const test = async () => {
        try {
          AsyncStorage.clear();
        } catch(e) {
          // clear error
        }
      }

    return (
      /*
        UPDATE THIS PART, SO IT CAN PASS ONLY PREVIEW ITEM ID, WITHOUT NEEDING TO PASSS ALL VARIABLE
        HENCE, U NEED TO CHG PREVIEW JS FOR EASIER DATA TRANSFER.
      */ 
            storedImagesUri.length <= 0 ?  
              <View style={styles.wrapper}>
                <Text>There are no saved images in this directory</Text>
              </View> :
            isPreview && previewImg != null ? 
            <Preview 
              photo={previewImg} 
              retakeImage={()=>{ 
                setPreviewImg(null);
                togglePreview(false);
              }}
              switchView={switchView}
              changeCode={()=>{console.log("test")}}
              navigation={null}
              hasMediaLibraryPermission={true}
              prevUser="TEST"
              prevPairCode="TEST"
              ></Preview>:
            (
              <FlatList
                data={storedImagesUri}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.wrapper}
              />
            ))
}

const styles = StyleSheet.create({
  wrapper: {
    width:"100%",
    justifyContent:'center',
    alignItems:'center',
  }
})