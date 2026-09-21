"use client";

import React, { useEffect, useRef } from "react";

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  baseRadius: number;
  color: string;
  pulsePhase: number;
  pulseSpeed: number;
}

interface PulsePacket {
  fromIndex: number;
  toIndex: number;
  progress: number;
  speed: number;
}

interface Token {
  text: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  size: number;
}

const AI_TOKENS = ["λ", "w·x + b", "∑", "0", "1", "f(x)", "∂L/∂w", "A.I.", "TURING", "ReLU", "h_t", "∇f"];

export default function TuringNeuralField() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Mouse coordinates
    const mouse = {
      x: -1000,
      y: -1000,
      radius: 180,
      isHovered: false,
    };

    // Responsive node count
    const nodeCount = Math.min(65, Math.floor((width * height) / 18000));
    const nodes: Node[] = [];
    const colors = [
      "rgba(139, 92, 246, ",  // Brand violet / amethyst
      "rgba(168, 85, 247, ",  // Purple
      "rgba(56, 189, 248, ",  // Cyan
      "rgba(99, 102, 241, ",  // Indigo
    ];

    for (let i = 0; i < nodeCount; i++) {
      const radius = Math.random() * 2.2 + 1.2;
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.45,
        radius,
        baseRadius: radius,
        color: colors[Math.floor(Math.random() * colors.length)],
        pulsePhase: Math.random() * Math.PI * 2,
        pulseSpeed: 0.02 + Math.random() * 0.03,
      });
    }

    // Algorithmic Floating Tokens
    const tokenCount = Math.min(12, Math.floor(width / 110));
    const tokens: Token[] = [];
    for (let i = 0; i < tokenCount; i++) {
      tokens.push({
        text: AI_TOKENS[i % AI_TOKENS.length],
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.18,
        vy: (Math.random() - 0.5) * 0.18,
        alpha: 0.12 + Math.random() * 0.16,
        size: 11 + Math.random() * 5,
      });
    }

    // Synaptic Data Packets
    const packets: PulsePacket[] = [];
    let packetTimer = 0;

    // Synaptic shockwaves from mouse clicks
    const shockwaves: { x: number; y: number; radius: number; maxRadius: number; alpha: number }[] = [];

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      mouse.isHovered = true;
    };

    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
      mouse.isHovered = false;
    };

    const handleClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      shockwaves.push({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        radius: 10,
        maxRadius: 220,
        alpha: 0.6,
      });
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("click", handleClick);

    const maxDistance = 145;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // 1. Draw subtle floating Turing/AI tokens
      tokens.forEach((token) => {
        token.x += token.vx;
        token.y += token.vy;

        if (token.x < -40) token.x = width + 40;
        if (token.x > width + 40) token.x = -40;
        if (token.y < -40) token.y = height + 40;
        if (token.y > height + 40) token.y = -40;

        ctx.font = `${token.size}px monospace`;
        ctx.fillStyle = `rgba(168, 85, 247, ${token.alpha})`;
        ctx.fillText(token.text, token.x, token.y);
      });

      // 2. Draw shockwaves
      for (let i = shockwaves.length - 1; i >= 0; i--) {
        const sw = shockwaves[i];
        sw.radius += 4;
        sw.alpha *= 0.95;

        if (sw.radius > sw.maxRadius || sw.alpha < 0.01) {
          shockwaves.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(56, 189, 248, ${sw.alpha})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // 3. Update & Draw Neural Nodes
      nodes.forEach((node) => {
        node.x += node.vx;
        node.y += node.vy;

        // Bounce off canvas edges
        if (node.x <= 0 || node.x >= width) node.vx *= -1;
        if (node.y <= 0 || node.y >= height) node.vy *= -1;

        // Mouse gravitational attraction
        if (mouse.isHovered) {
          const dx = mouse.x - node.x;
          const dy = mouse.y - node.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < mouse.radius && dist > 1) {
            const force = (mouse.radius - dist) / mouse.radius;
            node.x += (dx / dist) * force * 1.2;
            node.y += (dy / dist) * force * 1.2;
          }
        }

        // Pulse node size
        node.pulsePhase += node.pulseSpeed;
        const pulse = Math.sin(node.pulsePhase) * 0.4;
        node.radius = node.baseRadius + pulse;

        // Draw node core
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = `${node.color}0.85)`;
        ctx.shadowColor = `${node.color}0.8)`;
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // 4. Draw Synapses (Connections between nodes)
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxDistance) {
            const opacity = (1 - dist / maxDistance) * 0.35;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = `rgba(139, 92, 246, ${opacity})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();

            // Randomly spawn a data packet
            if (Math.random() < 0.0004 && packets.length < 8) {
              packets.push({
                fromIndex: i,
                toIndex: j,
                progress: 0,
                speed: 0.015 + Math.random() * 0.02,
              });
            }
          }
        }

        // Interactive synapse connection to mouse cursor
        if (mouse.isHovered) {
          const dx = mouse.x - nodes[i].x;
          const dy = mouse.y - nodes[i].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < mouse.radius) {
            const opacity = (1 - dist / mouse.radius) * 0.6;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.strokeStyle = `rgba(56, 189, 248, ${opacity})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      // 5. Update & Draw Synaptic Packets (Traveling computation pulses)
      for (let i = packets.length - 1; i >= 0; i--) {
        const p = packets[i];
        p.progress += p.speed;

        if (p.progress >= 1) {
          packets.splice(i, 1);
          continue;
        }

        const from = nodes[p.fromIndex];
        const to = nodes[p.toIndex];
        if (!from || !to) {
          packets.splice(i, 1);
          continue;
        }

        const px = from.x + (to.x - from.x) * p.progress;
        const py = from.y + (to.y - from.y) * p.progress;

        ctx.beginPath();
        ctx.arc(px, py, 2.2, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(56, 189, 248, 0.95)";
        ctx.shadowColor = "rgba(56, 189, 248, 1)";
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("click", handleClick);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="absolute inset-0 pointer-events-auto z-10 w-full h-full"
    />
  );
}
