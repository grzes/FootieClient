var V2d = function(x,y) {
    this.x = x;
    this.y = y;
}

V2d.add = function(v1,v2) {
    return new V2d(v1.x+v2.x, v1.y+v2.y);
}
V2d.sub = function(v1,v2) {
    return new V2d(v1.x-v2.x, v1.y-v2.y);
}
V2d.mul = function(v1, s) {
    return new V2d(v1.x*s, v1.y*s);
}


V2d.prototype = {
    add: function(v2) {
        this.x += v2.x;
        this.y += v2.y;
        return this;
    },
    mul: function(s) {
        this.x*=s; this.y*=s;
        return this;
    },
    toRad: function() {
       var rad = Math.atan(this.y/this.x);

       rad = rad * (360 / (2*Math.PI) )+90;
       if (this.x < 0){
          rad+=180;
       }
       return rad;
    },
    length: function() {
        return Math.sqrt(this.x*this.x + this.y*this.y);
    },
    normalize: function() {
        var ool = 1 / this.length();
        this.x *= ool;
        this.y *= ool;
        return this;
    },
    normalized: function() {
        return new V2d(this.x, this.y).normalize();
    }
}
