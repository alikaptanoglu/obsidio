/**
 * Stores the state of a bullet on the server.
 * @author Alvin Lin (alvin.lin.dev@gmail.com)
 */

var Entity = require('./Entity');

var Constants = require('../shared/Constants');
var Util = require('../shared/Util');

/**
 * Constructor for a bullet.
 * @constructor
 * @param {number} x The x coordinate of this bullet.
 * @param {number} y The y coordinate of this bullet.
 * @param {number} vx The velocity in the x direction of this bullet.
 * @param {number} vy The velocity in the y direction of this bullet.
 * @param {number} orientation The orientation of this bullet in radians.
 * @param {number} hitboxSize The size of this bullet's hitbox. This number
 *   is a circular radius in pixels.
 * @param {string} source The socket ID of the player that fired this
 *   bullet.
 * @param {number} damage The amount of damage this bullet will do upon
 *   impact.
 * @extends Entity
 */
function Bullet(x, y, vx, vy, orientation, hitboxSize, source, damage) {
  this.x = x;
  this.y = y;
  this.vx = vx;
  this.vy = vy;
  this.orientation = orientation;

  this.hitboxSize = hitboxSize;
  this.source = source;
  this.damage = damage;

  this.distanceTraveled = 0;
  this.shouldExist = true;
}
require('./inheritable');
Bullet.inheritsFrom(Entity);

/**
 * VELOCITY_MAGNITUDE is in pixels per millisecond.
 * DEFAULT_DAMAGE is in health points.
 * MAX_TRAVEL_DISTANCE is in pixels.
 * HITBOX_SIZE is in pixels and represents a radius around the bullet entity.
 */
Bullet.VELOCITY_MAGNITUDE = 0.85;
Bullet.DEFAULT_DAMAGE = 1;
Bullet.MAX_TRAVEL_DISTANCE = 1000;
Bullet.DEFAULT_HITBOX_SIZE = 4;

/**
 * Factory method for the Bullet object. This is meant to be called from the
 * context of a Player.
 * @param {number} x The starting x-coordinate of the bullet (absolute).
 * @param {number} y The starting y-coordinate of the bullet (absolute).
 * @param {number} direction The direction the bullet will travel in
 *   radians.
 * @param {string} source The socket ID of the player that fired the
 *   bullet.
 */
Bullet.create = function(x, y, direction, source) {
  var vx = Bullet.VELOCITY_MAGNITUDE * Math.cos(direction - Math.PI / 2);
  var vy = Bullet.VELOCITY_MAGNITUDE * Math.sin(direction - Math.PI / 2);
  var hitboxSize = Bullet.DEFAULT_HITBOX_SIZE;
  var damage = Bullet.DEFAULT_DAMAGE;
  return new Bullet(x, y, vx, vy, direction, hitboxSize, source, damage);
};

/**
 * Updates this bullet and checks for collision with any player.
 * We reverse the coordinate system and apply sin(direction) to x because
 * canvas in HTML will use up as its '0' reference point while JS math uses
 * left as its '0' reference point.
 * this.direction always is stored in radians.
 * @param {Hashmap} clients The Hashmap of active IDs and players stored on
 *   the server.
 * @param {Array.<Construct>} An array of the currently existing constructs.
 */
Bullet.prototype.update = function(clients, constructs) {
  this.parent.update.call(this);

  this.distanceTraveled += Bullet.VELOCITY_MAGNITUDE *
      this.updateTimeDifference;
  if (this.distanceTraveled > Bullet.MAX_TRAVEL_DISTANCE ||
      !Util.inWorld(this.x, this.y)) {
    this.shouldExist = false;
    return;
  }

  var players = clients.values();
  for (var i = 0; i < players.length; ++i) {
    if (this.source != players[i].id &&
        players[i].isCollidedWith(this)) {
      players[i].damage(this.damage);
      if (players[i].isDead()) {
        var killingPlayer = clients.get(this.source);
        killingPlayer.kills++;
      }
      this.shouldExist = false;
      return;
    }
  }

  for (var i = 0; i < constructs.length; ++i) {
    if ((this.source != constructs[i].owner ||
         constructs[i].type == Constants.CONSTRUCT_TYPES.WALL) &&
        constructs[i].isCollidedWith(this)) {
      constructs[i].damage(this.damage);
      this.shouldExist = false;
      return;
    }
  }
};

module.exports = Bullet;
