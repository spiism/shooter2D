(function(){
  window.Asteroids = window.Asteroids || {};
  var Asteroids = window.Asteroids;
  var Asteroid = Asteroids.Asteroid = function (settings, game, isSpawn) {
    this.radius = 5;
    settings.radius = this.radius;
    settings.fill = "#FFF";
    this.game = game;
    settings.game = this.game;
    settings.type="enemy";
    this.color = "#ADD8E6";
    settings.idx = -1;
    this.allowMove = false;
    this.remove = false;
    settings.allowMove = this.allowMove;
    settings.remove = this.remove;
    this.vel = Asteroids.Util.randomVec(4);
    settings.vel = this.vel;
    this.settings = settings;
    this.type = "enemy";
    this.rotationDegs = 0;
    Asteroids.MovingObject.call(this,this.settings);
    setTimeout(this.changeSize.bind(this),1000);
    
  };
  var gradients = ["#27C2F4",
  "#00A8FC",
  "#0087FF",
  "#0046FF",
  "#0000FF"];
  Asteroids.Util.inherits(Asteroid, Asteroids.MovingObject);
  Asteroid.prototype.changeSize = function(){
    this.radius += 4;
    if(this.radius < 25){
      setTimeout(this.changeSize.bind(this), 1000);
    }else{
      this.settings.idx = -1;
      setTimeout(this.changeGradient.bind(this), 10);
    }
  }
  // Asteroid.prototype.allow
  Asteroid.prototype.changeGradient = function(){
    this.settings.idx++;
    if(this.settings.idx <= gradients.length - 1){
      this.color = gradients[this.settings.idx];
      // console.log(this.color, this.settings.idx);
      setTimeout(this.changeGradient.bind(this), 800);
    }else{
      setTimeout(this.allow.bind(this), 3000);
    }
  }
  Asteroid.prototype.allow = function(){
    if(this.pos[0] < 400){
      this.vel[0] = 2;
    }else{
      this.vel[0] = -2;
    }
    // if(this.pos[1] < this.game.ship.pos[1]){
    //   this.vel[1] = 1;
    // }else{
    //   this.vel[1] = -1;
    // }
    this.vel[1] = 0;
    this.allowMove = true;
    setTimeout(this.destroy.bind(this),6000);
  }
  Asteroid.prototype.destroy = function(){
    this.remove = true;
    this.game.addAsteroids(1);
  }
  Asteroid.prototype.draw = function (ctx) {
    ctx.save();
    ctx.translate(
      this.pos[0],
      this.pos[1]
    );
    // ctx.globalCompositeOperation = "destination-in";
    ctx.rotate(this.rotationDegs++ * Math.PI/180);
    ctx.beginPath();
    ctx.arc(-(this.radius),-(this.radius),this.radius,0,2* Math.PI,false);
    ctx.fillStyle = this.color;
    ctx.fill();
    this.index = 0;
    ctx.restore();
  };

  Asteroid.prototype.drawOctagonalAsteroids = function (ctx) { // deprecated for performance
    ctx.beginPath();
    var a = ((Math.PI * 2)/this.sides);
    for (var i = 1; i <= this.sides; i++) {
      ctx.lineTo(this.radius * Math.cos(a * i), this.radius * Math.sin(a * i));
    }
    ctx.closePath();
    ctx.clip();

    var img = new Image();
    img.src = "./assets/asteroid-texture.jpg";
    ctx.drawImage(
      img,
      -1/2 * (img.naturalWidth - this.textureX),
      -1/2 * (img.naturalHeight - this.textureX)
    );
    ctx.fillStyle = "rgba(0, 0, 0, 0." + this.darkness + ")";
    ctx.fill();
    ctx.lineWidth = 6;
    ctx.strokeStyle = "black";
    ctx.stroke();
  };

  Asteroid.prototype.collideWith = function (otherObject) {
    if (this.isCollidedWith(otherObject)) {
      this.game.remove(otherObject);
      this.game.remove(this);
      this.game.addExplosion(3, this.pos, this.radius, "asteroid");
      if (otherObject instanceof Asteroids.Ship) {
        this.game.playSound('death');
        this.game.loseLife();
      } else if (otherObject instanceof Asteroids.Bullet) {
        this.game.playSound("destruction");
        this.game.registerPoints();
      }
    }
  };
})();
