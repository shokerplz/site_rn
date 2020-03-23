import React from 'react';
import { View, Text } from 'react-native';

class AucsWon extends React.Component {

    render() {
        return(
            <View style={{margin: 15, alignSelf: 'center'}} >
                <Text style={{ fontFamily: 'Montserrat-Bold', fontSize: 16 }}>
                    На данный момент вы не являетесь победителем ни в одном аукционе
                </Text>
            </View>
        )
    }
} 
export default AucsWon;