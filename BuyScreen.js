import React from 'react';
import { View, Text, Image, FlatList, StyleSheet, Dimensions } from 'react-native';
import { Icon, Card } from 'native-base';
import { retrieveData } from './functions';
import AwesomeButton from "react-native-really-awesome-button";
import LottieView from "lottie-react-native";

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

class BuyScreen extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            data: null,
            loading: true
        }
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

    async componentDidMount() {
        this.token = await retrieveData('token');
        this.getItems();
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
                    <FlatList
                    data={this.state.data}
                    numColumns={2}
                    keyExtractor={item => item['id']}
                    renderItem={({item}) => 
                    <View style={{}}>
                      <Card style={{width: Dimensions.get('window').width/2 - 14, marginLeft: 8.5, marginTop: 10, alignItems: 'center'}}>
                      <Text style={{fontFamily: 'Montserrat-Regular', fontSize: 16, margin: 10}}>{item['item_title']}</Text>
                      <Icon style={{fontSize: 90, color: '#808080'}} name='shopping-bag' type='Feather'></Icon>
                      <AwesomeButton onPress={() => {alert('Purchase processing')}} style={{margin: 15, alignSelf: 'center'}} height={30}  backgroundColor={'#fafafa'} backgroundDarker={'#fff'}>
                        <Text style={{alignSelf: 'center', marginHorizontal: 20, fontSize: 14, fontFamily: 'Montserrat-Regular', color: '#fe6c17'}}>Купить</Text>
                      </AwesomeButton>
                      </Card>
                    </View>
                    }
                    ></FlatList>
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