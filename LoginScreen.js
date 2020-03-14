import React from 'react';
import { Text, Linking } from 'react-native';
import { Container, Content, Form, Item, Input, Icon, View } from 'native-base';
import AwesomeButton from "react-native-really-awesome-button";
import { AsyncStorage } from 'react-native';
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

    async storeData(key, item) {
            try {
            await AsyncStorage.setItem(key, item);
            } catch (error) {
            // Error saving data
            }
        };

    async retrieveData(key) {
            try {
                let value = await AsyncStorage.getItem(key);
                if (value !== null) {
                return(value);
                // We have data!!
                }
            } catch (error) {
                // Error retrieving data
            }
        };

    

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
            alert(responseJson['code']);
        }
        return 0;
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
                <AwesomeButton style={{alignSelf: 'center'}} borderWidth={2} borderColor={'#f0f0f0'} onPress={() => {Linking.openURL("https://corcu.ru/register")}} raiseLevel={2} height={50} width={190} backgroundColor={'#fafafa'}>
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