G.makeFun = function(name, coefs) {
    var fun = {
        name: name,
        coefs: coefs,
        color: G.color(Math.random()*255, Math.random()*255, Math.random()*255), // fix this
        isSelected: false
    };
    
    fun.degree = 1;
    for (var i = 0; i < coefs.length; i++) {
        if (fun.coefs[i] != 0)
            fun.degree = i;
    }

    fun.evaluate = function(x) {
        var fx = 0;
        if (fun.coefs) {
            for (var i = 0; i < fun.coefs.length; i++) {
                fx += fun.coefs[i] * Math.pow(x,i);
            }
        }
        //console.log("f(" + x + ") = " + fx);
        return fx;
    }
    
    var reps = {};

    function addRep(rep) {
        reps[rep.name] = rep;
    }
    addRep(G.makeFunGraphRep(fun));
    addRep(G.makeFunEqnRep(fun));

    fun.getRepData = function(rep) {
        return reps[rep].data;
    };
    
    fun.repChanged = function(whichRep, repData) {
        fun.coefs = reps[whichRep].getNewCoefsFromRep(repData);
        // change all other reps
        if (fun.coefs) {
            for (r in reps) {
                if (reps[r].name !== whichRep) {
                    reps[r].setRepFromCoefs(coefs);
                }
            }
        }
    }

    fun.fitToPoints = function(pts) {
        var degree = pts.length - 1;
        var matrix = [];
        var vector = [];
        for (p in pts) {
            var point = pts[p];
            var row = [];
            for (var power = degree; power >= 0; power--) {
                row.push(Math.pow(point.x(), power));
            }
            vector.push(point.y());
            matrix.push(row);
        }
        var M = $M(matrix);
        var V = $V(vector);
        M = M.inv();
        var cfs = M.multiply(V).elements;
        return cfs.reverse();
    }

    return fun;
}

G.makePoint = function(x, y) {
    if (x === undefined || y === undefined) {
        throw "cannot make point with undefined x,y";
    }
    
    var pt = {};
    var _x = x;
    var _y = y;
    
    pt.x = function(x) {
        if (x !== undefined) {
            _x = x;
        }
        return _x;
    }
    
    pt.y = function(y) {
        if (y !== undefined) {
            _y = y;
        }
        return _y;
    }
    
    return pt;
}
