import * as React from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { TabView, TabBar } from 'react-native-tab-view';
import { Container, Content, Form, Item, Input, Icon } from 'native-base';
import AwesomeButton from "react-native-really-awesome-button";
import { postRequest, storeData } from './functions';
import LottieView from "lottie-react-native";
import CookieManager from '@react-native-community/cookies';
import AsyncStorage from '@react-native-community/async-storage';

const axios = require('axios');
var data = null;


async function MyAccountButton(
    form, 
    username = null, 
    first_name = null, 
    last_name = null, 
    password = null,
    user_fio = null,
    user_post_index = null,
    user_town = null,
    user_real_address = null,
    user_phone = null,
    force = null,
    reassign = null
    ) {


    var details = {
        context: 'edit'
    };
    username != null ? details.username = username : null;
    first_name != null ? details.first_name = first_name : null;
    last_name != null ? details.last_name = last_name : null;
    password != null ? details.password = password : null;
    user_fio != null ? details.user_fio = user_fio : null;
    user_post_index != null ? details.user_post_index = user_post_index : null;
    user_town != null ? details.user_town = user_town : null;
    user_real_address != null ? details.user_real_address = user_real_address : null;
    user_phone != null ? details.user_phone = user_phone : null;
    force != null ? details.force = force : null;
    reassign != null ? details.reassign = reassign : null;
    var formBody = [];
    for (var property in details) {
      var encodedKey = encodeURIComponent(property);
      var encodedValue = encodeURIComponent(details[property]);
      formBody.push(encodedKey + "=" + encodedValue);
    }
    //test13
    //GjWv00GLtYOInznFAY!Ir&v&
    formBody = formBody.join("&");

    switch(form) {
        case 'info':
            data = await postRequest('/wp/v2/users/'+data['id'], formBody);
            //console.log(data)
            Alert.alert('Изменения сохранены', '')
            break;
        case 'password-check':
            let response = await postRequest('/simple-jwt-authentication/v1/token', formBody)
            if (response.token != undefined) {
                storeData('token', response.token)
                return(true);
            } else {
                return(response.code)
            }
            break;
        case 'password-change':
            responseValidate = await postRequest('/simple-jwt-authentication/v1/token/validate')
            if (responseValidate.data.status == 200) {
                response = await postRequest('/wp/v2/users/'+data['id'], formBody);
                if (response['username'] != undefined) {
                    console.log(response);
                    return(true);
                } else {
                    return(false);
                }
            } else { return(false); }

            break;
        case 'delete-user':
            alert('Функция удаления аккаунта доступна только с оффициального сайта.')
            break
            /*
            response = await fetch('https://www.corcu.ru/wp-json'+'/wp/v2/users/'+data['id'], {
                method: 'DELETE',
                headers: {
                  'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8', 
                  'Authorization': 'Bearer '+ await retrieveData('token'),
                },
                body: data
            });
            console.log(data)
            break;*/
    }
}

class MyAccountInfo extends React.Component {
    state = {
        username: this.props.username,
        first_name: this.props.first_name,
        last_name: this.props.last_name,
        email: this.props.email,
        display_info: false
    }
    render() {
        if (this.state.display_info) {
            var display_info = <Text style={{marginRight: 10}} >Вы не можете изменить</Text>
            setTimeout(() => {
                display_info = null
                this.setState({display_info: false})
            }, 1000);
        }
        return(
            <>
        <Container>
            <Content>
                <Form>
                    <Item>
                        <Input disabled placeholder={this.state.username} />
                        <Icon name='information-circle' onPress={() => this.setState({display_info: true})} />
                        {display_info}
                    </Item>
                    <Item>
                        <Input placeholder="Имя" value={this.state.first_name} onChangeText={(text) => {this.setState({first_name: text})}}/>
                    </Item>
                    <Item>
                        <Input placeholder="Фамилия" value={this.state.last_name} onChangeText={(text) => {this.setState({last_name: text})}}/>
                    </Item>
                    <Item>
                        <Input disabled placeholder="Email" placeholder={this.state.email}/>
                        <Icon name='information-circle' onPress={() => this.setState({display_info: true})} />
                        {display_info}
                    </Item>
                    <AwesomeButton onPress={() => {MyAccountButton('info', null, this.state.first_name, this.state.last_name)}} style={{margin: 15, alignSelf: 'center'}} height={30}  backgroundColor={'#fafafa'} backgroundDarker={'#fff'}>
                <Text style={{alignSelf: 'center', marginHorizontal: 20, fontSize: 14, fontFamily: 'Montserrat-Regular', color: '#fe6c17'}}>Сохранить</Text>
                </AwesomeButton>
                </Form>
            </Content>
        </Container>
        </>
            )
    }
}

class MyAccountChangePassword extends React.Component {
    state = {
        current_password: '',
        new_password: '',
        new_confirmation: ''
    }
    async check_password() {
        if (this.state.new_password == this.state.new_confirmation) {
            let password_check = await MyAccountButton('password-check', data['username'], null, null, this.state.current_password);
            if (password_check == true) {
                if (this.state.new_confirmation.length > 0 && this.state.new_confirmation.length > 0) {
                    if (await MyAccountButton('password-change', data['username'], null, null, this.state.new_password)) {
                        CookieManager.clearAll();
                        AsyncStorage.clear();
                        this.props.nav.navigate('Main');
                        Alert.alert('Пароль изменен', 'Пароль успешно изменен');
                    } else {
                        Alert.alert('Ошибка', 'Возникла ошибка повторите попытку позднее')
                    }
                } else {
                    Alert.alert('Ошибка', 'Вы не ввели новый пароль или подтверждение')
                }
            } else {
                Alert.alert('Ошибка', 'Введенный пароль неверен');
            }
        } else {
            Alert.alert('Ошибка' ,'Новый пароль и подтверждение не совпадают');
        } }

    render() {
        return(
            <Container>
            <Content>
                <Form>
                    <Item>
                        <Input secureTextEntry={true} placeholder="Текущий пароль" value={this.state.current_password} onChangeText={(text) => {this.setState({current_password: text})}} />
                    </Item>
                    <Item>
                        <Input secureTextEntry={true} placeholder="Новый пароль" value={this.state.new_password} onChangeText={(text) => this.setState({new_password: text})} />
                    </Item>
                    <Item>
                        <Input secureTextEntry={true} placeholder="Подтверждение" value={this.state.new_confirmation} onChangeText={(text) => this.setState({new_confirmation: text})} />
                    </Item>
                    <AwesomeButton style={{margin: 10}} height={30} backgroundColor={'#fafafa'} backgroundDarker={'#fff'} style={{margin: 15, alignSelf: 'center'}} onPress={() => this.check_password()}>
                <Text style={{alignSelf: 'center', marginHorizontal: 20, fontSize: 14, fontFamily: 'Montserrat-Regular', color: '#fe6c17'}}>Сменить</Text>
                </AwesomeButton>
                </Form>
            </Content>
        </Container>
        )
    }
}

class MyAccountDelivery extends React.Component {
    state = {
        user_fio: this.props.user_fio,
        user_post_index: this.props.user_post_index,
        user_town: this.props.user_town,
        user_real_address: this.props.user_real_address,
        user_phone: this.props.user_phone
    }
    render() {
        return(
            <Container>
            <Content>
                <Form>
                    <Item>
                        <Input placeholder="Получатель ФИО" value={this.state.user_fio} onChangeText={(text) => {this.setState({user_fio: text})}}/>
                    </Item>
                    <Item>
                        <Input placeholder="Индекс" value={this.state.user_post_index} onChangeText={(text) => {this.setState({user_post_index: text})}}/>
                    </Item>
                    <Item>
                        <Input placeholder="Город" value={this.state.user_town} onChangeText={(text) => {this.setState({user_town: text})}}/>
                    </Item>
                    <Item>
                        <Input placeholder="Адрес" value={this.state.user_real_address} onChangeText={(text) => {this.setState({user_real_address: text})}}/>
                    </Item>
                    <Item>
                        <Input placeholder="Телефон" value={this.state.user_phone} onChangeText={(text) => {this.setState({user_phone: text})}}/>
                    </Item>
                    <AwesomeButton onPress={() => 
                        MyAccountButton(
                            'info', 
                            null, 
                            null, 
                            null, 
                            null, 
                            this.state.user_fio, 
                            this.state.user_post_index, 
                            this.state.user_town, 
                            this.state.user_real_address, 
                            this.state.user_phone
                            )} 
                            style={{margin: 15, alignSelf: 'center'}} height={30} backgroundColor={'#fafafa'} backgroundDarker={'#fff'} >
                <Text style={{alignSelf: 'center', marginHorizontal: 20, fontSize: 14, fontFamily: 'Montserrat-Regular', color: '#fe6c17'}}>Сохранить</Text>
                </AwesomeButton>
                </Form>
            </Content>
        </Container>
        )
    }
}

class MyAccountDelete extends React.Component {
    state = {
        password: ''
    }
    render() {
        return(
        <Container>
            <Content>
                <Form>
                    <Text style={{fontFamily: 'Montserrat-Regular', margin: 15}}>Вы уверены в том, что хотите удалить свой аккаунт? 
                        Это действие удалит все данные аккаунта с сайта. 
                        Для удаления аккаунта, введите Ваш пароль ниже</Text>
                    <Item>
                        <Input placeholder="Пароль" value={this.state.password}/>
                    </Item>
                    <AwesomeButton onPress={() => MyAccountButton(
                                            'delete-user', 
                                            null, 
                                            null, 
                                            null, 
                                            null, 
                                            null, 
                                            null, 
                                            null, 
                                            null, 
                                            null,
                                            true,
                                            0
                    )} style={{margin: 15, alignSelf: 'center'}} height={30} backgroundColor={'#fafafa'} backgroundDarker={'#fff'}>
                <Text style={{alignSelf: 'center', marginHorizontal: 20, fontSize: 14, fontFamily: 'Montserrat-Regular', color: '#fe6c17'}}>Удалить</Text>
                </AwesomeButton>
                </Form>
            </Content>
        </Container>
        )
    }
}

class MyAccount extends React.Component {
    data = null;
    state = {
        loading: true,
        nav_state: {
            index: 0,
            routes: [
                { key: '0', title: 'Главное' },
                { key: '1', title: 'Пароль' },
                { key: '2', title: 'Доставка'},
                { key: '3', title: 'Удалить аккаунт'}
              ],
        }
    }

    async componentDidMount() {
        data = await postRequest('/wp/v2/users/me');
        this.setState({ loading: false })
    }

    _renderTabBar = (props) => {
        return(
            <TabBar
            {...props}
            renderLabel={({ route, focused, color }) => (
                <Text style={{ color, fontSize: 14, fontFamily: 'Montserrat-Bold' }}>
                  {route.title}
                </Text>
            )}
            indicatorStyle={{ backgroundColor: '#fe9558' }}
            style={{ backgroundColor: 'rgb(193, 166, 127)' }}
          />
        )
    }

    _renderScene = ({ route }) => {
        switch (route.key) {
        case '0':
          return <MyAccountInfo 
          username={data['username']} 
          first_name={data['first_name']} 
          last_name={data['last_name']} 
          email={data['email']} />;
          break;
        case '1':
          return <MyAccountChangePassword
          nav={this.props.navigation}
          />;
          break;
        case '2':
            return <MyAccountDelivery
            user_fio={data['user_fio'][0]}
            user_post_index={data['user_post_index'][0]}
            user_town={data['user_town'][0]}
            user_real_address={data['user_real_address'][0]}
            user_phone={data['user_phone'][0]}
            />;
            break;
        case '3':
            return <MyAccountDelete
            
            />;
            break;
        default:
          return null;
          break;
        }
      };
    _indexChange = (ind) => { 
        this.setState({
            nav_state: {index: ind, routes: this.state.nav_state.routes}
        })
    }
    render() {
        if (!this.state.loading) {
            return(
                <TabView
                navigationState={this.state.nav_state}
                renderScene={this._renderScene}
                onIndexChange={this._indexChange}
                renderTabBar={this._renderTabBar}
                />
                )
        } else {
            return(
                <View style={[styles.container, styles.horizontal]}>
                <LottieView 
                  source={require('./assets/animations/corcu_loading.json')}
                  loop
                  autoPlay
                />
                </View>
            )
        }
    }
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center'
      },
      horizontal: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        padding: 10,
        position: 'relative',
        top: '-15%'
      }
})
export default MyAccount;