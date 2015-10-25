/**
 * Methods for drawing all the sprites onto the HTML5 canvas.
 * @author Kenneth Li (kennethli.3470@gmail.com)
 */

/**
 * Creates a Drawing object.
 * @param {CanvasRenderingContext2D} context The context this object will
 *   draw to.
 * @constructor
 */
function Drawing(context) {
  this.context = context;
  this.ui = document.createElement('div');
};

Drawing.FONT = '14px Helvetica';
Drawing.FONT_COLOR = 'black';

Drawing.HP_COLOR = 'green';
Drawing.HP_MISSING_COLOR = 'red';

Drawing.BASE_IMG_URL = '/static/img/';
Drawing.SELF_PLAYER_SRC = Drawing.BASE_IMG_URL + 'self_player.png';
Drawing.OTHER_PLAYER_SRC = Drawing.BASE_IMG_URL + 'other_player.png';
Drawing.PROJECTILE_SRC = Drawing.BASE_IMG_URL + 'projectile.png';
Drawing.PRAESIDIUM_SRC = Drawing.BASE_IMG_URL + 'praesidium.png';
Drawing.NEUTRAL_TURRET_SRC = Drawing.BASE_IMG_URL + 'neutral_turret.png';
Drawing.SELF_TURRET_SRC = Drawing.BASE_IMG_URL + 'self_turret.png';
Drawing.OTHER_TURRET_SRC = Drawing.BASE_IMG_URL + 'other_turret.png';
Drawing.WALL_SRC = Drawing.BASE_IMG_URL + 'wall.png';
Drawing.TILE_SRC = Drawing.BASE_IMG_URL + 'tile.png';
Drawing.CANCEL_SRC = Drawing.BASE_IMG_URL + 'cancel.png';

Drawing.PLAYER_SIZE = [64, 64];
Drawing.PROJECTILE_SIZE = [8, 8];
Drawing.PRAESIDIUM_SIZE = [32, 32];
Drawing.CONSTRUCT_SIZE = [64, 64];
Drawing.TILE_SIZE = 100;

Drawing.NEUTRAL_CONSTRUCT_SRC = [Drawing.NEUTRAL_TURRET_SRC, '', '',
                                 Drawing.WALL_SRC, '', ''];
Drawing.NEUTRAL_CONSTRUCT_IMG = [new Image(), new Image(), new Image(),
                                 new Image(), new Image(), new Image()];

Drawing.SELF_CONSTRUCT_SRC = [Drawing.SELF_TURRET_SRC, '', '',
                              Drawing.WALL_SRC, '', ''];
Drawing.SELF_CONSTRUCT_IMG = [new Image(), new Image(), new Image(),
                              new Image(), new Image(), new Image()];

Drawing.OTHER_CONSTRUCT_SRC = [Drawing.OTHER_TURRET_SRC, '', '',
                               Drawing.WALL_SRC, '', ''];
Drawing.OTHER_CONSTRUCT_IMG = [new Image(), new Image(), new Image(),
                               new Image(), new Image(), new Image()];
  
Drawing.prototype.init = function(startBuild, cancelBuild) {
  this.ui.setAttribute('id', 'ui');

  for (var i = 0; i < 6; ++i) {
    var buildOption = document.createElement('div');
    buildOption.setAttribute('class', 'ui-build-option');
    buildOption.style.backgroundImage = 'url(' + Drawing.SELF_CONSTRUCT_SRC[i] + ')';
    (function(j) {
      buildOption.onclick = function(e) {
        startBuild(j);
        e.stopPropagation();
      }
    }(i));
    this.ui.appendChild(buildOption);
  }

  this.ui.onclick = function() {
    cancelBuild();
  };
  
  document.getElementById('game-container').appendChild(this.ui);

  for (var i = 0; i < Drawing.NEUTRAL_CONSTRUCT_IMG.length; ++i) {
    Drawing.NEUTRAL_CONSTRUCT_IMG[i].src = Drawing.NEUTRAL_CONSTRUCT_SRC[i];
    Drawing.SELF_CONSTRUCT_IMG[i].src = Drawing.SELF_CONSTRUCT_SRC[i];
    Drawing.OTHER_CONSTRUCT_IMG[i].src = Drawing.OTHER_CONSTRUCT_SRC[i];
  }
}

Drawing.prototype.drawPlayer = function(isSelf, coords, orientation, name) {
  this.context.save();
  this.context.translate(coords[0], coords[1]);
  this.context.rotate(orientation);
  var player = new Image();
  if (isSelf) {
    player.src = Drawing.SELF_PLAYER_SRC;
  } else {
    player.src = Drawing.OTHER_PLAYER_SRC;
  }
  this.context.drawImage(player,
                         -Drawing.PLAYER_SIZE[0] / 2,
                         -Drawing.PLAYER_SIZE[1] / 2,
                         Drawing.PLAYER_SIZE[0],
                         Drawing.PLAYER_SIZE[1]);
  this.context.restore();
};

Drawing.prototype.drawProjectile = function(coords, orientation) {
  this.context.save();
  this.context.translate(coords[0], coords[1]);
  this.context.rotate(orientation);
  var projectile = new Image();
  projectile.src = Drawing.PROJECTILE_SRC;
  this.context.drawImage(projectile,
                         -Drawing.PROJECTILE_SIZE[0] / 2,
                         -Drawing.PROJECTILE_SIZE[1] / 2,
                         Drawing.PROJECTILE_SIZE[0],
                         Drawing.PROJECTILE_SIZE[1]);
  this.context.restore();
};

Drawing.prototype.drawPraesidium = function(coords, quantity) {
  this.context.save();
  this.context.translate(coords[0], coords[1]);
  var praesidium = new Image();
  praesidium.src = Drawing.PRAESIDIUM_SRC;
  this.context.drawImage(praesidium,
                         -Drawing.PRAESIDIUM_SIZE[0] / 2,
                         -Drawing.PRAESIDIUM_SIZE[1] / 2,
                         Drawing.PRAESIDIUM_SIZE[0],
                         Drawing.PRAESIDIUM_SIZE[1]);
  this.context.restore();
};

Drawing.prototype.drawConstruct = function(owner, coords, orientation, health, type) {
  this.context.save();
  this.context.translate(coords[0], coords[1]);
  this.context.rotate(orientation);
  if (owner == 'self') {
    var construct = Drawing.SELF_CONSTRUCT_IMG[type];
  } else if (owner == 'other') {
    var construct = Drawing.OTHER_CONSTRUCT_IMG[type];
  } else {
    var construct = Drawing.NEUTRAL_CONSTRUCT_IMG[type];
  }
  this.context.drawImage(construct,
                         -Drawing.CONSTRUCT_SIZE[0] / 2,
                         -Drawing.CONSTRUCT_SIZE[1] / 2,
                         Drawing.CONSTRUCT_SIZE[0],
                         Drawing.CONSTRUCT_SIZE[1]);
  this.context.restore();

  this.context.save();
  this.context.translate(coords[0], coords[1]);
  if (owner != 'neutral') {
    var healthBarInterval = 96 / Constants.CONSTRUCT_MAX_HEALTH[type];
    for (var i = 0; i < Constants.CONSTRUCT_MAX_HEALTH[type]; ++i) {
      if (i < health) {
        this.context.fillStyle = Drawing.HP_COLOR;
      } else {
        this.context.fillStyle = Drawing.HP_MISSING_COLOR;
      }
      this.context.fillRect(-48 + healthBarInterval * i, -48,
                            healthBarInterval, 8);
    }
  }
  this.context.restore();
}

Drawing.prototype.drawRange = function(coords, radius, color) {
  this.context.fillStyle = color;
  this.context.globalAlpha = 0.3;
  this.context.beginPath();
  this.context.arc(coords[0], coords[1], radius, 0, 2 * Math.PI);
  this.context.closePath();
  this.context.fill();
  this.context.globalAlpha = 1;
}

Drawing.prototype.drawUI = function(health, praesidia) {  
  this.context.fillStyle = '#AAAAAA';
  this.context.fillRect(0, 0, 200, 50);
  this.context.font = Drawing.FONT;
  this.context.fillStyle = Drawing.FONT_COLOR;
  this.context.fillText("Health: ", 10, 20);
  this.context.fillText("Praesidia: " + praesidia, 10, 40);
  for (var i = 0; i < 10; ++i) {
    if (i < health) {
      this.context.fillStyle = Drawing.HP_COLOR;
    } else {
      this.context.fillStyle = Drawing.HP_MISSING_COLOR;
    }
    this.context.fillRect(70 + 10 * i, 10, 10, 10)
  }
};

/**
 * Draws the background tiles.
 * @param {[number, number]} topLeft The coordinates of the top-leftmost
 *   point to start laying down the tiles from.
 * @param {[number, number]} bottomRight The coordinates of the
 *   bottom-rightmost point to stop laying the tiles down at.
 */

Drawing.prototype.drawTiles = function(topLeft, bottomRight) {
  this.context.save();
  var tile = new Image();
  tile.src = Drawing.TILE_SRC;
  for (var x = topLeft[0]; x < bottomRight[0]; x += Drawing.TILE_SIZE) {
    for (var y = topLeft[1]; y < bottomRight[1]; y += Drawing.TILE_SIZE) {
      this.context.drawImage(tile, x, y);
    }
  }
  this.context.restore();
}
