import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";

const socket = io("http://<BACKEND_IP>:5000");

function App() {
    const canvasRef = useRef(null);
    const ctxRef = useRef(null);
    const [drawing, setDrawing] = useState(false);

    useEffect(() => {
        const canvas = canvasRef.current;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        const ctx = canvas.getContext("2d");
        ctx.lineWidth = 5;
        ctxRef.current = ctx;

        socket.on("draw", ({ x0, y0, x1, y1 }) => {
            ctx.beginPath();
            ctx.moveTo(x0, y0);
            ctx.lineTo(x1, y1);
            ctx.stroke();
        });
    }, []);

    const startDrawing = ({ nativeEvent }) => {
        setDrawing(true);
    };

    const stopDrawing = () => {
        setDrawing(false);
    };

    const draw = ({ nativeEvent }) => {
        if (!drawing) return;
        const { offsetX, offsetY } = nativeEvent;
        const ctx = ctxRef.current;

        socket.emit("draw", {
            x0: offsetX,
            y0: offsetY,
            x1: offsetX + 1,
            y1: offsetY + 1,
        });

        ctx.beginPath();
        ctx.moveTo(offsetX, offsetY);
        ctx.lineTo(offsetX + 1, offsetY + 1);
        ctx.stroke();
    };

    return (
        <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseUp={stopDrawing}
            onMouseMove={draw}
        />
    );
}

export default App;

