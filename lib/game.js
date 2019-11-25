(function(){
  window.Asteroids = window.Asteroids || {};
  var copycount = 300;
  var Game = window.Asteroids.Game = function () {
    this.asteroids = [];
    this.bullets = [];
    this.movingParticles = [];
    this.staticParticles = [];
    this.items = [];
    this.ship = new window.Asteroids.Ship(this);
    this.points = 0;
    this.count = copycount;
    this.isPause = false;
    this.timeout = false;
    // this.seconds = 0;
    this.initMedia();
  };

  Game.DIM_X = 800;
  Game.DIM_Y = 600;

  Game.prototype.initialize = function () {
    var startingAsteroids = 5;
    this.addAsteroids(startingAsteroids);
    this.backgroundShift = 0;
    this.moveLeft = false;
    this.points = 0;
    this.lives = 1;
    this.isPause = false;
    this.timeout = false;
    // this.count = 10;
    copycount = this.count;
    this.difficulty = 0;
    setInterval(this.countDown.bind(this), 1000);
  };

  Game.prototype.initMedia = function () {
    this.backgroundImage = new Image();
    this.backgroundImage.src = "./assets/stars.jpg";
    this.clockImage = new Image();
    this.clockImage.src = "./assets/ship.png";
  };

  Game.prototype.setSound = function (sounds) {
    this.sounds = sounds;
    if (this.sounds.on) this.sounds.buildSoundPool();
  };

  Game.prototype.playSound = function (sound) {
    if (this.sounds.on) this.sounds.playSound(sound);
  };

  Game.prototype.addAsteroids = function (num) {
    for (var i = 0; i < num; i++) {
      var ast = new window.Asteroids.Asteroid({
        pos: this.fairStartingPosition("asteroid")
      }, this);
      this.asteroids.push(ast);
      ast.move(); // prevents immediate wrap-arounds
    }
    
    
    if(this.difficulty < 3)this.difficulty += 0.5;
  };

  Game.prototype.step = function() {
    this.moveObjects();
    this.checkCollisions();
  };

  Game.prototype.moveObjects = function() {
    this.allObjects().forEach(function (obj) {
      obj.move();
    });
  };

  Game.prototype.checkCollisions = function () {
    var nonAsteroids = this.allCollidable();
    this.asteroids.forEach(function (ast) {
      for (var j = 0; j < nonAsteroids.length; j++) {
        if (ast.isCollidedWith(nonAsteroids[j]) ) {
          ast.collideWith(nonAsteroids[j]);
        }
      }
    });

    var ship = this.ship;
    this.items.forEach(function (item) {
      if (ship.isCollidedWith(item) && ship.visible) item.registerTouch(ship);
    });
  };

  Game.prototype.add = function (obj) {
    this.myCollection(obj).push(obj);
  };

  Game.prototype.remove = function (obj) {
    var collection = this.myCollection(obj);
    collection.splice(collection.indexOf(obj), 1);
  };

  Game.prototype.allCollidable = function() {
    return this.bullets.concat(this.ship);
  };

  Game.prototype.allObjects = function () {
    return this.movingParticles
      .concat(this.staticParticles)
      .concat(this.items)
      .concat(this.asteroids)
      .concat(this.allCollidable());
  };

  Game.prototype.draw = function (ctx) {
    ctx.clearRect(0, 0, Game.DIM_X, Game.DIM_Y);
    this.drawBackground(ctx);

    this.allObjects().forEach(function (obj) {
      obj.draw(ctx);
    });

    this.drawText(ctx);
    this.drawLives(ctx);
  };

  Game.prototype.drawBackground = function (ctx) {
    this.shiftBackground();
    ctx.drawImage(this.backgroundImage, this.backgroundShift, 0, 1000, 1000);
  };

  Game.prototype.drawText = function (ctx) {
    ctx.save();
    ctx.font = "36px VT323";
    ctx.fillStyle = "yellow";
    ctx.shadowColor = "#f90";
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    ctx.shadowBlur = 3;
    ctx.fillText("Your Score: " + this.points, 25, 40);
    ctx.fillText(":" + this.count, Game.DIM_X - 100, 36);
    ctx.restore();
  };

  Game.prototype.drawLives = function (ctx) {
    ctx.drawImage(this.clockImage, Game.DIM_X - 135, 5, 40, 40);
  };

  Game.prototype.wrap = function (pos) {
    return pos.map(function (el, i) {
      var dim = i === 0 ? Game.DIM_X : Game.DIM_Y;
      if (el > dim) {
        // console.log(1);
        return el - dim;
      } else if (el < 0) {
        // console.log(2);
        return el + dim;
      }
      // console.log(2);
      return el;
    }.bind(this));
  };

  Game.prototype.isOutOfBounds = function (pos) {
    return !Asteroids.Util.between(pos[0], 0, Game.DIM_X) ||
           !Asteroids.Util.between(pos[1], 0, Game.DIM_Y);
  };
  Game.prototype.shiftBackground = function () {
    if (this.backgroundShift <= -200) this.moveLeft = true;
    if (this.backgroundShift >= 0) this.moveLeft = false;

    if (this.moveLeft) {
      this.backgroundShift += 0.35;
    } else {
      this.backgroundShift -= 0.15;
    }
  };

  Game.prototype.generateParticle = function (pos, vel) {
    var particle = Asteroids.Particle.generateParticle(pos, vel, this);
    this.add(particle);
  };

  Game.prototype.addExplosion = function (num, pos, radius, type) {
    for (var i = 0; i < num; i++) {
      var particle;
      if (type === "asteroid") {
        particle = Asteroids.Particle.asteroidExplosion(pos, radius, this);
      } else if (type === "ship") {
        particle = Asteroids.Particle.shipExplosion(pos, this);
      }
      this.add(particle);
    }
  };
  Game.prototype.countDown = function(){
    // alert(1);
    if(!this.isPause){
      this.count--;
      if(this.count == 0){
        this.timeout = true;
        this.isPause = true;
      }
    }
  }

  Game.prototype.setParticleExpiration = function (particle) {
    setTimeout(function () {
      this.movingParticles.splice(this.movingParticles.indexOf(particle));
    }.bind(this), 3000);
    window.PARTICLES = this.movingParticles;
  };

  Game.prototype.randomPosition = function () {
    // console.log(111);
    var tmp = 1;
    // this.vel = [1,0];
    var x1 = Math.floor(Math.random() * 2);
    if(x1 == 1){
      tmp = -1;
      // this.vel = [-1,0];
    }
    // var x =  (this.ship.pos[0] + tmp * (Math.floor(Math.random() * 70) + 20));
    var x =  (Game.DIM_X/2 + tmp * (Math.floor(Math.random() * 200) + 50));
    var y = (Game.DIM_Y/2 + tmp * (Math.floor(Math.random() * 300)));
    return [x, y];
  };

  Game.prototype.registerPoints = function() {
    if (this.asteroids.length < 3) this.addAsteroids(this.difficulty);
    this.points += 1;
  };

  Game.prototype.fairStartingPosition = function (type) {
    var pos = this.randomPosition();
    var fairnessFn;
    if (type === "ship") {
      fairnessFn = this.fairShipPosition.bind(this);
    } else if (type === "asteroid") {
      fairnessFn = this.fairAsteroidPosition.bind(this);
    }

    while (!fairnessFn(pos)) pos = this.randomPosition();
    return pos;
  };

  Game.prototype.fairEdge = function () {
    var pos = this.randomEdge();
    while (!this.fairAsteroidPosition) pos = this.randomEdge();
    return pos;
  };

  Game.prototype.randomEdge = function () {
    var edge = Math.ceil(4 * Math.random());
    var pos;
    switch (edge) {
      case 1:
      pos = [0, Math.random() * Game.DIM_Y];
      break;
      case 2:
      pos = [Game.DIM_X, Math.random() * Game.DIM_Y];
      break;
      case 3:
      pos = [Math.random() * Game.DIM_X, 0];
      break;
      case 4:
      pos = [Math.random() * Game.DIM_X, Game.DIM_Y];
      break;
    }
    return pos;
  };

  Game.prototype.fairShipPosition = function (pos) {
    for (var i = 0; i < this.asteroids.length; i++) {
      var dist = Asteroids.Util.distance(pos, this.asteroids[i].pos);
      if (dist < 150) return false;
    }
    return true;
  };

  Game.prototype.fairAsteroidPosition = function (pos) {
    return Asteroids.Util.distance(pos, this.ship.pos) > 150;
  };

  Game.prototype.loseLife = function () {
    if(this.points > 0 && this.lives > 0){
      this.points--;
    }
    if(this.points === 0){
    this.lives--;
    this.addExplosion(8, this.ship.pos, this.ship.radius, "ship");
    this.playSound("death");
    this.ship.visible = false;
    this.isPause = true;
    }
  };

  Game.prototype.myCollection = function (obj) {
    var a;
    if (obj instanceof window.Asteroids.Bullet) {
      a = this.bullets;
    } else if (obj instanceof window.Asteroids.Asteroid) {
      a = this.asteroids;
    } else if (obj instanceof window.Asteroids.Particle && obj.moving) {
      a = this.staticParticles;
    } else {
      a = this.movingParticles;
    }
    return a;
  };
})();
