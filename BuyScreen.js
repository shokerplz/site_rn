import React from 'react';
import { View, Text, Image, FlatList, StyleSheet, Dimensions, Animated, Alert, Keyboard } from 'react-native';
import { Icon, Card } from 'native-base';
import { retrieveData } from './functions';
import AwesomeButton from "react-native-really-awesome-button";
import LottieView from "lottie-react-native";
import { CreditCardInput } from 'react-native-credit-card-input';

const STRIPE_ERROR = 'Произошла ошибка платежной системы. Повторите попытку позднее или обратитесь за поддержкой corcu.ru/tech-support';
const SERVER_ERROR = 'Внутренняя ошибка. Повторите попытку позднее или обратитесь за поддержкой corcu.ru/tech-support';
const STRIPE_PUBLISHABLE_KEY = 'pk_test_WKDUre36TqB4jLeECvJr1yRs00bemQgHqw';


const getCreditCardToken = (creditCardData) => {
    const card = {
      'card[number]': creditCardData.values.number.replace(/ /g, ''),
      'card[exp_month]': creditCardData.values.expiry.split('/')[0],
      'card[exp_year]': creditCardData.values.expiry.split('/')[1],
      'card[cvc]': creditCardData.values.cvc
    };
    return fetch('https://api.stripe.com/v1/tokens', {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Bearer ${STRIPE_PUBLISHABLE_KEY}`
      },
      method: 'post',
      body: Object.keys(card)
        .map(key => key + '=' + card[key])
        .join('&')
    }).then(response => response.json());
  };

class BuyScreen extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            data: null,
            loading: true,
            creditCardVisible: true,
            visible: false,
            creditCardAnimation: new Animated.Value(0),
            otherAnimation: new Animated.Value(1),
            moveAnimation: new Animated.Value(0),
            nowBuying: null,
            valid: true, 
            form: null,
        }
    }

    startAnimation = async (anim, animTo) => {
      Animated.timing(anim, {
        toValue: animTo,
        duration: 100,
        useNativeDriver: true
      }).start();
    }

    getItems() {
        fetch('https://www.corcu.ru/wp-json/corcu/buy/0', 
        {
          method: 'GET',
          headers: {
            'Authorization': 'Bearer '+ this.token,
          }})
        .then((response) => response.json())
        .then((responseJson) => {
          this.setState({data: responseJson})
          this.setState({loading: false})
        })
        .catch((error) => {
          console.error(error);
        });
    }
            //270 PIXELS HEIGHT CREDIT CARD BLOCK!!! NB
    async componentDidMount() {
        this.token = await retrieveData('token');
        this.getItems();
    }

    closeCard() {
      this.startAnimation(this.state.creditCardAnimation, 0);
      this.startAnimation(this.state.otherAnimation, 1);  
      this.startAnimation(this.state.moveAnimation, 0);
      this.setState({ visible: false, nowBuying: null, valid: !this.state.valid });
      Keyboard.dismiss();
    }

    async buyItem() {
      if (!this.state.valid) {
        let creditCardToken;
        try {
          this.setState({valid: true});
          creditCardToken = await getCreditCardToken(this.state.form);
          if (creditCardToken.error) {
            alert(creditCardToken.error);
            return;
          }
        } catch(e) {
          alert(e);
        }
        const request_body = {
          'card_num': this.state.form.values.number.replace(/ /g, ''),
          'card_exp_month': this.state.form.values.expiry.split('/')[0],
          'card_exp_year': this.state.form.values.expiry.split('/')[1],
          'card_cvc': this.state.form.values.cvc,
          'stripeToken': creditCardToken['id']
        };
        Alert.alert(
          "Оплата",
          "Вы подтверждаете покупку пакета ставок "+this.state.nowBuying['item_title'].split(" ").slice(-1)[0]+", стоимостью "+this.state.nowBuying['item_price']+'₽?',
          [
            {
              text: 'Отмена',
              onPress: () => {this.closeCard(); return null;},
              style: 'cancel'
            },
            {
              text: 'Да',
              onPress: () => {
                fetch('https://corcu.ru/wp-json/corcu/buy/'+this.state.nowBuying['id'], {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': 'Bearer '+ this.token,
                  },
                  body: Object.keys(request_body)
                  .map(key => key + '=' + request_body[key])
                  .join('&')
                }).then(response => response.json().then((responseJson) => {
                  switch(responseJson) {
                    case '80000':
                      Alert.alert('Оплата произведена успешно','Оплата произведена успешно. Выбранное количество ставок зачислено на ваш счет');
                      this.props.navigation.navigate('Main');
                      break;
                    case '80001':
                      Alert.alert('Ошибка оплаты' ,STRIPE_ERROR); this.closeCard(); break;
                    case '80002':
                      Alert.alert('Ошибка оплаты','Некоторые введенные данные не верны. Повторите попытку позднее'); this.closeCard();
                      break;
                    case '80003':
                      Alert.alert('Ошибка оплаты', STRIPE_ERROR); this.closeCard();
                      break;
                    case '80005':
                      Alert.alert('Ошибка' ,'Выбранный пакет ставок на текущий момент отсутствует'); this.closeCard();
                      break;
                  }
                }
                )
                )
              }
            }
          ]
        )
      }
    }

    _onChange = (form) => {
      if (form['valid']) {
        this.setState({valid: false, form: form});
      } else {
        this.setState({valid: true, form: null});
      }
      console.log(form);
    }

    render() {
        if (this.state.loading) {
            return(
              <View style={[styles.container, styles.horizontal]}>
              <LottieView 
                source={require('./assets/animations/corcu_loading.json')}
                loop
                autoPlay
              />
              </View>
            )
        } else {
            return(
                <View style={{width: Dimensions.get('window').width}}>
                    <Animated.View style={{opacity: this.state.creditCardAnimation, position: this.state.visible == false ? 'absolute' : 'relative'}}>
                    <CreditCardInput onChange={this._onChange}/>
                    <AwesomeButton onPress={() => this.buyItem()} disabled={this.state.valid} style={{margin: 15, alignSelf: 'center'}} width={140} height={45}  backgroundColor={'#fafafa'} backgroundDarker={'#fff'}>
                        <Text style={{alignSelf: 'center', marginHorizontal: 20, fontSize: 16, fontFamily: 'Montserrat-Bold', color: '#fe6c17'}}>Купить</Text>
                      </AwesomeButton>
                      <Icon name='cross' type='Entypo' style={{fontSize: 45 ,position: 'absolute', bottom: 10, right: 20, color: '#fe6c17'}} onPress={() => {
                        this.closeCard();
                      }}></Icon>
                    </Animated.View>
                    <Animated.View style={{transform: [{ translateY: this.state.moveAnimation }], opacity: this.state.otherAnimation, position: this.state.visible == true ? 'absolute' : 'relative'}}>
                    <FlatList
                    data={this.state.data}
                    numColumns={2}
                    keyExtractor={item => item['id']}
                    renderItem={({item}) => 
                    <View style={{}}>
                      <Card style={{width: Dimensions.get('window').width/2 - 14, marginLeft: 8.5, marginTop: 10, alignItems: 'center'}}>
                      <Text style={{fontFamily: 'Montserrat-Regular', fontSize: 16, margin: 10}}>{item['item_title']}</Text>
                      <Icon style={{fontSize: 90, color: '#808080'}} name='shopping-bag' type='Feather'></Icon>
                      <Text style={{fontFamily: 'Montserrat-Bold', fontSize: 17, marginTop: 10}}>{item['item_price']}₽</Text>
                      <AwesomeButton disabled={this.state.visible} onPress={() => {
                          this.startAnimation(this.state.creditCardAnimation, 1); 
                          this.startAnimation(this.state.otherAnimation, 0.15); 
                          this.startAnimation(this.state.moveAnimation, 370);
                          this.setState({ visible: true, nowBuying: item });
                        }} style={{margin: 15, alignSelf: 'center'}} width={140} height={30}  backgroundColor={'#fafafa'} backgroundDarker={'#fff'}>
                        <Text style={{alignSelf: 'center', marginHorizontal: 20, fontSize: 14, fontFamily: 'Montserrat-Bold', color: '#fe6c17'}}>Купить</Text>
                      </AwesomeButton>
                      </Card>
                    </View>
                    }
                    ></FlatList>
                    </Animated.View>
                </View>
            )
        }
    }
}
export default BuyScreen;
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
});