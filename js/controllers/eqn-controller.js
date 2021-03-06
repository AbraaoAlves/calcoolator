G.makeEqnController = function (model) {
    var me = G.makeController(model, "eqn");

    var eqnDude = G.makeEqnDudeView();

    eqnDude.subscribe("eqnChanged", onEqnChange);
    //eqnDude.subscribe("newFunction", me.onNewFunction);
    eqnDude.subscribe("eqnSelected", me.onSelectFunction);
    eqnDude.subscribe("eqnRemoved", me.onRemoveFunction);
    eqnDude.display();

    // TODO only redisplay one function at a time
    me.onUpdate = function (event) {
        // Only redisplay eqns if another representation
        // submitted the change
        if (event.src === me.name && event.changedFun) {
            // Update the changed eqn with the results of the parse
            eqnDude.changeEqn(event.changedFun);
        } else if (event.selectedFun) {
            eqnDude.selectEqn(event.selectedFun);
        } else {
            // Remove the old eqn string from the changed function so
            // the view can make a new one.
            if (event.changedFun) { event.changedFun.repData(me.name, null); }

            eqnDude.display(event.functions);
        }
    };

    function onEqnChange(event) {
        // Update the fun based on the new eqnStr
        event.fun.repData(me.name, event.eqnStr);
        var coefs = parser.parseAndSimplify(event.eqnStr);
        if (coefs) {
            console.log("new coefs", coefs);
            event.fun.coefs(coefs);
        } else {
            console.log("no parse for " + event.eqnStr);
            event.fun.coefs(null);
        }
        model.changeFunction(event.fun, me.name);
    }

    return me;
};
