import React, { useEffect, useRef } from "react";

export default function PawAnimation() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const timers = [];
    let mainRaf;

    function drawPaw(cx, cy, size, angle, opacity) {
      ctx.save();
      ctx.globalAlpha = opacity;
      ctx.translate(cx, cy);
      ctx.rotate(angle);
      const s = size / 100;
      ctx.fillStyle = "#7B1A1A";
      ctx.beginPath();
      ctx.ellipse(0, 10*s, 20*s, 16*s, 0, 0, Math.PI*2);
      ctx.fill();
      [[-18*s,-10*s,-0.35],[-6*s,-20*s,-0.1],[6*s,-20*s,0.1],[18*s,-10*s,0.35]].forEach(function(t){
        ctx.save(); ctx.translate(t[0],t[1]); ctx.rotate(t[2]);
        ctx.beginPath(); ctx.ellipse(0,0,8*s,11*s,0,0,Math.PI*2); ctx.fill(); ctx.restore();
      });
      ctx.strokeStyle="#5A0F0F"; ctx.lineWidth=2*s; ctx.lineCap="round";
      [[-22*s,-20*s,-5*s,-12*s],[-12*s,-30*s,-1*s,-13*s],[0,-32*s,0,-13*s],[12*s,-30*s,1*s,-13*s],[22*s,-20*s,5*s,-12*s]].forEach(function(c){
        ctx.beginPath(); ctx.moveTo(c[0],c[1]); ctx.quadraticCurveTo(c[0]+c[2]*0.4,c[1]+c[3]*0.3,c[0]+c[2],c[1]+c[3]); ctx.stroke();
      });
      ctx.restore();
    }

    function spawnLionTrail() {
      const angle = Math.random() * Math.PI * 2;
      const dx = Math.cos(angle);
      const dy = Math.sin(angle);
      const perpX = -dy;
      const perpY = dx;
      const startX = Math.random() * window.innerWidth;
      const startY = Math.random() * window.innerHeight;
      const stepDist = 65;
      const stepSide = 22;
      const numSteps = Math.ceil(Math.max(window.innerWidth, window.innerHeight) / 65) + 4;
      const paws = [];
      for (let i = 0; i < numSteps; i++) {
        (function(step) {
          const t = setTimeout(function() {
            const side = step % 2 === 0 ? -1 : 1;
            const px = startX + dx * step * stepDist + perpX * side * stepSide;
            const py = startY + dy * step * stepDist + perpY * side * stepSide;
            const pawAngle = angle + Math.PI/2 + side * 0.2;
            paws.push({ x:px, y:py, angle:pawAngle, opacity:0, maxOpacity:0.22, fading:false });
            timers.push(setTimeout(function() {
              paws[paws.length-1] && (paws[step].fading = true);
            }, 2800 + step * 200));
          }, step * 300);
          timers.push(t);
        })(i);
      }
      return paws;
    }

    function createSnake() {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2.8;
      const dx = Math.cos(angle) * speed;
      const dy = Math.sin(angle) * speed;
      let startX, startY;
      if (Math.abs(dx) > Math.abs(dy)) {
        startX = dx > 0 ? -100 : window.innerWidth + 100;
        startY = Math.random() * window.innerHeight;
      } else {
        startX = Math.random() * window.innerWidth;
        startY = dy > 0 ? -100 : window.innerHeight + 100;
      }
      const bodyLen = 100;
      const amplitude = 20;
      const freq = 0.04;
      const body = [];
      for (let i = 0; i < bodyLen; i++) body.push({x:startX, y:startY});
      let headX = startX, headY = startY, frame = 0;
      return {
        done: false,
        update: function() {
          const perpX = -dy/speed, perpY = dx/speed;
          headX += dx; headY += dy; frame++;
          const wave = Math.sin(frame * 0.12) * amplitude;
          for (let i = body.length-1; i > 0; i--) { body[i].x=body[i-1].x; body[i].y=body[i-1].y; }
          body[0].x = headX + perpX * wave;
          body[0].y = headY + perpY * wave;
          if (headX<-200||headX>window.innerWidth+200||headY<-200||headY>window.innerHeight+200) this.done=true;
        },
        draw: function() {
          for (let i = body.length-1; i >= 0; i--) {
            const r = Math.max(1.2, 4.5 - i*0.03);
            const alpha = Math.max(0.03, 0.16 - i*0.001);
            ctx.beginPath(); ctx.arc(body[i].x,body[i].y,r,0,Math.PI*2);
            ctx.fillStyle="rgba(25,80,15,"+alpha+")"; ctx.fill();
          }
          ctx.save(); ctx.translate(body[0].x,body[0].y); ctx.rotate(Math.atan2(dy,dx));
          ctx.beginPath(); ctx.ellipse(0,0,7,5,0,0,Math.PI*2);
          ctx.fillStyle="rgba(20,70,10,0.25)"; ctx.fill();
          ctx.fillStyle="rgba(0,0,0,0.35)";
          ctx.beginPath(); ctx.arc(4,-2.5,1.5,0,Math.PI*2); ctx.fill();
          ctx.beginPath(); ctx.arc(4,2.5,1.5,0,Math.PI*2); ctx.fill();
          if (frame%28<14) {
            ctx.strokeStyle="rgba(160,0,0,0.3)"; ctx.lineWidth=1.2; ctx.lineCap="round";
            ctx.beginPath(); ctx.moveTo(8,0); ctx.lineTo(14,-4); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(8,0); ctx.lineTo(14,4); ctx.stroke();
          }
          ctx.restore();
        }
      };
    }

    const allPaws = [];
    const snakes = [];

    function spawnLions() {
      allPaws.push(spawnLionTrail());
      timers.push(setTimeout(function(){ allPaws.push(spawnLionTrail()); }, 1800));
    }

    snakes.push(createSnake());
    timers.push(setTimeout(function(){ snakes.push(createSnake()); }, 3500));
    spawnLions();

    function rescheduleSnake() {
      timers.push(setTimeout(function(){ snakes.push(createSnake()); rescheduleSnake(); }, Math.random()*10000+8000));
    }
    function rescheduleLions() {
      timers.push(setTimeout(function(){ spawnLions(); rescheduleLions(); }, Math.random()*6000+5000));
    }
    rescheduleSnake();
    rescheduleLions();

    function render() {
      ctx.clearRect(0,0,canvas.width,canvas.height);
      for (let i=snakes.length-1;i>=0;i--) { snakes[i].update(); snakes[i].draw(); if(snakes[i].done) snakes.splice(i,1); }
      for (let g=allPaws.length-1;g>=0;g--) {
        const group = allPaws[g];
        let allGone = true;
        group.forEach(function(p) {
          if (!p.fading && p.opacity < p.maxOpacity) p.opacity = Math.min(p.maxOpacity, p.opacity+0.04);
          if (p.fading) p.opacity -= 0.005;
          if (p.opacity > 0) { allGone=false; drawPaw(p.x,p.y,50,p.angle,p.opacity); }
        });
        if (allGone && group.every(function(p){ return p.opacity<=0; })) allPaws.splice(g,1);
      }
      mainRaf = requestAnimationFrame(render);
    }
    mainRaf = requestAnimationFrame(render);

    window.addEventListener("resize", function(){ canvas.width=window.innerWidth; canvas.height=window.innerHeight; });
    return function(){ cancelAnimationFrame(mainRaf); timers.forEach(function(t){ clearTimeout(t); }); };
  }, []);

  return React.createElement("canvas", { ref:canvasRef, style:{position:"fixed",inset:0,pointerEvents:"none",zIndex:9997,width:"100vw",height:"100vh"} });
}
