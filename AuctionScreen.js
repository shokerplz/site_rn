import React from 'react';
import { Text, Card, CardItem, View } from 'native-base';
import HTML from 'react-native-render-html';
import { StyleSheet, Image, Dimensions } from 'react-native';
import ProgressCircle from 'react-native-progress-circle'
import { ScrollView } from 'react-native-gesture-handler';
import AwesomeButton from "react-native-really-awesome-button";
import { btnClick } from './functions';
import LottieView from 'lottie-react-native';
var highest_bidders;
class Auction extends React.Component {
    _isMounted = false;
    constructor(props){
        super(props);
        this.state = {
            loading_data: true,
            loading_page: true,
            highest_bidders: [],
            highest_bidders_time: [],
            highest_bidder: '',
            timer: 0,
            remaining_time: 435,
            testS: 0,
            show_bidders: false,
            price: 0,
            all_time: 0,
            percent: 0,
            AucHtml: '',
            ignoredTags: ['table']
        }
        this.id = this.props.route.params.id
        var AucHtml = '';
        let highest_bidders = [];
        imgs = [];
        this.clockCall = null;
        this.btnClick = btnClick.bind(this);
        let newTimer;
    }
    getImages = () => {
      image_array = []
      var i = 0;
      for (const auc_img of this.state.AucHtml['images']) {
        image_array.push(
          <Image source={{uri: auc_img}} style={{width: Dimensions.get('window').width/3, height: 130}} resizeMode={'contain'} key={this.state.AucHtml['title']['rendered']+i}></Image>
        )
        i++
    }
    this.imgs = image_array;
    }

    goToLogin = () => { this.props.navigation.navigate('Login') }

    getData_() {
      if (_isMounted) {
        let data = [];
        fetch('https://corcu.ru/auction/ajax_build.php')
        .then((response) => response.json())
        .then((responseJson) => {
          data = responseJson.filter(auc => {
              return auc['pid'] == this.id
          })[0]
          this.setState({
            price: data['current_bid'],
            all_time: data['auction_time'],
            highest_bidder: data['highest_bidder'],
            remaining_time: data['remaining_time']
          })
          bidders = this.state.highest_bidders;
          bidders_timer = this.state.highest_bidders_time;
          if (!bidders.includes(data['highest_bidder'])) {
            if (bidders.length > 4) {
              bidders.shift();
              bidders_timer.shift();
            }
            let today = new Date();
            bidders.push(data['highest_bidder'])
            bidders_timer.push(today.getHours()+':'+today.getMinutes()+':'+today.getSeconds())
            this.setState(prevState => ({
              highest_bidders: bidders,
              highest_bidders_time: bidders_timer
            }))
          }
        })
        .catch((error) => {
          //console.error(error);
        });
      }
      }
    decrementClock = async () => {  
      if (Math.abs(this.state.timer - this.state.remaining_time) > 2 || this.state.timer == 0) {
        clearInterval(this.clockCall);
        this.setState({timer: this.state.all_time, percent: 100})
        this.newTime();
      } else {
        this.setState((prevstate) => ({ 
          timer: prevstate.timer-0.5,
          percent: this.state.timer/this.state.all_time*100 }));
      }
      };
  
    newTime() {
      this.clockCall = setInterval(() => {
        this.decrementClock();
        }, 500);
    }

    async componentDidMount() {
        _isMounted = true;
        await fetch('https://corcu.ru/wp-json/wp/v2/auction/'+this.id)
        .then((response) => response.json())
        .then((responseJson) => {
          this.setState({AucHtml: responseJson})
          this.getImages();
        })
        .catch((error) => {
          //console.error(error);
        });
        await fetch('https://corcu.ru/auction/ajax_build.php')
        .then((response) => response.json()
        .then((responseJson) => {this.setState({
          timer: responseJson.filter(auc => { return auc['pid'] == this.id })[0]['remaining_time']
        })}))
        this.setState({loading_data: false})
        setTimeout(() => this.newTime(), 500)
        this.timer = setInterval(() =>this.getData_(), 500 )
        this.btnClick = btnClick.bind(this);
    }
    componentWillUnmount() {
      _isMounted = false;
      clearInterval(this.clockCall);
      clearInterval(this.timer);
     }
     shouldComponentUpdate(nextProps, nextState) {
       if (this.state.timer != nextState.timer || this.state.highest_bidder != nextState.highest_bidder || this.state.price != nextState.price) {
        return(true)
       } else { return(false) }
     }

     changeState = () => this.setState({show_bidders: !this.state.show_bidders})
     btnClickA = () => this.btnClick(this.id, this.state.all_time)

    render() {
        let show_bidders = this.state.show_bidders ? 'flex' : 'none'
        if (this.state.loading_data == false) {
            return(
                <Card style={{alignItems:'center'}}>
            <CardItem bordered>
                <View style={{flexDirection: 'row', position: 'relative'}}>
                {this.imgs}
                </View>
            </CardItem>
            <CardItem bordered key={this.state.all_time+'_'+this.state.timer+'_time'}>
              <Text style={{fontWeight: '500', fontFamily: 'Montserrat-Regular', marginRight: 0}}>₽ {this.state.price}</Text>
              <Text style={{fontWeight: '500', fontFamily: 'Montserrat-Regular', marginLeft: 35, width: 80, flex: 1}} numberOfLines={1}>{this.state.highest_bidder}</Text>
              <View style={{borderWidth: 1, borderColor: 'black', borderRadius: 50, marginLeft: 35, transform: [{rotateY: '180deg'}]}}>
              <ProgressCircle
                percent={this.state.percent}
                radius={15}
                borderWidth={4}
                color='#e5e5e5'
                shadowColor="#478959"
                bgColor="#fff">
              </ProgressCircle>
              </View>
              <Text style={{marginLeft: 10 ,fontFamily: 'Montserrat-Regular'}}>{parseInt(this.state.timer)}</Text>
            </CardItem>
            <CardItem>
              <AwesomeButton style={{marginRight: 5}} onPress={this.changeState // () - HERE ONLY BECAUSE WE HAVE ARGS IN FUNCTION. IT WOULD NOT WORK OTHERWISE
              } height={30} backgroundColor={'#fafafa'} backgroundDarker={'#fff'}>
                <Text style={{alignSelf: 'center', marginHorizontal: 20, fontSize: 14, color: '#fe6c17', fontFamily: 'Montserrat-Regular'}}>История ставок</Text>
                </AwesomeButton>
                <AwesomeButton style={{marginLeft: 5}} onPress={this.btnClickA // () - HERE ONLY BECAUSE WE HAVE ARGS IN FUNCTION. IT WOULD NOT WORK OTHERWISE
              } height={30} backgroundColor={'#fafafa'} backgroundDarker={'#fff'}>
                <Text style={{alignSelf: 'center', marginHorizontal: 20, fontSize: 14, color: '#fe6c17', fontFamily: 'Montserrat-Regular'}}>Сделать ставку</Text>
                </AwesomeButton>
            </CardItem>
              <CardItem style={{width: Dimensions.get('window').width, flexDirection: 'column', display: show_bidders}}>
                <View style={{flexDirection: 'row'}}>
                <Text style={styles.bidders_text}>{this.state.highest_bidders[3]}</Text><Text style={styles.bidders_text}>{this.state.highest_bidders_time[3]}</Text>
                </View>
                <View style={{flexDirection: 'row'}}>
                <Text style={styles.bidders_text}>{this.state.highest_bidders[2]}</Text><Text style={styles.bidders_text}>{this.state.highest_bidders_time[2]}</Text>
                </View>
                <View style={{flexDirection: 'row'}}>
                <Text style={styles.bidders_text}>{this.state.highest_bidders[1]}</Text><Text style={styles.bidders_text}>{this.state.highest_bidders_time[1]}</Text>
                </View>
                <View style={{flexDirection: 'row'}}>
                <Text style={styles.bidders_text}>{this.state.highest_bidders[0]}</Text><Text style={styles.bidders_text}>{this.state.highest_bidders_time[0]}</Text>
                </View>
              </CardItem>
            <CardItem style={{position: 'relative', top: 0, height: Dimensions.get('window').height/2+30}}>
              <ScrollView>
                <HTML html={this.state.AucHtml['content']['rendered']} imagesMaxWidth={200} ignoredTags={this.state.ignoredTags} tagsStyles={styles}/>
            </ScrollView>
            </CardItem>
         </Card>

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
    img: {
        overflow: 'visible',
        display: 'none', //AT LEAST FOR NOW
    },
    bidders_text : { width: 130, textAlign: 'center'},
    body: { backgroundColor: 'white'},
    show_bidders: {},
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
const customTextProps = { 
  style: { 
    fontFamily: 'Montserrat-Regular'
  }
}

export default Auction;