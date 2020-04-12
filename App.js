import React from 'react';
import { StyleSheet, Dimensions, StatusBar, View, Text, Image, Platform } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import GetData from './Main_auc';
import LoginScreen from './LoginScreen';
import Auction from './AuctionScreen';
import BuyScreen from './BuyScreen';
import MyAccount from './MyAccountScreen'
import AucsWon from './AuctionWonScreen';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaView } from 'react-navigation';
import { Header, Button, Icon } from 'native-base';
const Stack = createStackNavigator();
class App extends React.Component {
  constructor(props) {
    super(props);
    this.timer = null;
    this.state = {
      fontLoaded: false,
      data: null,
      loading_data: true,
      DEV: false
    }
    global.headerHeight = 50;
  }
  async componentDidMount() {
    /*if (process.env.NODE_ENV === 'development') {
      const whyDidYouRender = require('@welldone-software/why-did-you-render');
      whyDidYouRender(React, {
        trackAllPureComponents: true,
      });
    }*/
    this.token = null;
    this.timer = setInterval(() => this.getUserData(), 1000);
    this.setState({fontLoaded: true})
  }
  componentWillUnmount() {
    clearInterval(this.timer);
  }
  async getUserData() {
    if (this.token == null) {
      this.token = await AsyncStorage.getItem('token');
    }
    fetch('https://corcu.ru/wp-json/wp/v2/users/me', {
            method: 'POST',
            headers: {
              'Authorization': 'Bearer '+ this.token,
            }}
            )
    .then((response) => response.json())
    .then((responseJson) => {
      this.setState({data: responseJson})
      if (this.state.loading_data) {
        this.setState({loading_data: false})
      }
    })
    .catch((error) => {
      console.error(error);
    });
  }
  render() {
    var dev_modules = [];
    if (this.state.DEV) {
    dev_modules = [<Button onPress={() => AsyncStorage.removeItem('token')}></Button>];
    }
    if (this.state.fontLoaded && !this.state.loading_data) {
      if (this.token !== null) {
        coins = 
        <View style={{position: 'absolute', margin: 5, right: 5, top: 5, flexDirection: 'row'}}>
        <Icon name='coins' type='FontAwesome5' style={{paddingRight: 5}}></Icon>
        <Text style={{fontFamily: 'Montserrat-Bold', fontSize: 20}}>
        {this.state.data['user_credits']}
        </Text>
      </View>
      } else {
        coins = null;
      }
      return (
        <View style={{flex: 1}} >
          <SafeAreaView style={{flex: 1, paddingTop: 0}}>
          <Header style={{height: global.headerHeight, paddingTop: 0, backgroundColor: 'white', paddingRight: 50}}>
            {dev_modules}
            <Image source={require('./assets/icons/small_logo.png')} style={{height: 50, width: 50, resizeMode: 'contain'}} />
            <Text 
            style={
              {
                textAlignVertical: 'center', 
                paddingTop: Platform.OS === 'ios' ? 8 : 0, 
                fontFamily: 'Montserrat-Bold', 
                fontSize: 25
                }
              }>
                Corcu
              </Text>
              {coins}
          </Header>
          <NavigationContainer>
        <Stack.Navigator initialRouteName="Main" screenOptions={{headerShown: false}}>
        <Stack.Screen name="Main" component={GetData}></Stack.Screen>
        <Stack.Screen name="Login" component={LoginScreen}></Stack.Screen>
        <Stack.Screen name="Auction" component={Auction}></Stack.Screen>
        <Stack.Screen name="My Account" component={MyAccount}></Stack.Screen>
        <Stack.Screen name="Aucs Won" component={AucsWon}></Stack.Screen>
        <Stack.Screen name="Shop" component={BuyScreen}></Stack.Screen>
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
