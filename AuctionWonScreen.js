import React from 'react';
import { View, Text, Image, FlatList } from 'react-native';
import { retrieveData } from './functions';
import { Card, CardItem, Body } from 'native-base';

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
                this.user_won = responseJson['user_won'];
                this.setState({loading: false});
                this.setState({img: this.user_won[0]['Auc_img'][0]})
            }))
        
        
    }

    render() {
        
        if (this.state.loading) {
            this.getWon();
            return(<View><Text>LOADING</Text></View>)
        } else {
            console.log(this.user_won[0]['Auc_img'][0]);
            return(
                <View>
                    <FlatList
                    data={this.user_won}
                    numColumns={1}
                    keyExtractor={item => item['Auc_ID']}
                    renderItem={({item}) => 
                    <View>
                    <Card style={{height: 120, flexDirection: 'row'}}>
                    <Image style={{width: 100, resizeMode: 'contain', margin: 10, borderWidth: 1, borderColor: '#D9D9D6'}} source={{uri: item['Auc_img'][0]}}/>
                    <View style={{flexDirection: 'column', width: 220}}>
                    <Text style={{fontFamily: 'Montserrat-Regular', padding: 10}}>{item['Auc_name']}</Text>
                    <Text style={{fontFamily: 'Montserrat-Regular', padding: 10}}>Вы выиграли данный лот при стоимости: {item['Auc_price']} ₽</Text>
                    </View>
                    </Card>
                    </View>
                    }
                    />
                </View>
            
            )
        }
    }
} 
export default AucsWon;