import React, { useEffect, useRef, useState } from "react";
import "./App.css";

interface Point {
  x: number;
  y: number;
}

const generateRandomPoints = (count: number): Point[] => {
  const randomPoints: Point[] = [];
  for (let i = 0; i < count; i++) {
    const randomX = Math.random() * count; // Phạm vi từ 0 đến 800 cho tọa độ x
    const randomY = Math.random() * (count - 200); // Phạm vi từ 0 đến 600 cho tọa độ y
    randomPoints.push({ x: randomX, y: randomY });
  }
  return randomPoints;
};

const App: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [pointsState, setPointsState] = useState<Point[]>(
    generateRandomPoints(10000)
  );
  const [hoveredPoint, setHoveredPoint] = useState<Point | null>(null);
  const [scale, setScale] = useState<number>(1);
  const [panning, setPanning] = useState<boolean>(false);
  const [lastX, setLastX] = useState<number>(0);
  const [lastY, setLastY] = useState<number>(0);
  const [translateX, setTranslateX] = useState<number>(0);
  const [translateY, setTranslateY] = useState<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");

    if (ctx && canvas) {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw points
      pointsState.forEach((point) => {
        const scaledX = point.x * scale + translateX;
        const scaledY = point.y * scale + translateY;
        const radius = 5;

        ctx.beginPath();
        ctx.arc(scaledX, scaledY, radius, 0, Math.PI * 2);
        ctx.fillStyle = hoveredPoint === point ? "red" : "green";
        ctx.fill();
      });
    }
  }, [hoveredPoint, scale, translateX, translateY]);

  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = (event.clientX - rect.left) / scale;
    const mouseY = (event.clientY - rect.top) / scale;

    let closestPoint = null;
    let minDistance = Number.MAX_SAFE_INTEGER;

    pointsState.forEach((point) => {
      const distance = Math.sqrt(
        Math.pow(point.x - mouseX, 2) + Math.pow(point.y - mouseY, 2)
      );
      if (distance < minDistance) {
        minDistance = distance;
        closestPoint = point;
      }
    });

    setHoveredPoint(closestPoint);

    if (panning) {
      const deltaX = (event.clientX - lastX) / scale;
      const deltaY = (event.clientY - lastY) / scale;
      setTranslateX((prevTranslateX) => prevTranslateX + deltaX);
      setTranslateY((prevTranslateY) => prevTranslateY + deltaY);
      setLastX(event.clientX);
      setLastY(event.clientY);
    }
  };

  const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    setPanning(true);
    setLastX(event.clientX);
    setLastY(event.clientY);
  };

  const handleMouseUp = () => {
    setPanning(false);
  };

  const handleWheel = (event: React.WheelEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;

    const deltaY = event.deltaY;
    const newScale = deltaY > 0 ? scale * 0.9 : scale * 1.1;
    setScale(Math.max(0.1, Math.min(newScale, 10)));
  };

  return (
    <canvas
      ref={canvasRef}
      width={800}
      height={600}
      style={{ border: "2px solid #000" }}
      onMouseMove={handleMouseMove}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onWheel={handleWheel}
    />
  );
};

export default App;
