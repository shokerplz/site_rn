import * as React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TabView, TabBar } from 'react-native-tab-view';
import { Container, Content, Form, Item, Input, Label, Icon } from 'native-base';
import AwesomeButton from "react-native-really-awesome-button";
import { retrieveData, postRequest } from './functions';
import LottieView from "lottie-react-native";
import { ThemeColors } from 'react-navigation';

var data = null;

async function MyAccountButton(form, username = null, first_name = null, last_name = null, password =null) {


    var details = {
        context: 'edit'
    };
    username != null ? details.username = username : null;
    first_name != null ? details.first_name = first_name : null;
    last_name != null ? details.last_name = last_name : null;
    password != null ? details.password = password : null;
    var formBody = [];
    for (var property in details) {
      var encodedKey = encodeURIComponent(property);
      var encodedValue = encodeURIComponent(details[property]);
      formBody.push(encodedKey + "=" + encodedValue);
    }
    formBody = formBody.join("&");

    switch(form) {
        case 'info':
            data = await postRequest('/wp/v2/users/'+data['id'], formBody);
        case 'password-change':
            postRequest('/simple-jwt-authentication/v1/token/validate').then(
                (response) => {
                    if (response.data.status == 200) {
                        postRequest('/wp/v2/users'+data['id'], formBody).then(console.log)
                    }
                }
            )
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
                    <AwesomeButton onPress={() => MyAccountButton('info', null, this.state.first_name, this.state.last_name)} style={{margin: 15, alignSelf: 'center'}} height={30}  backgroundColor={'#fafafa'} backgroundDarker={'#fff'}>
                <Text style={{alignSelf: 'center', marginHorizontal: 20, fontSize: 14, fontFamily: 'Montserrat-Regular', color: '#fe6c17'}}>Сохранить</Text>
                </AwesomeButton>
                </Form>
            </Content>
        </Container>
            )
    }
}

class MyAccountChangePassword extends React.Component {
    state = {
        current_password: '',
        new_password: '',
        new_confirmation: ''
    }
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
                    <AwesomeButton style={{margin: 10}} height={30} backgroundColor={'#fafafa'} backgroundDarker={'#fff'} onPress={() => {
                        if (this.state.new_password == this.state.new_confirmation) { 
                            MyAccountButton('password-change', null, null, null, password = this.state.new_password)
                        } else {
                            alert('Новый пароль и подтверждение не совпадают')
                        }
                    }} >
                <Text style={{alignSelf: 'center', marginHorizontal: 20, fontSize: 14, fontFamily: 'Montserrat-Regular', color: '#fe6c17'}}>__FILL_THIS__</Text>
                </AwesomeButton>
                </Form>
            </Content>
        </Container>
        )
    }
}

class MyAccountDelivery extends React.Component {
    state = {
        fio: '',
        post_index: '',
        town: '',
        adress: '',
        phone: ''
    }
    render() {
        return(
            <Container>
            <Content>
                <Form>
                    <Item>
                        <Input placeholder="Получатель ФИО" value={this.state.fio}/>
                    </Item>
                    <Item>
                        <Input placeholder="Индекс" value={this.state.post_index}/>
                    </Item>
                    <Item>
                        <Input placeholder="Город" value={this.state.town}/>
                    </Item>
                    <Item>
                        <Input placeholder="Адрес" value={this.state.adress}/>
                    </Item>
                    <Item>
                        <Input placeholder="Телефон" value={this.state.phone}/>
                    </Item>
                    <AwesomeButton style={{margin: 10}} height={30} backgroundColor={'#fafafa'} backgroundDarker={'#fff'}>
                <Text style={{alignSelf: 'center', marginHorizontal: 20, fontSize: 14, fontFamily: 'Montserrat-Regular', color: '#fe6c17'}}>__FILL_THIS__</Text>
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
                    <Text>Вы уверены в том, что хотите удалить свой аккаунт? 
                        Это действие удалит все данные аккаунта с сайта. 
                        Для удаления аккаунта, введите Ваш пароль ниже</Text>
                    <Item>
                        <Input placeholder="Пароль" value={this.state.password}/>
                    </Item>
                    <AwesomeButton style={{margin: 10}} height={30} backgroundColor={'#fafafa'} backgroundDarker={'#fff'}>
                <Text style={{alignSelf: 'center', marginHorizontal: 20, fontSize: 14, fontFamily: 'Montserrat-Regular', color: '#fe6c17'}}>__FILL_THIS__</Text>
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
                { key: '0', title: 'Информация' },
                { key: '1', title: 'Сменить пароль' },
                { key: '2', title: 'Адрес доставки'},
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
                <Text style={{ color, fontSize: 11 }}>
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
        case '1':
          return <MyAccountChangePassword/>;
        case '2':
        return <MyAccountDelivery/>;
        case '3':
            return <MyAccountDelete/>;
        default:
          return null;
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