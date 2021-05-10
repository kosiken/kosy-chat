import React, { useState, useEffect } from 'react';

function Messaging({ isReciever = false }) {
    const [connected, setConnected] = useState(false);
    const [messages, setMessages] = useState('');
    const [localConnection, setLocalConnection] = useState(null);
    const [remoteConnection, setRemoteConnetion] = useState(null);

    /**
     * 
     * @param {RTCPeerConnection} localConnection 
     */
     const initLocalOffer = async () => {
         const Lc = localConnection || window.localConnection
        const localOffer = await Lc.createOffer();
        console.log(`Got local offer`, localOffer);
        const localDesc = window.localConnection.setLocalDescription(localOffer);
        const remoteDesc = window.remoteConnection.setRemoteDescription(localOffer);
        return Promise.all([localDesc, remoteDesc]);
      };
    
    const onMessageReceived = (event) => {
        console.log(`Remote message received by local: ${event.data}`);
        setMessages(messages + '\n' + event.data);
    
      }
    const init = async () => {
        const dataChannelParams = { reliable: false };
        const Lc = new RTCPeerConnection(null, {
            optional: [{
                RtpDataChannels: true
            }]
        });
        const Rc = new RTCPeerConnection(null, {
            optional: [{
                RtpDataChannels: true
            }]
        });

        Lc.addEventListener('icecandidate', async e => {
            console.log('local connection ICE candidate: ', e.candidate);
            await Rc.addIceCandidate(e.candidate);

        })
        Rc.addEventListener('icecandidate', async e => {
            console.log('local connection ICE candidate: ', e.candidate);
            await Lc.addIceCandidate(e.candidate);

        })

        if (!isReciever) {
            let localc = Lc.createDataChannel('messaging-channels', dataChannelParams);
            localc.binaryType = 'arraybuffer'
            localc.onopen =  (e) => {
              console.log('connected on local channel')
              setConnected(true);
            }


            localc.addEventListener('close', (e) => {
                console.log('not connected on local channel')
                setConnected(false);
              });
            

              localc.addEventListener('message', onMessageReceived);

              await initLocalOffer();
        }

        else {
            recieveOffer()
        }
        setLocalConnection(Lc)
        setRemoteConnetion(Rc);
    }
    return (
        <div>

        </div>
    )
}

function sendLocalDescription(localOffer) {
    return;
}
function recieveOffer(offer) {
    return;
}
export default Messaging;