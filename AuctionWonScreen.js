import React from 'react';
import { View, Text, Image, FlatList, StyleSheet } from 'react-native';
import { retrieveData } from './functions';
import { Card, CardItem, Body } from 'native-base';
import LottieView from "lottie-react-native";

class AucsWon extends React.Component {
    user_won = [];

    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            img: null
        }
    }
    

    async getWon() {
        token = await retrieveData('token');
        fetch('https://corcu.ru/wp-json/wp/v2/users/me', {
            method: 'POST',
            headers: {
              'Authorization': 'Bearer '+ token,
            }}
            ).then((response) => response.json().then((responseJson) => {
                if (responseJson['user_won']) {
                    this.user_won = responseJson['user_won'];
                } else {
                    this.user_won = null;
                }
                this.setState({loading: false});
                this.setState({img: this.user_won[0]['Auc_img'][0]})
            }))
        
        
    }

    render() {
        
        if (this.state.loading) {
            this.getWon();
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
            if (this.user_won !== null){
                if (this.user_won.length > 0) {
                    return(
                        <View>
                            <FlatList
                            data={this.user_won}
                            numColumns={1}
                            keyExtractor={item => item['Auc_ID']}
                            renderItem={({item}) => 
                            <View>
                            <Card style={{height: 120, flexDirection: 'row'}}>
                            <Image style={{width: 100, resizeMode: 'contain', margin: 10}} source={{uri: item['Auc_img'][0]}}/>
                            <View style={{flexDirection: 'column'}}>
                                <Text style={{fontFamily: 'Montserrat-Regular', fontSize: 16, margin: 10}}>Вы выиграли:</Text>
                            <Text style={{fontFamily: 'Montserrat-Regular', fontSize: 16, marginHorizontal: 10}}>{item['Auc_name']}</Text>
                            <Text style={{fontFamily: 'Montserrat-Regular', fontSize: 16, margin: 10}}>При стоимости: {item['Auc_price']} ₽</Text>
                            </View>
                            </Card>
                            </View>
                            }
                            />
                        </View>
                    
                    )
                }
            } else {
                return (
                    <View style={{margin: 15, alignSelf: 'center'}} >
                    <Text style={{ fontFamily: 'Montserrat-Bold', fontSize: 16 }}>
                        На данный момент вы не являетесь победителем ни в одном аукционе
                    </Text>
                </View>
                )
            }
        }
    }
} 
export default AucsWon;

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