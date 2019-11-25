(function(){
  window.Asteroids = window.Asteroids || {};

  var Splash = window.Asteroids.Splash = function (ctx) {
    this.ctx = ctx;
    this.timePlay = 5 * 60;
    this.foreground = new Image();
    this.foreground.src = "./assets/splash-transparent.png";
    this.stepCount = 0;
    this.stars = [];
    while (this.stars.length < Splash.MAX_STARS) this.addNewStar();
  };

  Splash.MAX_STARS = 25;
  Splash.SPEED = 3;

  Splash.COLORS = [
    "red",
    "rebeccapurple",
    "bisque",
    "white",
    "greenyellow",
    "lawngreen",
    "gold"
  ];

  Splash.prototype.loop = function (ctx) {
    this.frameId = requestAnimationFrame(Splash.prototype.loop.bind(this));
    this.step();
    this.draw();
  };

  Splash.prototype.step = function () {
    this.stepCount++;
    if (this.stars.length < Splash.MAX_STARS &&
        this.stepCount % Splash.SPEED === 0) {
      this.addNewStar(1);
    }
  };

  Splash.prototype.addNewStar = function (y) {
    y = y || Math.ceil(Asteroids.Game.DIM_Y * Math.random());
    var randX = Math.ceil(Asteroids.Game.DIM_X * Math.random());
    var randColor = Splash.COLORS[Math.floor(Math.random() * Splash.COLORS.length)];
    var newStar = new Asteroids.Star(randX, y, randColor, this.stepCount);
    this.stars.push(newStar);
  };

  Splash.prototype.draw = function () {
    var ctx = this.ctx;
    var x = Asteroids.Game.DIM_X, y = Asteroids.Game.DIM_Y;
    ctx.save();
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, x, y);
    this.drawStars();
    ctx.restore();
    ctx.drawImage(this.foreground, 0, 0, x, y);
    ctx.save();
    ctx.font = "70px VT323";
    ctx.fillStyle = "gray";
    ctx.shadowColor = "#fff";
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    ctx.shadowBlur = 3;
    ctx.fillText(this.timePlay/60, 468, 570);
    ctx.restore();
  };

  Splash.prototype.drawStars = function () {
    this.stars.forEach(function (star) {
      if (this.stepCount % Splash.SPEED === 0) {
        star.y += 2;
      }
      this.ctx.fillStyle = star.color;
      this.ctx.fillRect(star.x, star.y, 4, 2);
    }.bind(this));

    this.stars = this.stars.filter(function (star) {
      return star.y < Asteroids.Game.DIM_Y;
    });
  };

  Splash.prototype.end = function () {
    cancelAnimationFrame(this.frameId);
  };
})();
