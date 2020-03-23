import React from 'react';
import { Alert, AsyncStorage, Dimensions, View } from 'react-native';
import { Icon } from 'native-base';
import AwesomeButton from "react-native-really-awesome-button";


class FooterButtons extends React.Component {
  constructor(props) {
    super(props)
    this.goToLogin = () => this.props.navigate.navigate('Login')
    this.goToAccount = () => this.props.navigate.navigate('My Account')
    this.goToAucsWon = () => this.props.navigate.navigate('Aucs Won');
    this.state = {
      token: '',
    }
  }

  async shouldComponentUpdate() {
    if (this.state.token != await retrieveData('token')) {
      this.setState({token: await retrieveData('token')})
      return(true);
    }
  }

  render() {
    if (typeof(this.state.token) == 'undefined') {
      return(
        <View style={{ flexDirection: 'row',  justifyContent: 'center', backgroundColor: 'transparent', position: 'relative', top: -45}}>
        <AwesomeButton borderWidth={2} borderColor={'#fe9558'} onPress={this.goToLogin} height={50} width={Dimensions.get('window').width/5} backgroundColor={'#fafafa'}>
        <Icon name='user-o' type='FontAwesome' />
      </AwesomeButton>
        </View>
      )
    } else {
      return(
        <View style={{ flexDirection: 'row',  justifyContent: 'center', backgroundColor: 'transparent', position: 'relative', top: -45}}>
        <AwesomeButton borderWidth={2} borderColor={'#fff'} onPress={this.goToLogin} height={50} width={Dimensions.get('window').width/5} backgroundColor={'#fafafa'}>
        <Icon name='trophy' type='SimpleLineIcons' />
      </AwesomeButton>
      <AwesomeButton borderWidth={2} borderColor={'#fff'} onPress={this.goToAccount} height={50} width={Dimensions.get('window').width/5} backgroundColor={'#fafafa'}>
        <Icon name='user-o' type='FontAwesome' />
      </AwesomeButton>
      <AwesomeButton borderWidth={2} borderColor={'#fff'} onPress={this.goToAucsWon} height={50} width={Dimensions.get('window').width/5} backgroundColor={'#fafafa'}>
        <Icon name='shoppingcart' type='AntDesign' />
      </AwesomeButton>
        </View>
      )
    }
  }
}
export { FooterButtons } 

// FUNCTION TO RETRIEVE DATA LIKE LOGIN TOKEN

export async function retrieveData(key) {
    try {
        const value = await AsyncStorage.getItem(key);
        if (value !== null) {
        return(value);
        }
    } catch (error) {
        console.log(error)
    }
  };

 export async function storeData(key, item) {
    try {
    await AsyncStorage.setItem(key, item);
    } catch (error) {
    // Error saving data
    }
};

export async function postRequest(route, data = null) {
  response = await fetch('https://www.corcu.ru/wp-json'+route, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8', 
      'Authorization': 'Bearer '+ await retrieveData('token'),
    },
    body: data
});
  return(JSON.parse(await response.text()));
}

export async function getRequest(route, data = null) {
  response = await fetch('https://www.corcu.ru/wp-json'+route, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8', 
      'Authorization': 'Bearer '+ await retrieveData('token'),
    },
    body: data
});
  return(JSON.parse(await response.text()));
}

// BID BUTTON CALLS THIS FUNCTION
export async function btnClick(pid, auction_time) {
    let token = await retrieveData('token')
    let response = await fetch('https://www.corcu.ru/wp-json/corcu/bet/'+pid, {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer '+ token,
      }
    });
    response.text().then((betStatus) => {
      if (betStatus == 'NO_USER_CREDITS') {
        Alert.alert(
          'Неудачная ставка',
          'Ставка не была получена',
          [
            {text: 'Пополнить счет', onPress: () => console.log('Refill')},
            {text: 'Ок'},
          ]
        )
      } else if (betStatus == "SUCCESSFUL BET") {
        retrieveData('acc_details').then((response) => {this.highest_bidder = (JSON.parse(response)['username'])})
        this.setState({timer: auction_time})
        clearInterval(this.clockCall);
        setTimeout(() => this.newTime(), 1000);
      } else if (response.status == 403) {
        Alert.alert(
          'Вы не вошли в систему',
          '',
          [
            {text: 'Войти', onPress: this.goToLogin},
            {text: 'Ок'},
          ]
        )
      }
    })
  }