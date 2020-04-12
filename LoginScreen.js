import React from 'react';
import { Text, Linking, Alert } from 'react-native';
import { Container, Content, Form, Item, Input, Icon, View } from 'native-base';
import AwesomeButton from "react-native-really-awesome-button";
import AsyncStorage from '@react-native-community/async-storage';
import InAppBrowser from 'react-native-inappbrowser-reborn'

class LoginScreen extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            username: '',
            password: '',
        }
        this.login_acc = this.login_acc.bind(this);
    }
    componentDidMount() {
            
    }

    

    async login_acc() {
        var details = {
            'username': this.state.username,
            'password': this.state.password
        };
        
        var formBody = [];
        for (var property in details) {
          var encodedKey = encodeURIComponent(property);
          var encodedValue = encodeURIComponent(details[property]);
          formBody.push(encodedKey + "=" + encodedValue);
        }
        formBody = formBody.join("&");
        let response = await fetch('https://corcu.ru/wp-json/simple-jwt-authentication/v1/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: formBody
        })

        let responseJson = await response.json();
        if(typeof(responseJson['token']) != 'undefined') {
            //this.storeData('token', responseJson['token']);
            AsyncStorage.setItem('token', responseJson['token']);
            let details_response = await fetch('https://corcu.ru/wp-json/wp/v2/users/me', {
                method: 'POST',
                headers: {
                  'Authorization': 'Bearer '+ responseJson['token'],
                }}
                ).then((response) => (response.json().then((responseJson) => {AsyncStorage.setItem('acc_details', JSON.stringify(responseJson))})))
            
            this.props.navigation.navigate('Main');
        } else {
            if (responseJson['code'].includes('incorrect')) {
              Alert.alert('Ошибка', 'Введенный пароль неверен');
            } else if (responseJson['code'].includes('username') && responseJson['code'].includes('invalid')) {
              Alert.alert('Ошибка', 'Такого пользователя не существует');
            } else if(responseJson['code'].includes('empty') && responseJson['code'].includes('password')) {
              Alert.alert('Ошибка', 'Вы не ввели пароль');
            } else if (responseJson['code'].includes('empty') && responseJson['code'].includes('username')) {
              Alert.alert('Ошибка', 'Вы не ввели имя пользователя');
            }
            else {
              Alert.alert(responseJson['code']);
            }
        }
        return 0;
    }
    async registerAccount() {
      try {
        const url = 'https://corcu.ru/register';
        if (await InAppBrowser.isAvailable()) {
          const result = await InAppBrowser.open(url, {
            // iOS Properties
            dismissButtonStyle: 'done',
            preferredBarTintColor: '#c1a67f',
            preferredControlTintColor: 'white',
            readerMode: false,
            animated: true,
            modalPresentationStyle: 'overFullScreen',
            modalTransitionStyle: 'partialCurl',
            modalEnabled: true,
            enableBarCollapsing: false,
            // Android Properties
            showTitle: true,
            toolbarColor: '#c1a67f',
            secondaryToolbarColor: 'black',
            enableUrlBarHiding: true,
            enableDefaultShare: false,
            forceCloseOnRedirection: false,
          })
          //console.log(JSON.stringify(result));
        }
      } catch(error) {
        //console.log(error);
      }
    }
    render() {
        return(
            <Container>
            <Content>
              <Form>
                <Item>
                  <Input placeholder="Имя пользователя" value={this.state.username} onChangeText={(text) => {this.setState({username: text})}}/>
                </Item>
                <Item last>
                  <Input placeholder="Пароль" value={this.state.password} onChangeText={(text) => {this.setState({password: text})}} secureTextEntry={true}/>
                </Item>
                <View style={{flexDirection: 'row', paddingLeft: 10, paddingTop: 10}}>
                <AwesomeButton style={{alignSelf: 'center', marginRight: 10}} borderWidth={2} borderColor={'#f0f0f0'} onPress={this.login_acc} raiseLevel={2} height={50} width={90} backgroundColor={'#fafafa'}>
                    <Icon name='user-o' type='FontAwesome' />
                    <Text>Войти</Text>
                </AwesomeButton>
                <AwesomeButton style={{alignSelf: 'center'}} borderWidth={2} borderColor={'#f0f0f0'} onPress={() => {this.registerAccount();}} raiseLevel={2} height={50} width={190} backgroundColor={'#fafafa'}>
                    <Icon name='user-o' type='FontAwesome' />
                    <Text>Зарегистрироваться</Text>
                </AwesomeButton>
                </View>
              </Form>
            </Content>
          </Container>
        )
    }
}
export default LoginScreen;