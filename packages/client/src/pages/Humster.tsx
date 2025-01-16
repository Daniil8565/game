import React, { useState, useEffect } from 'react'
import { getRandomInt } from '../ utils/math_function'
import '../style/humster.scss'
let animationFrameId: number | null = null
let counter = 0

let emerald_y = 0;
let emerald_x = 0;
let expectation = 0;
let dop_count = 50;

const CanvasBlock: React.FC = () => {
    const [width, setWidth] = useState<number>(window.innerWidth)
    const [height, setHeight] = useState<number>(Math.round(window.innerHeight * 0.9 - 20));


    useEffect(() => {
        createCanvas()
        window.addEventListener('resize', () => {
            setWidth(window.innerWidth);
            setHeight(window.innerHeight * 0.9 - 20);
        })
        window.addEventListener('beforeunload', () =>
            window.cancelAnimationFrame(animationFrameId as number)
        )
    })

    const createCanvas = () => {
        const canvas = document.getElementById('canvas') as HTMLCanvasElement;
        const context = canvas.getContext('2d') as CanvasRenderingContext2D;

        const circle_x = width / 2;
        const circle_y = height / 2;
        const circle_size = Math.min(width, height - 100);

        const humster_img = new Image();
        humster_img.src = '../src/image/humster.png';
        humster_img.onload = () => {
            context.drawImage(
                humster_img,
                circle_x - humster_img.width / 2,
                circle_y - humster_img.height / 2
            )
        }

        const emerald_img = new Image();
        emerald_img.src = '../src/image/emerald.png';

        window.onclick = e => {
            const x = e.x
            const y = e.y
            counter++;
            if (Math.abs(emerald_x + 40 - x) < 40
                && Math.abs(emerald_y + (window.innerHeight - height) + 30 - y) < 30) {
                dop_count = dop_count - 10;
                counter = counter + 10;
            }
            drawCanvas();
        }
        animation();

        function drawCanvas() {

            context.clearRect(0, 0, width, height)
            topMenu();
            drawCircle();
            context.drawImage(
                humster_img,
                circle_x - humster_img.width / 2,
                circle_y - humster_img.height / 2
            );
            bottomMenu();
        }

        function topMenu() {
            context.fillStyle = '#32363c';
            context.fillRect(width * 0.055, 20, width * 0.25, 50);
            context.fillRect(width * 0.355, 20, width * 0.25, 50);
            context.fillRect(width * 0.655, 20, width * 0.25, 50);

            context.font = '50px Arial';
            context.fillStyle = '#ffffff';
            const counter_length = (counter + '').length * 10;
            context.fillText(counter.toString(), width / 2 - counter_length, 130);
            drawDolar(width / 2 - counter_length, 130);
        }

        function drawDolar(x: number, y: number) {
            context.beginPath();
            context.fillStyle = '#f9e160';
            context.arc(x - 30, y - 15, 20, 0, 360);
            context.closePath();
            context.fill();

            context.beginPath();
            const radial_gradient = context.createRadialGradient(x - 30, y - 15, 0, x - 30, y - 15, 15);
            radial_gradient.addColorStop(0.5, '#fec51c');
            radial_gradient.addColorStop(1, '#fe891ca5');
            context.fillStyle = radial_gradient;
            context.arc(x - 30, y - 15, 15, 0, 360);
            context.closePath();
            context.fill();

            context.font = '20px Arial';
            context.fillStyle = '#ffffff';
            context.fillText('$', x - 35, y - 8);
        }

        function drawCircle() {
            context.beginPath();
            const large_circle_size = circle_size * 0.4;
            const gradient = context.createLinearGradient(
                0,
                circle_y - large_circle_size,
                0,
                circle_y + large_circle_size
            );
            gradient.addColorStop(0.2, '#5155DA');
            gradient.addColorStop(1, '#282D74');
            context.fillStyle = gradient;
            context.arc(circle_x, circle_y, large_circle_size, 0, 360);
            context.closePath();
            context.fill();

            context.beginPath();
            const radial_gradient = context.createRadialGradient(
                circle_x,
                circle_y,
                0,
                circle_x,
                circle_y,
                circle_size * 0.35
            );
            radial_gradient.addColorStop(0.6, '#35389e');
            radial_gradient.addColorStop(1, '#1c2848');
            context.fillStyle = radial_gradient;
            context.arc(circle_x, circle_y, circle_size * 0.35, 0, 360);
            context.closePath();
            context.fill();
        }

        function bottomMenu() {
            context.font = '14px Arial';
            context.fillStyle = '#f7c243';
            context.fillText('⚡️', 40, height - 120);

            context.fillStyle = '#ffffff';
            context.fillText('6500/6500', 60, height - 120);
            context.fillText('Boost', width - 110, height - 120);

            context.fillStyle = '#32363c';;
            context.fillRect(width * 0.055, height - 100, width * 0.85, 50)
        }

        function animation() {
            animationFrameId = window.requestAnimationFrame(animation);
            if (expectation > 0) {
                expectation--;
                return;
            }
            if (height === emerald_y || dop_count === 0) {
                drawCanvas()
                emerald_x = 0;
                emerald_y = 0;
                dop_count = 50;
                expectation = getRandomInt(50) * 100;

            }
            else redraw();
        }

        function redraw() {
            if (emerald_x === 0 && emerald_y === 0) {
                emerald_x = getRandomInt(width - 100);
            }
            drawCanvas();
            emerald_y = emerald_y + 1;
            context.drawImage(emerald_img, emerald_x, emerald_y);
        }



    }


    return (
        <>
            <canvas id="canvas" width={width} height={height} />
        </>
    )
}

export default CanvasBlock