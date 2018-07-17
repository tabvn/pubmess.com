import React from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import _ from 'lodash'
import RTC from './rtc'

const configuration = {'iceServers': [{'url': 'stun:stun.l.google.com:19302'}]}
let pcPeers = {}
const rtc = new RTC()
let localStream

const logError = (err) => {
  console.log('An error:', err)
}

class WebRtc extends React.Component {

  constructor (props) {
    super(props)
    this.state = {
      model: {
        title: '',
      },
      error: {},
      disableSubmit: false,
      live: false,
      remoteList: new Map(),
      localStreamUrl: null,
      camera: {
        clientId: '123'
      },
      watchingCount: 0,
    }

    this._onStart = this._onStart.bind(this)
    this._requestUserMedia = this._requestUserMedia.bind(this)
    this._onStop = this._onStop.bind(this)
    this.createPeerConnection = this.createPeerConnection.bind(this)
    this.exchange = this.exchange.bind(this)

    this._timeout = null
  }

  _requestUserMedia (cb = () => {
  }) {

    rtc.getUserMedia((err, stream) => {
      if (err) {
        return cb(err)
      }
      localStream = stream
      this.setState({localStreamUrl: URL.createObjectURL(stream)}, () => {

        return cb(null, stream)
      })
    })
  }

  getStats () {
    const pc = pcPeers[Object.keys(pcPeers)[0]]
    if (pc.getRemoteStreams()[0] && pc.getRemoteStreams()[0].getAudioTracks()[0]) {
      const track = pc.getRemoteStreams()[0].getAudioTracks()[0]
      console.log('track', track)
      pc.getStats(track, function (report) {
        console.log('getStats report', report)
      }, logError)
    }
  }

  createPeerConnection (socketId, isOffer) {

    const {camera} = this.state
    const exchangeTopic = `camera_exchange_${camera.clientId}_${socketId}`
    const pc = new RTCPeerConnection(configuration)
    pcPeers[socketId] = pc

    const _this = this
    pc.onicecandidate = function (event) {
      console.log('onicecandidate', event.candidate)
      if (event.candidate) {
        // socket.emit('exchange', {'to': socketId, 'candidate': event.candidate});

        _this.props.broadcast(exchangeTopic, {'candidate': event.candidate})

      }
    }

    function createOffer () {
      pc.createOffer(function (desc) {
        console.log('createOffer', desc)
        pc.setLocalDescription(desc, function () {
          console.log('setLocalDescription', pc.localDescription)
          //socket.emit('exchange', {'to': socketId, 'sdp': pc.localDescription});

          _this.props.broadcast(exchangeTopic, {sdp: pc.localDescription})

        }, logError)
      }, logError)
    }

    pc.onnegotiationneeded = function () {
      console.log('onnegotiationneeded')
      if (isOffer) {
        createOffer()
      }
    }

    pc.oniceconnectionstatechange = function (event) {
      console.log('oniceconnectionstatechange', event.target.iceConnectionState)
      //disconnected,failed
      if (event.target.iceConnectionState === 'completed') {
        this._timeout = setTimeout(() => {
          this.getStats()
        }, 1000)
      }
      if (event.target.iceConnectionState === 'connected') {
        createDataChannel()
      }
    }
    pc.onsignalingstatechange = function (event) {
      console.log('onsignalingstatechange', event.target.signalingState)
    }

    pc.onaddstream = function (event) {
      console.log('onaddstream', event.stream)
      //container.setState({info: 'One peer join!'});
      console.log('One peer joined!')

      let remoteList = _this.state.remoteList

      //remoteList = _.setWith(remoteList, socketId, event.stream.toURL());
      remoteList = remoteList.set(socketId, event.stream.toURL())

      _this.setState({
        remoteList: remoteList
      })

      //container.setState({remoteList: remoteList});
    }
    pc.onremovestream = function (event) {
      console.log('onremovestream', event.stream)
    }
    pc.onclose = () => {
      console.log('SOmeone out')
    }

    //attach media stream
    if (localStream) {
      pc.addStream(localStream)
    }

    function createDataChannel () {
      if (pc.textDataChannel) {
        return
      }
      const dataChannel = pc.createDataChannel('text')

      dataChannel.onerror = function (error) {
        console.log('dataChannel.onerror', error)
      }

      dataChannel.onmessage = function (event) {
        console.log('dataChannel.onmessage:', event.data)
        // container.receiveTextData({user: socketId, message: event.data});
      }

      dataChannel.onopen = function () {
        console.log('dataChannel.onopen')
        //container.setState({textRoomConnected: true});
      }

      dataChannel.onclose = function () {
        console.log('dataChannel.onclose')
      }

      pc.textDataChannel = dataChannel
    }

    return pc
  }

  exchange (data, fromId) {
    const {camera} = this.state

    const _this = this

    const exchangeTopic = `camera_exchange_${camera.clientId}_${fromId}`

    let pc

    if (fromId in pcPeers) {
      pc = pcPeers[fromId]
    } else {
      pc = this.createPeerConnection(fromId, false)
    }

    if (data.sdp) {

      pc.setRemoteDescription(new RTCSessionDescription(data.sdp), function () {
        if (pc.remoteDescription.type === 'offer')
          pc.createAnswer(function (desc) {

            pc.setLocalDescription(desc, function () {

              _this.props.broadcast(exchangeTopic, {sdp: pc.localDescription})

            }, logError)
          }, logError)
      }, logError)
    } else {

      pc.addIceCandidate(new RTCIceCandidate(data.candidate))
    }
  }

  _onStart (bool = true) {

    console.log('Start WEBRTC')

    const {user} = this.props
    const userId = _.get(user, '_id')

    const _this = this

    const camera = {
      clientId: '123',
    }

    _this.props.subscribe(`camera_join_${camera.clientId}`, (params) => {

      console.log('Somone want to join ', params, user)

      // let create new peer connection when receive request view camera
      const fromId = params.from

      // we got new client want to join to this camera
      const cameraId = camera.clientId
      _this.props.subscribe(`camera_exchange_${cameraId}_${fromId}`, (data) => {

        this.exchange(data, fromId)
      })

      let pc = _.get(pcPeers, fromId)
      if (!pc) {
        _this.createPeerConnection(fromId, true)
      }

    })

    // listen for someone left the camera
    _this.props.subscribe(`camera_left_${camera.clientId}`, () => {
      console.log('Someone left')

    })

  }

  _onStop () {

    const camera = this.state.camera
    const _this = this

    if (camera) {
      this.props.send({
        action: 'camera_stop',
        payload: camera.clientId
      })

      _this.props.publish(`camera_stop_${camera.clientId}`, {id: camera.clientId})
    }

    _.each(pcPeers, (pc, index) => {
      pc.close()
      delete pcPeers[index]
    })

  }

  componentDidMount () {

    this._onStart()
  }

  componentWillUnmount () {

    clearTimeout(this._timeout)
    this._onStop()
    if (localStream) {
      localStream.getTracks().forEach(function (track) {
        track.stop()
      })
      this.setState({
        localStreamUrl: null
      })
    }
  }

  dataURItoBlob (dataURI) {
    // convert base64/URLEncoded data component to raw binary data held in a string
    let byteString
    if (dataURI.split(',')[0].indexOf('base64') >= 0)
      byteString = atob(dataURI.split(',')[1])
    else
      byteString = unescape(dataURI.split(',')[1])

    // separate out the mime component
    let mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0]

    // write the bytes of the string to a typed array
    let ia = new Uint8Array(byteString.length)
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i)
    }

    return new Blob([ia], {type: mimeString})
  }

  render () {
    return (
      <div>RTC Component</div>
    )
  }
}

const mapStateToProps = (state, props) => ({
  user: state.app.user,
})

const mapDispatchToProps = dispatch => bindActionCreators({
  broadcast: (topic, message, cb = null) => {
    return (dispatch, getState, {service, pubSub}) => {
      pubSub.broadcast(topic, message, cb)
    }
  },
  publish: (topic, message, cb = null) => {
    return (dispatch, getState, {service, pubSub}) => {
      pubSub.publish(topic, message, cb)
    }
  },
  send: (message, cb = null) => {
    return (dispatch, getState, {service, pubSub}) => {
      pubSub.send(message, cb)
    }
  },
  subscribe: (topic, cb = null) => {
    return (dispatch, getState, {service, pubSub}) => {
      pubSub.subscribe(topic, cb)
    }
  },

}, dispatch)

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(WebRtc)