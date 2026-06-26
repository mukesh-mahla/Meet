import { useEffect, useRef, useState } from 'react'
import './App.css';

const iscaller = new URLSearchParams(window.location.search).get("role") === "caller";
console.log("IS CALLER:", iscaller, "URL:", window.location.href);

function App() {

  const wsRef = useRef<WebSocket | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const videoRef = useRef(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [text,setText] = useState<{from:number, payload:string}[]>([])
  useEffect(() => {
    const ws = new WebSocket("ws://localhost:3000")
    wsRef.current = ws;
    ws.onopen = () => {
      console.log("connected");
      ws.send(JSON.stringify({
        type: "join_room",
        roomId: "hi",
        userId: 2
      }));
    };

    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
    });
    pcRef.current = pc;
    pc.onicecandidate = (event) => {
      if (event.candidate && wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: "signal",
          roomId: "hi",
          userId: 2,
          signalType: "ice-candidate",
          payload: event.candidate
        }));
      }
    };

    pc.ontrack = (event) => {
      console.log("Remote track received!", event.streams[0]);
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    async function setupCamera() {
      console.log("setup camers")
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });

      videoRef.current.srcObject = stream;

      // attach each track (video + audio) to the peer connection
      stream.getTracks().forEach((track) => {
        pc.addTrack(track, stream);
      });
      console.log("stram ")
      if (iscaller) {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        console.log("offer")

        if (wsRef.current?.readyState === WebSocket.OPEN) {
          console.log("setupe wesocket camres")
          wsRef.current.send(JSON.stringify({
            type: "signal",
            roomId: "hi",
            userId: 2,
            signalType: "offer",
            payload: offer
          }));
        }
      }
    }
    setupCamera();
    ws.onmessage = async (event) => {
      const data = JSON.parse(event.data);

      if (data.type === "signal" && data.signalType === "offer") {
        await pc.setRemoteDescription(new RTCSessionDescription(data.payload));
        console.log("ws on messsage")
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        ws.send(JSON.stringify({
          type: "signal",
          roomId: "hi",
          userId: 2,        // tab B's id — must differ from tab A
          signalType: "answer",
          payload: answer
        }));
      }

      if (data.type === "signal" && data.signalType === "answer") {
        await pc.setRemoteDescription(new RTCSessionDescription(data.payload));
      }

      if (data.type === "signal" && data.signalType === "ice-candidate") {
        await pc.addIceCandidate(new RTCIceCandidate(data.payload));
      }

      if(data.type === "text"){
        setText((prev)=>[...prev,{from:data.from,payload:data.payload}])
      }
    };

    return () => {
      pc.close();
      ws.close()
    };
  }, []);

  function handleclick(){
      const text = inputRef.current.value
      if(text === ""){
        return
      }
      
       if (wsRef.current?.readyState === WebSocket.OPEN) {
    wsRef.current.send(JSON.stringify({
      type: "chat",
      userId: 1,
      payload: text,
      roomId: "hi"
    }));

      
  }   
  setText((prev)=>[...prev,{from:1,payload:text}])

   inputRef.current.value = "";
  }


  return (
    <>
      <video ref={videoRef} autoPlay muted playsInline width={300} height={300} className=' rounded-md ' />
      <video
        ref={remoteVideoRef}
        autoPlay
        playsInline
      />
      <input type="text" ref={inputRef} />
      <button onClick={()=>{handleclick()}} >send</button>
      {text.map((m)=>(
        <div>
           <div>{m.from}</div>
        <span>{m.payload}</span>
        </div>
       
      ))}
    </>
  )
}

export default App
