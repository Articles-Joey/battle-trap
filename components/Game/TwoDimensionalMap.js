import { useSocketStore } from "@/hooks/useSocketStore";
import { useEffect, useRef } from "react";

export default function TwoDimensionalMap() {

    var canvas;
    var context;
    var static_canvas;
    var static_context;

    const canvasGameRef = useRef(null);
    const staticGameCanvasRef = useRef(null);
    const canvasScoreboardRef = useRef(null);

    const socket = useSocketStore(state => state.socket);

    function battleTrapGameTickLogic(msg) {
        console.log(`Just received battleTrapGameTickLogic`, msg);
    }

    function drawBoard() {

        // Box width
        var bw = 600;
        // Box height
        var bh = 600;
        // Padding
        var p = 0;

        var context = static_context

        for (var x = 0; x <= bw; x += 30) {
            context.moveTo(0.5 + x + p, p);
            context.lineTo(0.5 + x + p, bh + p);
        }

        for (var x = 0; x <= bh; x += 30) {
            context.moveTo(p, 0.5 + x + p);
            context.lineTo(bw + p, 0.5 + x + p);
        }

        // context.strokeStyle = "black";
        context.strokeStyle = "#f000ff";
        context.stroke();

        context.fillStyle = '#38FF12';
        context.fillRect(7.5, 7.5, (15 * 7), 15);

        context.fillStyle = '#FDFF00';
        context.fillRect(7.5, (7.5 * 5), (15 * 14), (15));

        context.fillStyle = '#001eff';
        // context.rotate(180 * Math.PI / 180);
        context.fillRect((bw - 21), (bh - (21 * 15.3)), (15), (15 * 21));

        // context.rotate(0);

        context.fillStyle = '#FF8001';
        context.fillRect((7.5), (bh - 21), (15 * 28), (15));

    }

    useEffect(() => {

        canvas = document.getElementById('player-canvas');
        context = canvas.getContext('2d');
        canvas.width = 600;
        canvas.height = 600;

        static_canvas = document.getElementById('static-canvas');
        static_context = static_canvas.getContext('2d');
        static_canvas.width = 600;
        static_canvas.height = 600;

        drawBoard()

        // socket.emit('join-room', 'game:battle-trap');
        socket.on('battle-trap-players', battleTrapGameTickLogic);

        return () => {
            socket.off('battle-trap-players')
            // clearInterval(movementEmit);
            socket.emit('leave-room', 'game:battle-trap');
        }

    }, []);

    return (
        <div className='ratio ratio-1x1 canvas-container bg-black'>
            <canvas
                id='static-canvas'
                className='static'
                width={600}
                height={600}
                ref={staticGameCanvasRef}
            />
            <canvas
                id='player-canvas'
                // className='players'
                width={600}
                height={600}
                ref={canvasGameRef}
            />
        </div>
    );
}