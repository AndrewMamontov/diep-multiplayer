
import { v4 as uuid } from "uuid";

export function makeInitialWorld(){
  const shapes = [];
  for(let i=0;i<60;i++){
    shapes.push({ id:uuid(), type:["square","triangle","pentagon"][i%3],
      x: 200+Math.random()*900, y:200+Math.random()*500,
      size:20, hp:20, maxHp:20 });
  }
  return { time:Date.now(), players:{}, bullets:[], shapes };
}

export function spawnPlayer(id, world){
  const p = { id, x:640, y:360, rot:0, turret:0,
              hp:100, maxHp:100, score:0,
              input:{}, shootQueue:[] };
  world.players[id] = p; return p;
}
export function respawnPlayer(p, world){
  Object.assign(p,{x:640,y:360,hp:p.maxHp,score:0});
}
export function applyInput(p, inp){ p.input = inp; }

export function stepWorld(w, dt){
  const speed=120;
  for(const p of Object.values(w.players)){
    p.x += ((p.input.d?1:0)-(p.input.a?1:0))*speed*dt;
    p.y += ((p.input.s?1:0)-(p.input.w?1:0))*speed*dt;
    p.turret = p.input.mouseA ?? p.turret;
    while(p.shootQueue.length){
      const ang=p.shootQueue.shift();
      w.bullets.push({id:uuid(),x:p.x,y:p.y,ang, v:320,owner:p.id});
    }
  }
  for(const b of w.bullets){
    b.x += Math.cos(b.ang)*b.v*dt;
    b.y += Math.sin(b.ang)*b.v*dt;
    for(const s of w.shapes){
      if(s.hp>0 && Math.hypot(b.x-s.x,b.y-s.y)<s.size){
        s.hp-=10; b.v=0;
        if(s.hp<=0) w.shapes.splice(w.shapes.indexOf(s),1);
      }
    }
  }
  w.bullets = w.bullets.filter(b=>b.v>0&&b.x>-50&&b.x<1330&&b.y>-50&&b.y<770);
  w.time = Date.now();
}
