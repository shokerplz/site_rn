import React from 'react';
import { View, Text, Image, FlatList } from 'react-native';
import { Button } from 'native-base';
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
        fetch('https://www.corcu.ru/wp-json/corcu/buy/0')
        .then((response) => response.json())
        .then((responseJson) => {
          this.setState({data: responseJson})
          this.setState({loading: false})
        })
        .catch((error) => {
          console.error(error);
        });
    }

    componentDidMount() {
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
                <View>
                    <Button>
                        
                    </Button>
                </View>
            )
        }
    }
}
export default BuyScreen;