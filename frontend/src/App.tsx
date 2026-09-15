import { useEffect, useRef, useState } from 'react'
import './App.css';



function App() {
  const myUserId = new URLSearchParams(window.location.search).get("user") || "1";

  const wsRef = useRef<WebSocket | null>(null);
const pcsRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const videoRef = useRef(null);
  const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(new Map());
  const inputRef = useRef<HTMLInputElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null);
  const iceCandidateBuffer = useRef<{ from: string, candidate: RTCIceCandidateInit }[]>([]);
  const [text,setText] = useState<{from:number, payload:string}[]>([])

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:3000")
    wsRef.current = ws;
    ws.onopen = () => {
      console.log("connected");
      ws.send(JSON.stringify({
        type: "join_room",
        roomId: "hi",
        userId: myUserId
      }));
    };

   function createPeerConnection(remoteUserId: string, stream: MediaStream) {
  const pc = new RTCPeerConnection({
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
  });

  // send ICE candidates tagged with who they're for
  pc.onicecandidate = (event) => {
    if (event.candidate && wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: "signal",
        roomId: "hi",
        signalType: "ice-candidate",
        to: remoteUserId,
        payload: event.candidate
      }));
    }
  };

  // when their stream arrives, add a video element for them
  pc.ontrack = (event) => {
    setRemoteStreams(prev => new Map(prev).set(remoteUserId, event.streams[0]));
  };

  // add your own tracks so they can see you
  stream.getTracks().forEach(track => pc.addTrack(track, stream));

  pcsRef.current.set(remoteUserId, pc);
  return pc;
}

async function flushIceCandidates(remoteUserId: string, pc: RTCPeerConnection) {
  const pending = iceCandidateBuffer.current.filter(c => c.from === remoteUserId);
  for (const { candidate } of pending) {
    await pc.addIceCandidate(new RTCIceCandidate(candidate));
  }
  iceCandidateBuffer.current = iceCandidateBuffer.current.filter(c => c.from !== remoteUserId);
}

    async function setupCamera() {
      console.log("setup camers")
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });

      videoRef.current.srcObject = stream;
       streamRef.current = stream
      // attach each track (video + audio) to the peer connection
     
      console.log("stram")
      
    }
     let p = setupCamera();
     
    ws.onmessage = async (event) => {
  const data = JSON.parse(event.data);

  // new — you just joined, here's who's already in the room
  if (data.type === "existing_users") {
    await p;
    for (const userId of data.users) {
      // create a pc for each existing user and send them an offer
      const pc = createPeerConnection(userId, streamRef.current);
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      wsRef.current?.send(JSON.stringify({
        type: "signal",
        roomId: "hi",
        signalType: "offer",
        to: userId,
        payload: offer
      }));
    }
  }

  // someone new joined after you — create a pc for them, wait for their offer
  if (data.type === "user_joined") {
    await p;
    createPeerConnection(data.userId, streamRef.current);
    // don't create offer here — they'll send one to you via existing_users
  }

  if (data.type === "signal" && data.signalType === "offer") {
    await p;
    const pc = pcsRef.current.get(data.from) || createPeerConnection(data.from, streamRef.current);
    await pc.setRemoteDescription(new RTCSessionDescription(data.payload));
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    await flushIceCandidates(data.from, pc);
    wsRef.current?.send(JSON.stringify({
      type: "signal",
      roomId: "hi",
      signalType: "answer",
      to: data.from,
      payload: answer
    }));
  }

  if (data.type === "signal" && data.signalType === "answer") {
    const pc = pcsRef.current.get(data.from);
    if (pc) await pc.setRemoteDescription(new RTCSessionDescription(data.payload));
    await flushIceCandidates(data.from, pc);
  }

  if (data.type === "signal" && data.signalType === "ice-candidate") {
    const pc = pcsRef.current.get(data.from);
    if (pc) {
      if (pc.remoteDescription) {
        await pc.addIceCandidate(new RTCIceCandidate(data.payload));
      } else {
       iceCandidateBuffer.current.push({ from: data.from, candidate: data.payload });
      }
    }
  }

  if (data.type === "text") {
    setText(prev => [...prev, { from: data.from, payload: data.payload }]);
  }
};

    return () => {
      if (streamRef.current) {
    streamRef.current.getTracks().forEach(track => track.stop());
  }
       pcsRef.current.forEach(pc => pc.close());
  pcsRef.current.clear();
  ws.close();
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
      userId: myUserId,
      payload: text,
      roomId: "hi"
    }));

      
  }   
  setText((prev)=>[...prev,{from:1,payload:text}])

   inputRef.current.value = "";
  }


  return (
    <div className='h-full w-full '>
     
      {Array.from(remoteStreams.entries()).map(([userId, stream]) => (
  <video
    key={userId}
    autoPlay
    playsInline
    ref={el => { if (el) el.srcObject = stream; }}
    width={300}
    height={300}
  />
))}
<video ref={videoRef} autoPlay muted playsInline width={300} height={300} />
      <input type="text" ref={inputRef} />
      <button onClick={()=>{handleclick()}} >send</button>
      {text.map((m)=>(
        <div>
           <div>{m.from}</div>
        <span>{m.payload}</span>
        </div>
       
      ))}
    </div>
  )
}

export default App
