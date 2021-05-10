// import logo from './logo.svg';
import React, { useState, useEffect } from 'react'
import './App.css';

function App() {
  const [connected, setConnected] = useState(false);
 
  const [localMessages, setLocalMessages] = useState('');
  const [RemoteMessages, setRemoteMessages] = useState('');


  const init = async () => {
    const dataChannelParams = { ordered: true };
    let lc, rc, localc;
    if (!window.localConnection) window.localConnection  = new RTCPeerConnection();
    if (!window.remoteConnection) window.remoteConnection  = new RTCPeerConnection();
lc = window.localConnection;
rc = window.remoteConnection;
    window.localConnection.addEventListener('icecandidate', async e => {
      console.log('local connection ICE candidate: ', e.candidate);
      await window.remoteConnection.addIceCandidate(e.candidate);
    });

    window.remoteConnection.addEventListener('icecandidate', async e => {
      console.log('remote connection ICE candidate: ', e.candidate);
      await window.localConnection.addIceCandidate(e.candidate);
    });

    window.localChannel = localc = lc.createDataChannel('messaging-channel', dataChannelParams);
    localc.binaryType = 'arraybuffer'
    localc.addEventListener('open', (e) => {
      console.log('connected on local channel')
      setConnected(true);
    })

    localc.addEventListener('close', (e) => {
      console.log('not connected on local channel')
      setConnected(false);
    });

    localc.addEventListener('message', onLocalMessageReceived);
    rc.addEventListener('datachannel', onRemoteDataChannel);
    await initLocalOffer();
    await initRemoteAnswer();
  }
const onConnect = () => {
  init();
}

  useEffect(() => {
    

  }, [])
  const initLocalOffer = async () => {
    const localOffer = await window.localConnection.createOffer();
    console.log(`Got local offer`, localOffer );
    const localDesc = window.localConnection.setLocalDescription(localOffer);
    const remoteDesc = window.remoteConnection.setRemoteDescription(localOffer);
    return Promise.all([localDesc, remoteDesc]);
  };

  const initRemoteAnswer = async () => {
    const remoteAnswer = await window.remoteConnection.createAnswer();
    console.log(`Got remote answer`, remoteAnswer);
    const localDesc = window.remoteConnection.setLocalDescription(remoteAnswer);
    const remoteDesc = window.localConnection.setRemoteDescription(remoteAnswer);
    return Promise.all([localDesc, remoteDesc]);
  };


  const onLocalMessageReceived = (event) => {
    console.log(`Remote message received by local: ${event.data}`);
    setLocalMessages(localMessages + ' ' + event.data + '\n');

  }

  const onRemoteMessageReceived = (event) => {
    console.log(`Remote message received by local: ${event.data}`);
    setRemoteMessages(RemoteMessages + ' ' + event.data + '\n');

  }
  const onRemoteDataChannel = (event) => {
    let _remoteChannel;
    console.log(`onRemoteDataChannel: ${JSON.stringify(event)}`);
    window.remoteChannel = _remoteChannel = event.channel;
    _remoteChannel.binaryType = 'arraybuffer';
    _remoteChannel.addEventListener('message', onRemoteMessageReceived);
    _remoteChannel.addEventListener('close', () => {
      console.log('Remote channel closed!');
      setConnected(false);
    });
  }
  return (
    <div className="App">
      <div id="sendReceive">
        <button onClick={onConnect}>
          Connect
        </button>
        <div id="send">
          <h2>Sensd</h2>
          <textarea id="dataChannelSend" disabled={!connected}
            onChange={(event) => {
              setLocalMessages(event.target.value)
            }}

            placeholder="Press Start, enter some text, then press Send."></textarea>
          <br />
          <button onClick={() => {
            if (window.localChannel) {
              console.log('sending ' + localMessages);
              window.localChannel.send(localMessages);
            }
          }}>Send from Remote</button>
        </div>
        <div id="receive">
          <h2>Receive</h2>

          <textarea id="dataChannelReceive" disabled={!connected} onChange={(event) => {
            setRemoteMessages(event.target.value)
          }}></textarea>
          <br />
          <button onClick={() => {
            if (window.remoteChannel) {
              console.log('sending ' + RemoteMessages);
              window.remoteChannel.send(RemoteMessages);
            }
          }}>Send from Remote</button>
        </div>
        <div className="messageBox">
          <label htmlFor="localIncoming">Local incoming messages:</label>
          <textarea className="message" id="localIncoming" disabled value={localMessages}
            placeholder="Local incoming messages arrive here."></textarea>

        </div>


        <div className="messageBox">
          <label htmlFor="remoteIncoming">Remote incoming messages:</label>
          <textarea className="message" id="remoteIncoming" disabled
            value={RemoteMessages}
            placeholder="Remote incoming messages arrive here."></textarea>
        </div>
      </div>

      {
        connected && (<p>
          connectedr
        </p>)
      }
    </div>


  );
}

export default App;
