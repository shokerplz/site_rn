import React from 'react';
import { StyleSheet, View, Dimensions, Text, Image, TouchableHighlight} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import ProgressCircle from 'react-native-progress-circle'
import { CardItem, Card } from 'native-base'
import { setCustomText } from 'react-native-global-props';
import { FlatList } from 'react-native-gesture-handler';
import AwesomeButton from "react-native-really-awesome-button";
import { btnClick, retrieveData } from './functions'
import LottieView from "lottie-react-native";
import {FooterButtons, postRequest} from './functions'
class AucItem extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {timer: this.props.auc_remaining_time};
    this.btnClick = btnClick.bind(this)
    this.highest_bidder = this.props.auc_highest_bidder;
    this.goToLogin = this.props.goToLogin;
  }

  componentDidUpdate() {
    this.highest_bidder = this.props.auc_highest_bidder;
  }


  decrementClock = () => {  
    if (Math.abs(this.state.timer - this.props.auc_remaining_time) > 2 || this.state.timer == 0) {
      clearInterval(this.clockCall);
      this.setState({timer: this.props.auc_remaining_time})
      this.newTime();
    } else {
      this.setState((prevstate) => ({ timer: prevstate.timer-1 }));
    }
   };

  newTime() {
    this.clockCall = setInterval(() => {
      this.decrementClock();
     }, 1000);
  }

  componentDidMount() {
    this.newTime();
   }

  componentWillUnmount() {
    clearInterval(this.clockCall);
   }
   thisGoToAuction = () => this.props.goToAuction(this.props.auc_pid)
   thisBtnClick = () => this.btnClick(this.props.auc_pid, this.props.auc_all_time)

  render() {
    return(
      <TouchableHighlight onPress={this.thisGoToAuction} underlayColor="#fff">
          <Card style={{width: Dimensions.get('window').width/2 - 4, alignItems: 'center'}}>
            <CardItem>
              <AucImg img_src={this.props.auc_img}/>
            </CardItem>
            <CardItem style={{height: styles.auc_text.height*2}}>
              <Text numberOfLines={2} style={{textAlign: 'center', fontWeight: '400'}}>{this.props.auc_name}</Text>
            </CardItem>
            <CardItem style={{height: styles.auc_text.height}}>
              <Text style={{textAlign: 'center', alignSelf: 'center',fontWeight: '500', height: styles.auc_text.height, fontFamily: 'Montserrat-Regular'}}>₽ {this.props.auc_price}</Text>
            </CardItem>
            <CardItem style={{height: styles.auc_text.height+15, alignSelf: 'stretch'}} key={this.props.auc_pid+'_'+this.state.timer+'_time'}>
              <View style={{borderWidth: 1, borderColor: 'black', borderRadius: 50, transform: [{rotateY: '180deg'}]}}>
              <ProgressCircle
                percent={this.state.timer/this.props.auc_all_time*100}
                radius={15}
                borderWidth={4}
                color='#e5e5e5'
                shadowColor="#478959"
                bgColor="#fff"
                >
                  <Text style={{transform: [{rotateY: '180deg'}]}}>{this.state.timer}</Text>
              </ProgressCircle>
              </View>
              <Text style={styles.auc_text, {textAlign: 'center', alignSelf: 'center', width: 100}}>{this.highest_bidder}</Text>
            </CardItem>
            <CardItem>
              <AwesomeButton onPress={this.thisBtnClick // () - HERE ONLY BECAUSE WE HAVE ARGS IN FUNCTION. IT WOULD NOT WORK OTHERWISE
              } height={30} backgroundColor={'#fafafa'} backgroundDarker={'#fff'}>
                <Text style={{alignSelf: 'center', marginHorizontal: 20, fontSize: 14, fontFamily: 'Montserrat-Regular', color: '#fe6c17'}}>Сделать ставку</Text>
                </AwesomeButton>
            </CardItem>
          </Card>
          </TouchableHighlight>
    )
  }
}
class AucImg extends React.PureComponent {
  render() {
    return(
      <Image style={{height: 105, width: null, flex: 1, resizeMode: 'contain'}} source={{uri: this.props.img_src}} />
    )
  }
}
class GetData extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      fontLoaded: false,
      data: [],
      loadedFirst: true
    };
    setCustomText(customTextProps);
    var data = []
    var dataFetching = false
    this.goToAuction = this.goToAuction.bind(this)
  }

  componentDidMount(){
    Dimensions.get('screen').height*Dimensions.get('screen').scale <= 1920 ? this.paddingBottom = 75 : this.paddingBottom = 130;
    this.timer = setInterval(() => this.getData(), 500);
    retrieveData('token').then((response) => {
      if (response != null) {
        postRequest('/simple-jwt-authentication/v1/token/validate').then(
          (response) => {
            if (response.data.status != 200) {
              AsyncStorage.removeItem('token');
              console.log('token removed')
            }
          }
        )
    }} )
  }

  getData() {
    fetch('https://corcu.ru/auction/ajax_build.php')
    .then((response) => response.json())
    .then((responseJson) => {
      this.setState({data: responseJson})
      this.setState({loading: false})
      if (this.state.loadedFirst) {
        this.forceUpdate();
        this.setState({loadedFirst: false});
      }
    })
    .catch((error) => {
      console.error(error);
    });
  }

  goToLogin = () => { this.props.navigation.navigate('Login') }

  goToAuction(auc_id) { this.props.navigation.navigate('Auction', { id: auc_id }) }
    render() {
      
      //retrieveData('token').then(console.log);
      if (this.state.loading == true) {
        return( 
          <View style={[styles.container, styles.horizontal]}>
        <LottieView 
          source={require('./assets/animations/corcu_loading.json')}
          loop
          autoPlay
        />
        </View>)
      }
  return(
    /*
        {      
      auc_img
      auc_name
      auc_price
      auc_percent
      auc_remaining_time
      auc_highest_bidder
      auc_pid
    }
    */

   <View>
     <View style={{height: Dimensions.get('window').height - this.paddingBottom}}>
     <FlatList
    data={this.state.data}
    numColumns={2}
    extraData={this.state.data}
    keyExtractor={item => item['pid']}
    renderItem={({item}) => 
      <AucItem 
        auc_img={item['auc_img']} 
        auc_name={item['auc_name']}
        auc_price={item['current_bid']}
        auc_remaining_time={item['remaining_time']}
        auc_highest_bidder={item['highest_bidder']}
        auc_pid={item['pid']}
        auc_all_time={item['auction_time']}
        auc_bid_btn={this.btnClick}
        goToLogin={this.goToLogin}
        goToAuction={this.goToAuction}
      />
    }
    />
     </View>
    <FooterButtons 
    style={{position: 'absolute', bottom: 0}}
    navigate={this.props.navigation} 
    key={/*8retrieveData('token').then((response) => {return(response)})*/505}  />
   </View>
  ) 
  
  }
}
   
  const styles = StyleSheet.create({
    header: {
      backgroundColor: '#c1a67f',
      height: 50
    },
    auc_text: {
      textAlign: "center",
      fontFamily: 'Montserrat-Regular',
      height: 20
    },
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
  const customTextProps = { 
    style: { 
      fontFamily: 'Montserrat-Regular'
    }
  }
export default GetData;