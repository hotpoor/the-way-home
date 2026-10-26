// A gesture plays once after a quiet pause, then rests before it can play again.
export class IdleMotion {
  constructor({frameCount,fps}, {delay=4,cooldown=12,exitSeconds=.3,exitRate=1}={}) {
    this.duration=frameCount/fps;this.fps=fps;this.frameCount=frameCount;
    this.delay=delay;this.cooldown=cooldown;this.exitSeconds=Math.min(exitSeconds,this.duration);this.exitRate=exitRate;
    this.stage='waiting';this.elapsed=0;this.wait=delay;
  }
  reset(){this.stage='waiting';this.elapsed=0;this.wait=this.delay;}
  update(dt,wantsMove,paused=false) {
    if(!paused){
      if(wantsMove&&this.stage==='playing'){
        this.stage='exiting';this.elapsed=Math.max(0,this.duration-this.exitSeconds);
      }
      if(this.stage==='waiting'){
        if(wantsMove){this.elapsed=0;this.wait=this.delay;}
        else if((this.elapsed+=dt)>=this.wait){this.stage='playing';this.elapsed=0;}
      }else{
        this.elapsed+=dt*(this.stage==='exiting'?this.exitRate:1);
        if(this.elapsed>=this.duration){this.stage='waiting';this.elapsed=0;this.wait=this.cooldown;}
      }
    }
    return {active:this.stage!=='waiting',allowMove:this.stage!=='exiting',
      frame:Math.min(this.frameCount-1,Math.floor(this.elapsed*this.fps))};
  }
}
