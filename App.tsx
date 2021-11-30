import React, {Component} from 'react';
import {StyleSheet, View, TextInput, Button, SafeAreaView} from 'react-native';
import RtcEngine from 'react-native-agora';

type State = {
  appId: string;
  token: string;
  channelName: string;
  joinSucceed: boolean;
  openMicrophone: boolean;
  enableSpeakerphone: boolean;
  peerIds: number[];
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  top: {
    width: '100%',
  },
  input: {
    borderColor: 'gray',
    borderWidth: 1,
  },
});

export default class App extends Component<{}, State, any> {
  _engine?: RtcEngine;

  constructor(props: {}) {
    super(props);
    this.state = {
      channelName: 'channel_test_01',
      joinSucceed: false,
      appId: 'a844e635081a492098c29afe0db517dc',
      token:
        '006a844e635081a492098c29afe0db517dcIAAHnvUauzb7A4IPk+4YSfbdnqcA+7BEaCT7zeNED46VoT54ZtkAAAAAEABgg+xaZAanYQEAAQBkBqdh',
      openMicrophone: true,
      enableSpeakerphone: true,
      peerIds: [],
    };
  }

  componentDidMount() {
    this.init();
  }

  init = async () => {
    const {appId} = this.state;
    this._engine = await RtcEngine.create(appId);

    await this._engine.enableAudio();

    this._engine.addListener('UserJoined', (uid, elapsed) => {
      console.log('UserJoined', uid, elapsed);
      const {peerIds} = this.state;
      if (peerIds.indexOf(uid) === -1) {
        this.setState({
          peerIds: [...peerIds, uid],
        });
      }
    });

    this._engine.addListener('UserOffline', (uid, reason) => {
      console.log('UserOffline', uid, reason);
      const {peerIds} = this.state;
      this.setState({
        peerIds: peerIds.filter(id => id !== uid),
      });
    });

    this._engine.addListener('JoinChannelSuccess', (channel, uid, elapsed) => {
      console.log('JoinChannelSuccess', channel, uid, elapsed);
      this.setState({
        joinSucceed: true,
      });
    });
  };

  _joinChannel = async () => {
    const {token, channelName} = this.state;
    console.log('joinChannel', token, channelName);
    await this._engine?.joinChannel(token, channelName, null, 0);
  };

  _switchMicrophone = () => {
    const {openMicrophone} = this.state;
    this._engine
      ?.enableLocalAudio(!openMicrophone)
      .then(() => {
        this.setState({openMicrophone: !openMicrophone});
      })
      .catch(err => {
        console.warn('enableLocalAudio', err);
      });
  };

  _switchSpeakerphone = () => {
    const {enableSpeakerphone} = this.state;
    this._engine
      ?.setEnableSpeakerphone(!enableSpeakerphone)
      .then(() => {
        this.setState({enableSpeakerphone: !enableSpeakerphone});
      })
      .catch(err => {
        console.warn('setEnableSpeakerphone', err);
      });
  };

  _leaveChannel = async () => {
    await this._engine?.leaveChannel();
    this.setState({peerIds: [], joinSucceed: false});
  };

  render() {
    const {channelName, joinSucceed, openMicrophone, enableSpeakerphone} =
      this.state;
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.top}>
          <TextInput
            style={styles.input}
            onChangeText={text => this.setState({channelName: text})}
            placeholder={'Channel Name'}
            value={channelName}
          />
          <Button
            onPress={joinSucceed ? this._leaveChannel : this._joinChannel}
            title={`${joinSucceed ? 'Leave' : 'Join'} channel`}
          />
        </View>
        <Button
          onPress={this._switchMicrophone}
          title={`Microphone ${openMicrophone ? 'on' : 'off'}`}
        />
        <Button
          onPress={this._switchSpeakerphone}
          title={enableSpeakerphone ? 'Speakerphone' : 'Earpiece'}
        />
      </SafeAreaView>
    );
  }
}
