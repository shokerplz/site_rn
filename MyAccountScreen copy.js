import * as React from 'react';
import { View, Dimensions, StyleSheet } from 'react-native';
import { Container, Content, Form, Item, Input } from 'native-base';
import { TabView, SceneMap } from 'react-native-tab-view';
class MyAccount extends React.Component {
    constructor(props){
        super(props)
        this.state = {
            username: '',
            fist_name: '',
            last_name: '',
            email: ''
        }
    }
    FirstRoute = () => (
        <View style={[styles.scene, { backgroundColor: '#ff4081' }]} />
      );
      
    SecondRoute = () => (
        <View style={[styles.scene, { backgroundColor: '#673ab7' }]} />
      );
    componentDidMount = () => {
        [this.index, this.setIndex] = React.useState(0);
        [this.routes] = React.useState([
          { key: 'first', title: 'First' },
          { key: 'second', title: 'Second' },
        ]);
      
        this.renderScene = SceneMap({
          first: FirstRoute,
          second: SecondRoute,
        });
        this.initialLayout = { width: Dimensions.get('window').width };
    }
    render = () => {
        return(
            <Container>
                    <TabView
      navigationState={ this.index, this.routes }
      renderScene={this.renderScene}
      onIndexChange={this.setIndex}
      initialLayout={this.initialLayout}
    />
 
            </Container>
        )
    }
}
export default MyAccount;
const styles = StyleSheet.create({
    scene: {
        flex: 1
    }
})