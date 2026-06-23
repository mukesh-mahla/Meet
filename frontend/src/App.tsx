import { useEffect, useRef, useState } from 'react'
import './App.css';






function App() {
  const [count, setCount] = useState(0)
  const wsRef = useRef<WebSocket | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const videoRef = useRef(null);


  useEffect(() => {
    async function startCamera() {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });

      videoRef.current.srcObject = stream;
    }

    startCamera().then((f) => console.log("dwdddddddddddddddddddddddddddddddd", f));
  }, []);

  useEffect(() => {
  const pc = new RTCPeerConnection({
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
  });

  pcRef.current = pc;

  pc.onicecandidate = (event) => {
    console.log("ICE candidate found:", event.candidate);
  };

  pc.ontrack = (event) => {
    console.log("Remote track received!", event.streams[0]);
  };

  return () => {
    pc.close();
  };
}, []);



  useEffect(() => {
    const ws = new WebSocket("ws://localhost:3000")


    wsRef.current = ws;

    ws.onopen = () => {
      console.log("connected");

      ws.send(JSON.stringify({
        type: "join_room",
        roomId: "hi",
        userId: 1
      }));

      ws.send(JSON.stringify({
        type: "signal",
        roomId: "hi",
        userId: 1,
        payload: "hello g0000"
      }));
    };

    ws.onmessage = (event) => {
      console.log(event.data);
    };

    return () => {
      ws.close();
    };


  }, [])


  return (
    <>
      <section id="center">

        <div>
          <h1>Get started</h1>
          <p>
            Edit <code>src/App.tsx</code> and save to test <code>HMR</code>
          </p>
          <video ref={videoRef} autoPlay muted playsInline />

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
