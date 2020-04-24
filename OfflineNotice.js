import React, { PureComponent } from 'react';
import { View, Text, Dimensions, StyleSheet } from 'react-native';
import NetInfo from "@react-native-community/netinfo";

const { width } = Dimensions.get('window');

function MiniOfflineSign() {
  return (
    <View style={styles.offlineContainer}>
      <Text style={styles.offlineText}>Отсутствует соединение с интернетом</Text>
    </View>
  );
}


class OfflineNotice extends PureComponent {
  state = {
    isConnected: true
  };
  unsubscribe = null;
  componentDidMount() {
    this.unsubscribe = NetInfo.addEventListener(state => {
      this.setState({ isConnected: state.isConnected })
    });
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  handleConnectivityChange = isConnected => {
      this.setState({ isConnected });
  };

  render() {
    if (!this.state.isConnected) {
      return <MiniOfflineSign />;
    }
    return null;
  }
}

const styles = StyleSheet.create({
  offlineContainer: {
    backgroundColor: '#b52424',
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    width,
    position: 'absolute',
    top: 30
  },
  offlineText: { color: '#fff' }
});

export default OfflineNotice;