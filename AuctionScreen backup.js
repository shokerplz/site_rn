import React, { Component } from 'react';
import { Text, Card, CardItem, View } from 'native-base';
import HTML from 'react-native-render-html';
import { StyleSheet, Image, Dimensions, Alert } from 'react-native';
import ProgressCircle from 'react-native-progress-circle'
import { ScrollView } from 'react-native-gesture-handler';
import AwesomeButton from "react-native-really-awesome-button";
import { btnClick } from './functions';
var highest_bidders;
class Auction extends React.PureComponent {
    _isMounted = false;
    constructor(props){
        super(props);
        this.state = {
            loading_data: true,
            loading_page: true,
            highest_bidders: [],
            highest_bidders_time: [],
            timer: 999,
            show_bidders: false
        }
        //this.getImages = this.getImages.bind(this);
        this.id = this.props.route.params.id
        var data = []
        var AucHtml = '';
        let highest_bidders = [];
        imgs = [];
        this.clockCall = null;
        this.btnClick = btnClick.bind(this);
    }
    getImages = () => {
      image_array = []
      var i = 0;
      for (const auc_img of this.AucHtml['images']) {
        image_array.push(
          <Image source={{uri: auc_img}} style={{width: Dimensions.get('window').width/3, height: 130}} resizeMode={'contain'} key={{i}}></Image>
        )
        i++
    }
    this.imgs = image_array;
    }

    async getData() {
      if (_isMounted) {
        fetch('https://corcu.ru/auction/ajax_build.php')
        .then((response) => response.json())
        .then((responseJson) => {
          this.data = responseJson.filter(auc => {
              return auc['pid'] == this.id
          })[0]
          bidders = this.state.highest_bidders;
          bidders_timer = this.state.highest_bidders_time;
          if (!bidders.includes(this.data['highest_bidder'])) {
            if (bidders.length > 4) {
              bidders.shift();
              bidders_timer.shift();
            }
            let today = new Date();
            bidders.push(this.data['highest_bidder'])
            bidders_timer.push(today.getHours()+':'+today.getMinutes()+':'+today.getSeconds())
            this.setState(prevState => ({
              highest_bidders: bidders,
              highest_bidders_time: bidders_timer
            }))
          }
          this.setState({loading_data: false})
        })
        .catch((error) => {
          console.error(error);
        });
      }
      }
    decrementClock = () => {  
      if (Math.abs(this.state.timer - this.data['remaining_time']) > 2 || this.state.timer == 0) {
        clearInterval(this.clockCall);
        this.state.timer = this.data['remaining_time']
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
    componentDidUpdate() {
      this.highest_bidder = this.data['highest_bidder']
    }
    componentDidMount() {
        _isMounted = true;
        fetch('https://corcu.ru/wp-json/wp/v2/auction/'+this.id)
        .then((response) => response.json())
        .then((responseJson) => {
          this.AucHtml = responseJson;
          this.getImages();
          this.setState({loading_page: false})
        })
        .catch((error) => {
          console.error(error);
        });
        this.getData();
        setTimeout(() => this.newTime(), 250)
        this.timer = setInterval(() => this.getData(), 500 )
        this.btnClick = btnClick.bind(this);
    }
    componentWillUnmount() {
      _isMounted = false;
      clearInterval(this.clockCall);
      clearInterval(this.timer);
     }
    render() {
      var show_bidders;
        if (this.state.show_bidders == true) {show_bidders = 'flex'} else {show_bidders = 'none'}
        if (this.state.loading_page == false && this.state.loading_data == false) {
            return(
                <Card style={{alignItems:'center'}}>
            <CardItem bordered>
                <View style={{flexDirection: 'row', position: 'relative'}}>
                {this.imgs}
                </View>
            </CardItem>
            <CardItem bordered>
              <Text style={{fontWeight: '500', fontFamily: 'Montserrat-Regular', marginRight: 0}}>₽ {this.data['current_bid']}</Text>
              <Text style={{fontWeight: '500', fontFamily: 'Montserrat-Regular', marginLeft: 35, width: 80, flex: 1}} numberOfLines={1}>{this.highest_bidder}</Text>
              <View style={{borderWidth: 1, borderColor: 'black', borderRadius: 50, marginLeft: 35, transform: [{rotateY: '180deg'}]}}>
              <ProgressCircle
                percent={this.state.timer/this.data['auction_time']*100}
                radius={15}
                borderWidth={4}
                color='#e5e5e5'
                shadowColor="#478959"
                bgColor="#fff">
              </ProgressCircle>
              </View>
              <Text style={{marginLeft: 10 ,fontFamily: 'Montserrat-Regular'}}>{this.state.timer}</Text>
            </CardItem>
            <CardItem>
              <AwesomeButton style={{marginRight: 5}} onPress={() => this.setState({show_bidders: !this.state.show_bidders}) // () - HERE ONLY BECAUSE WE HAVE ARGS IN FUNCTION. IT WOULD NOT WORK OTHERWISE
              } height={30} backgroundColor={'#fafafa'} backgroundDarker={'#fff'}>
                <Text style={{alignSelf: 'center', marginHorizontal: 20, fontSize: 14, color: '#fe6c17', fontFamily: 'Montserrat-Regular'}}>История ставок</Text>
                </AwesomeButton>
                <AwesomeButton style={{marginLeft: 5}} onPress={() => this.btnClick(this.id, this.data['auction_time']) // () - HERE ONLY BECAUSE WE HAVE ARGS IN FUNCTION. IT WOULD NOT WORK OTHERWISE
              } height={30} backgroundColor={'#fafafa'} backgroundDarker={'#fff'}>
                <Text style={{alignSelf: 'center', marginHorizontal: 20, fontSize: 14, color: '#fe6c17', fontFamily: 'Montserrat-Regular'}}>Сделать ставку</Text>
                </AwesomeButton>
            </CardItem>

              <CardItem style={{width: Dimensions.get('window').width, flexDirection: 'column', display: show_bidders}}>
                <View style={{flexDirection: 'row'}}>
            <Text>{this.state.highest_bidders[3]}</Text><Text style={{marginHorizontal: 25}}/><Text>{this.state.highest_bidders_time[3]}</Text>
                </View>
                <View style={{flexDirection: 'row'}}>
                <Text>{this.state.highest_bidders[2]}</Text><Text style={{marginHorizontal: 25}}/><Text>{this.state.highest_bidders_time[2]}</Text>
                </View>
                <View style={{flexDirection: 'row'}}>
                <Text>{this.state.highest_bidders[1]}</Text><Text style={{marginHorizontal: 25}}/><Text>{this.state.highest_bidders_time[1]}</Text>
                </View>
                <View style={{flexDirection: 'row'}}>
                <Text>{this.state.highest_bidders[0]}</Text><Text style={{marginHorizontal: 25}}/><Text>{this.state.highest_bidders_time[0]}</Text>
                </View>
              </CardItem>

            <CardItem style={{position: 'relative', top: -9}}>
              <ScrollView>
                <HTML html={this.AucHtml['content']['rendered']} imagesMaxWidth={200} ignoredTags={['table']} tagsStyles={styles}/>
            </ScrollView>
            </CardItem>
         </Card>

)   
        } else {
            return(
                <Text>LOADING</Text>
            )
        }

    }
}
const styles = StyleSheet.create({
    img: {
        overflow: 'visible',
        display: 'none', //AT LEAST FOR NOW
    },
    body: { backgroundColor: 'white'},
    show_bidders: {}
})

export default Auction;