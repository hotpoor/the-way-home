// Gestures settle first, play once, and rest for independently varied intervals.
export class IdleMotion {
  constructor(clips, {delay=4,cooldown=12,exitSeconds=.3,exitRate=1,jitter=0,random=Math.random,gate=null}={}) {
    this.clips=Array.isArray(clips)?clips:[clips];this.index=-1;
    Object.assign(this,{delay,cooldown,exitRate,jitter,random,gate});this.requestedExit=exitSeconds;
    this.select(0);this.reset();
  }
  select(index){this.index=index;const {frameCount,fps}=this.clips[index];Object.assign(this,{frameCount,fps,duration:frameCount/fps});this.exitSeconds=Math.min(this.requestedExit,this.duration);}
  interval(base){return base+this.random()*this.jitter;}
  reset(){this.stage='waiting';this.elapsed=0;this.wait=this.interval(this.delay);}
  update(dt,wantsMove,paused=false) {
    if(!paused){
      if(wantsMove&&this.stage==='playing'){this.stage='exiting';this.elapsed=Math.max(0,this.duration-this.exitSeconds);}
      if(this.stage==='waiting'){
        if(wantsMove){this.elapsed=0;}
        else if((this.elapsed+=dt)>=this.wait&&(!this.gate||this.gate())){
          const count=this.clips.length;
          this.select(count>1?(this.index+1+Math.floor(this.random()*(count-1)))%count:0);
          this.stage='playing';this.elapsed=0;
        }
      }else{
        this.elapsed+=dt*(this.stage==='exiting'?this.exitRate:1);
        if(this.elapsed>=this.duration){this.stage='waiting';this.elapsed=0;this.wait=this.interval(this.cooldown);}
      }
    }
    return {active:this.stage!=='waiting',allowMove:this.stage!=='exiting',clip:this.index,
      frame:Math.min(this.frameCount-1,Math.floor(this.elapsed*this.fps))};
  }
}
