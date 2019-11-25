(function(){
  window.Asteroids = window.Asteroids || {};
  var Asteroids = window.Asteroids;

  var Ship = Asteroids.Ship = function (game) {
    var settings = {
      radius: 15,
      fill: '#F00',
      vel: [1, 0],
      pos: [100, 300],
      game: game
    };
    this.MAX_SPEED = 15;
    this.FIRE_FREQUENCY = 100;
    this.IMPULSE_SCALING = 0.5;
    this.THROTTLE = 0.65;
    this.points = 0;
    this.interval = 0;
    this.type="ship";
    this.visible = true;
    this.tripleFire = false;
    Asteroids.MovingObject.call(this, settings);
  };

  Asteroids.Util.inherits(Ship, Asteroids.MovingObject);


  Ship.prototype.power = function (impulse) {
    if (!this.visible) return;
    var scaled = this.scaleVector(impulse);
    if (Math.abs(this.vel[0]) <= this.MAX_SPEED &&
        Math.abs(this.vel[0] + scaled[0]) <= this.MAX_SPEED) {
      this.vel[0] += scaled[0];
    }
    if (Math.abs(this.vel[1]) <= this.MAX_SPEED &&
        Math.abs(this.vel[1] + scaled[1]) <= this.MAX_SPEED) {
      this.vel[1] += scaled[1];
    }
    this.produceParticles();
  };

  Ship.prototype.produceParticles = function () {
    this.interval++;
    if (this.interval % 1 === 0) {
      this.interval = 0;
      this.game.generateParticle(this.pos.slice(), this.noisyReverseVel());
    }
  };

  Ship.prototype.throttleAllBut = function (vector) {
    if (vector) {
      this.vel[Asteroids.Util.zeroIndex(vector)] *= this.THROTTLE;
    } else {
      this.vel.map(function (velVector) {
        return velVector * 0.4;
      });
    }
  };

  Ship.prototype.powerDiagonal = function (allVectors) {
    this.throttleAllBut(null);
    var that = this;
    allVectors.forEach(function (vec) {
      if (vec) that.power(that.scaleVector(vec));
    });
  };

  Ship.prototype.fireBullet = function () {
    var shipPos = this.pos.slice();
    var bullet = new Asteroids.Bullet(
      shipPos,
      this.bulletVelocity(),
      this.game,
      this.tripleFire
    );
    this.game.add(bullet);
    this.game.playSound("laser");
    if (this.tripleFire) this.fireAngledBullets(shipPos);
  };

  Ship.prototype.fireAngledBullets = function () {
    var straightVel = this.bulletVelocity();
    var x = straightVel[0], y = straightVel[1];
    var rads = 0.26;
    var vel1 = Asteroids.Util.rotate(x, y, rads);
    var vel2 = Asteroids.Util.rotate(x, y, -(rads));

    [vel1, vel2].forEach(function (vel) {
      this.game.add(new Asteroids.Bullet(
        this.pos.slice(),
        vel,
        this.game,
        this.tripleFire
      ));
    }.bind(this));
  };

  Ship.prototype.bulletVelocity = function () {
    if (Asteroids.Util.isZeroVec(this.vel)) {
      return [Math.cos(this.getAngle()) * Asteroids.Bullet.SPEED * -1,
              Math.sin(this.getAngle()) * Asteroids.Bullet.SPEED * -1];
    }

    var velocity = Math.sqrt(this.vel.reduce(function (sum, vec) {
      return sum + vec * vec;
    }, 0));

    return this.vel.map(function (vec) {
      return vec / velocity * Asteroids.Bullet.SPEED;
    });
  };

  Ship.prototype.draw = function (ctx) {
    if (!this.visible) return;

    ctx.save();
    this.drawTriangle(ctx);
    ctx.restore();
  };

  Ship.prototype.drawTriangle = function (ctx) {
    ctx.beginPath();
    ctx.translate(this.pos[0], this.pos[1]);
    ctx.rotate(this.getAngle() + Math.PI);
    ctx.moveTo(this.radius, 0);
    var vertices = [];
    var a = ((Math.PI * 2)/3);
    for (var i = 1; i <= 4; i++) {
      if(i==4){
        ctx.lineTo(vertices[i - 2][0] + this.radius, vertices[i - 2][1]);
        ctx.lineTo(vertices[i - 2][0] - this.radius, vertices[i - 2][1]);
      }else{
        vertices.push([this.radius * Math.cos(a * i), this.radius * Math.sin(a * i)]);
        ctx.lineTo(vertices[i - 1][0], vertices[i - 1][1]);
      }
    }
    ctx.strokeStyle="#ff3333";
    ctx.stroke();
    this.colorTriangle(ctx, vertices);
  };

  Ship.prototype.colorTriangle = function (ctx, vertices) {
    var grd = ctx.createLinearGradient(0, 0, vertices[2][0], vertices[2][1]);
    var startColor = this.tripleFire ? "#0EF" : "#511";
    var endColor = this.tripleFire ? "#9EF" : "#F00";
    grd.addColorStop(0, startColor);
    grd.addColorStop(1, endColor);
    if (!Asteroids.Util.isZeroVec(this.vel)) {
      ctx.shadowColor = "yellow";
      var os = this.radius * 2;
      ctx.shadowOffsetX = -(0.85 * this.vel[0]);
      ctx.shadowOffsetY = -(0.85 * this.vel[1]);
      ctx.shadowBlur = 2;
    }
    ctx.fillStyle = grd;
    ctx.fill();
    ctx.closePath();
    ctx.stroke();
  };

  Ship.prototype.getAngle = function () {
    var angle = Math.atan2(this.vel[1], this.vel[0]) + Math.PI;
    if (Asteroids.Util.isZeroVec(this.vel)) {
      return this.lastAngle || Math.PI / 2;
    } else {
      this.lastAngle = angle;
      return this.lastAngle;
    }
  };

  Ship.prototype.scaleVector = function (vector) {
    return vector.map(function (vel) {
      return vel * this.IMPULSE_SCALING;
    }.bind(this));
  };

  Ship.prototype.noisyReverseVel = function () {
    return Asteroids.Util.reverseVec(this.vel).map(function (vec) {
      return vec + (0.5 - Math.random());
    });
  };
})();
