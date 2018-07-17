let RTCPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection || window.msRTCPeerConnection;
let RTCSessionDescription = window.RTCSessionDescription || window.mozRTCSessionDescription || window.webkitRTCSessionDescription || window.msRTCSessionDescription;
navigator.getUserMedia = navigator.getUserMedia || navigator.mozGetUserMedia || navigator.webkitGetUserMedia || navigator.msGetUserMedia;

let localStream;


export default class RTC {
  constructor() {

    this.getUserMedia = this.getUserMedia.bind(this);
  }

  localStream() {
    return localStream;
  }

  getUserMedia(cb = () => {
  }) {
    navigator.getUserMedia({"audio": false, "video": false}, function (stream) {
      localStream = stream;
      return cb(null, stream);

    }, (err) => {
      console.log("An error getting user media", err);
      return cb(err);

    });
  }
}