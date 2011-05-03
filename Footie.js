/* Sprites
 *
 * Construct a sprite with the tile coords.
 * */
var Sprite = function(posx, posy, width, height, offx, offy) {
    this.posx = posx;
    this.posy = posy;
    this.width = width;
    this.height = height;
    this.offx = offx || width/2;
    this.offy = offy || height/2;
};
Sprite.ctx = null;
Sprite.image = null;
/* Draw a sprite at x,y coords, timedelta for animated sprites.
 */
Sprite.prototype = {
    draw: function(x, y, time) {
        Sprite.ctx.drawImage(Sprite.image,
            this.posx, this.posy, this.width, this.height,
            x-this.offx, y-this.offy,
            this.width, this.height);
    }
};

function repeatN(n,x) {
    var a = [];
    for(var i=0; i<n; i++) a.push(x);
    return a;
}

function loadNSprites(n, x, y, w, h, ox, oy) {
    var sprites = [];
    if (!(ox && ox.length)) ox = repeatN(n, ox);
    if (!(oy && oy.length)) oy = repeatN(n, oy);

    for (var i=0; i<n; i++) {
        sprites.push(new Sprite(x, y + h*i, w, h, ox[i], oy[i]));
    }
    return sprites;
}


var AngledSprite = function(spritelist) {
    this.spritelist = spritelist;
    this.current = spritelist[spritelist.length -1];
}
AngledSprite._map = {0:6, 1:4, 2:3, 3:5, 4:7, 5:2, 6:0, 7:1, 8:6};
AngledSprite.getOrientation = function(v, o) {
        if (typeof(o) != 'undefined') return o;

        var i = Math.floor( (v.toRad() + 22.5) / 45);
        return AngledSprite._map[i];
}

AngledSprite.prototype = {
    draw: function(x, y, time) {
        this.current.draw(x, y, time);
    },
    setAngle: function(v, o) {
        this.orientation = AngledSprite.getOrientation(v, o);
        this.current = this.spritelist[this.orientation];
    }
};


var AngledAnimation = function(framelist, timelist) {
    this.frames = framelist;
    this.times = timelist;
    this._frame = 0;
    this._frameTime = 0;

}

AngledAnimation.prototype = {
    setAngle: function(v, o) {
        this.orientation = AngledSprite.getOrientation(v, o);
    },
    draw: function(x,y, time) {
        this._frameTime -= time;
        if (this._frameTime <= 0) {
            if (++this._frame == this.frames.length) this._frame = 0;
            this._frameTime = this.times[this._frame];
        }
        this.frames[this._frame][this.orientation].draw(x,y, time);

    }
}








var SPRITEMAP = {}
SPRITEMAP.ball = new Sprite(605, 52, 11, 11);
var PLAYERSPRITES = {}
PLAYERSPRITES.standing = loadNSprites(8,143+ 24, 89, 24, 40, null, 38);
PLAYERSPRITES.step1 = loadNSprites(8,   143+ 0, 89, 24, 40, null, 38);
PLAYERSPRITES.step2 = loadNSprites(8,   143+ 48, 89, 24, 40, null, 38);
PLAYERSPRITES.happy = loadNSprites(8,   143+ 72, 89, 24, 40, null, 38);

var RenderObject = function() {
    this.pos = new V2d(0,0);
    this.vel = new V2d(0,0);
};

RenderObject.prototype = {
    render: function(time) {
        this.pos.add(V2d.mul(this.vel, time));
        this.sprite.draw(this.pos.x, this.pos.y, time);
    }
}



var Cursor = function(target) {
    this.target = target;
    //this.point = new Sprite(585, 61, 13, 13, null, 11);
    this.dir = new V2d(1,0);
};

Cursor.prototype = {
    render: function(time) {
        var point = V2d.add(this.target.pos, this.dir);
        var ctx = Sprite.ctx;
        ctx.beginPath();
        ctx.arc(point.x, point.y, 4, 0, Math.PI*2, true);
        ctx.closePath();
        ctx.fill();
        //this.point.draw(point.x, point.y, time);
    },
    setDirection: function(to) {
        this.dir = new V2d.sub(to, this.target.pos).normalize().mul(50);
        return this.dir;
    }
}


var Player = function() {
    this.a_walk = new AngledAnimation([
                PLAYERSPRITES.standing,
                PLAYERSPRITES.step1,
                PLAYERSPRITES.step2],
                [0.2,0.2,0.2]);
    this.a_run= new AngledAnimation([
                PLAYERSPRITES.step1,
                PLAYERSPRITES.step2],
                [0.2,0.2]);
    //this.a_walk = this.a_run;
    this.a_stand = new AngledSprite(PLAYERSPRITES.standing);
    this.state = 0;
    this.sprite = this.a_stand;
};

Player.prototype = new RenderObject();
Player.prototype.walk = function() {
    this.isMoving = true;
    this.sprite = this.a_walk;
    this.sprite.setAngle(this.vel, this.orientation);
};
Player.prototype.stop = function() {
    this.isMoving = false;
    this.sprite = this.a_stand;
    this.sprite.setAngle(this.vel, this.orientation);
    this.vel.x = this.vel.y = 0;
}



var Timer = function() {
    this._lastTick = (new Date()).getTime();
};

Timer.prototype = {
    tick: function() {
        var currentTick = (new Date()).getTime();
        this._frameSpacing = currentTick - this._lastTick;
        this._lastTick = currentTick;

        var seconds = this._frameSpacing / 1000;
        if(isNaN(seconds)) {
            return 0;
        }
        return seconds;



    }
};


var Renderer = function(canvas, sprite_image) {
	this.canvas = canvas;
	this.sprite_image = sprite_image;
};

Renderer.prototype = {
	_objs: [],

	runAt: function(interval) {
		var image = new Image();
		var that = this;
        var w = that.canvas.width;
        var h = that.canvas.height;

		image.onload = function() {
			Sprite.ctx = that.canvas.getContext('2d');
			Sprite.image = image;

			var objs = that._objs;
			var timer = new Timer();

			setInterval(function() {
				var delta = timer.tick();

				Sprite.ctx.clearRect(0, 0, w, h);
				for (var i in objs) {
					objs[i].render(delta);
				}
			}, interval);
		};
		image.src = this.sprite_image;

	},
	addObject: function(obj) {
		this._objs.push(obj);
	}

};








/* Input
 *
 * Collects user input and at set intervarls dispatches it to the server.
 *
 * */
var PLAYER_SPEED = 70;
var P_STAND = 0, P_WALK = 1;

var Input = function(socket, canvas, cursor) {
    this.socket = socket;
    this.canvas = canvas;
    this.cursor = cursor;

    this._state = P_STAND;
    this._dir = new V2d(0,0);

    /*this.state = {
        dirx: 0,
        diry: 0,
        state: P_STAND
    };*/
    this.timer = new Timer();
}


Input.prototype = {

    setupHandlers: function() {
        var that = this;
        var o = this.canvas.offset();
        var l = o.left, t = o.top;

        this.canvas.mousemove(function (e) {
            var mouse = new V2d(e.pageX - l, e.pageY - t);
            that._dir = that.cursor.setDirection(mouse).normalized();
        });
        this.canvas.mousedown(function (e) {
            that._state = P_WALK;
        });
        this.canvas.mouseup(function(e) {
            that._state = P_STAND;
        });
    },

    run: function() {
        var that = this;
        that.setupHandlers();
        setInterval(function() {
            that.socket.send(that._state+'|'+that._dir.x+'|'+that._dir.y);

            //this.state);
        }, 200);
    }
};



var Footie = function(canvas) {
	this.renderer = new Renderer(canvas.get(0), "sprites.png");
	this.init(canvas);
	this.run();
};


Footie.prototype = {

	init: function(canvas) {
        var that = this;


        this.player = new Player();
        this.player.pos = new V2d(400, 240);
        this.cursor = new Cursor(this.player);
        this.renderer.addObject(this.cursor);


        var ball = new RenderObject();
        ball.sprite = SPRITEMAP.ball;
        ball.pos = new V2d(120, 330);

		this.renderer.addObject(ball);

        this.renderer.addObject(this.player);

        //this.network = new LoopbackServer("", function(a) { that.network_handler(a) });
        this.network = new Server("", function(a) { that.network_handler(a) });
        this.input = new Input(this.network, canvas, this.cursor);


	},
    network_handler: function(game_state) {
        var SPEED = 70;
        var p = game_state.p0;
        if (typeof(p) == 'undefined') return;

        this.player.vel.x = SPEED * p.dirx;
        this.player.vel.y = SPEED * p.diry;

        switch (p.state) {
            case P_STAND: {
                this.player.stop();
                };
                break;
            case P_WALK: {
                this.player.walk();
                };
                break;
        };


    },
	run: function() {
		console.log("F: runing renderer.");
		this.renderer.runAt(50);
        this.input.run();
	}
};

$(function() {
    var canvas = $("#canvas");

    new Footie(canvas);

});
