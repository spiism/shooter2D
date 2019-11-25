(function(){
  window.Asteroids = window.Asteroids || {};

  var MovingObject = window.Asteroids.MovingObject = function(settings) {
    this.pos = settings.pos;
    this.vel = settings.vel;
    this.allowMove = settings.allowMove;
    this.radius = settings.radius;
    this.fill = settings.fill;
    this.game = settings.game;
  };

  MovingObject.prototype.isWrappable = true;
  MovingObject.prototype.isOutOfScreen = function(x,y){
    console.log(x,y);
    return Asteroids.Util.between(x, 15, 785) &&
           Asteroids.Util.between(y, 15, 585);
  }
  MovingObject.prototype.move = function () {
    // console.log(this.allowMove, this.type);
    
    if(this.type =="ship" || this.type =="bullet" || (this.type == "enemy" && this.allowMove)){
      // if(!(this.type == "ship" && !this.isOutOfScreen(this.pos[0],this.pos[1]))){
        this.pos[0] += this.vel[0];
        this.pos[1] += this.vel[1];
      
      if(this.remove || this.game.timeout)this.game.remove(this);
      if (this.isWrappable) {
        this.pos = this.game.wrap(this.pos);
        
      } else {
        if (this.game.isOutOfBounds(this.pos)){
          this.game.remove(this);
        } 
      }
    }
    
  };

  MovingObject.prototype.isCollidedWith = function (otherObject){
    var distance = Asteroids.Util.distance(this.pos, otherObject.pos);
    var sumRadii = this.radius + otherObject.radius;
    return distance < sumRadii;
  };

})();
