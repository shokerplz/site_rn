import React from 'react';
import { StyleSheet, Dimensions, StatusBar, View, Text, AsyncStorage, Image, Platform } from 'react-native';
import GetData from './Main_auc';
import LoginScreen from './LoginScreen';
import Auction from './AuctionScreen';
import MyAccount from './MyAccountScreen'
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaView } from 'react-navigation';
import { Header, Button } from 'native-base';
const Stack = createStackNavigator();
class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      fontLoaded: false,
      DEV: false
    }
  }
  async componentDidMount() {
    /*if (process.env.NODE_ENV === 'development') {
      const whyDidYouRender = require('@welldone-software/why-did-you-render');
      whyDidYouRender(React, {
        trackAllPureComponents: true,
      });
    }*/
    this.setState({fontLoaded: true})

  }
  render() {
    var dev_modules = [];
    if (this.state.DEV) {
    dev_modules = [<Button onPress={() => AsyncStorage.removeItem('token')}></Button>];
    }
    if (this.state.fontLoaded) {
      return (
        <View style={{flex: 1}} >
          <SafeAreaView style={{flex: 1, paddingTop: 0}}>
          <Header style={{height: 50, paddingTop: 0, backgroundColor: 'white', paddingRight: 50}}>
            {dev_modules}
            <Image source={require('./assets/icons/small_logo.png')} style={{height: 50, width: 50, resizeMode: 'contain'}} />
            <Text 
            style={
              {
                textAlignVertical: 'center', 
                paddingTop: 12, 
                fontFamily: 'Montserrat-Bold', 
                fontSize: 25
                }
              }>
                Corcu
              </Text>
          </Header>
          <NavigationContainer>
        <Stack.Navigator initialRouteName="Main" screenOptions={{headerShown: false}}>
        <Stack.Screen name="Main" component={GetData}></Stack.Screen>
        <Stack.Screen name="Login" component={LoginScreen}></Stack.Screen>
        <Stack.Screen name="Auction" component={Auction}></Stack.Screen>
        <Stack.Screen name="My Account" component={MyAccount}></Stack.Screen>
          </Stack.Navigator>
        </NavigationContainer>
          </SafeAreaView>
        </View>
      );
    } else {
      return null;
    }
  }
}
export default App;


const styles = StyleSheet.create({
  main: {
    height: Dimensions.get('window').height - 100
  },
  header: {
    backgroundColor: '#c1a67f',
    height: 60,
    textAlign: "center",
    alignItems: "center",
    justifyContent: "center",
  },
});
