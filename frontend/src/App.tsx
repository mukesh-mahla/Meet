import { useEffect, useRef, useState } from 'react'
import './App.css';

const iscaller = new URLSearchParams(window.location.search).get("role") === "caller";
console.log("IS CALLER:", iscaller, "URL:", window.location.href);

function App() {
  const [count, setCount] = useState(0)
  const wsRef = useRef<WebSocket | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const videoRef = useRef(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
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
    };

    return () => {
      pc.close();
      ws.close()
    };
  }, []);


  return (
    <>
      <section id="center">
        <div>
          <h1>Get started</h1>
          <p>
            Edit <code>src/App.tsx</code> and save to test <code>HMR</code>
          </p>
          <video ref={videoRef} autoPlay muted playsInline />
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
          />
        </div>
        <button
          type="button"
          className="counter"
          onClick={() => setCount((count) => count + 1)}
        >
          Count is {count}
        </button>
      </section>

      <div className="ticks"></div>

      <section id="next-steps">
        <div id="docs">
          <svg className="icon" role="presentation" aria-hidden="true">
            <use href="/icons.svg#documentation-icon"></use>
          </svg>
          <h2>Documentation</h2>
          <p>Your questions, answered</p>

        </div>
        <div id="social">
          <svg className="icon" role="presentation" aria-hidden="true">
            <use href="/icons.svg#social-icon"></use>
          </svg>
          <h2>Connect with us</h2>
          <p>Join the Vite community</p>
          <ul>
            <li>
              <a href="https://github.com/vitejs/vite" target="_blank">
                <svg
                  className="button-icon"
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#github-icon"></use>
                </svg>
                GitHub
              </a>
            </li>
            <li>
              <a href="https://chat.vite.dev/" target="_blank">
                <svg
                  className="button-icon"
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#discord-icon"></use>
                </svg>
                Discord
              </a>
            </li>
            <li>
              <a href="https://x.com/vite_js" target="_blank">
                <svg
                  className="button-icon"
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#x-icon"></use>
                </svg>
                X.com
              </a>
            </li>
            <li>
              <a href="https://bsky.app/profile/vite.dev" target="_blank">
                <svg
                  className="button-icon"
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#bluesky-icon"></use>
                </svg>
                Bluesky
              </a>
            </li>
          </ul>
        </div>
      </section>

      <div className="ticks"></div>
      <section id="spacer"></section>
    </>
  )
}

export default App
