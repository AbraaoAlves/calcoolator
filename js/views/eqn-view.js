G.makeEqnView = function () {
    var me = G.makeRepView();

    var MIN_FONT_SIZE = 10,
        MAX_FONT_SIZE = 16,
        FONT_RESIZE_PCT = 0.75;
    // Displays a text field with a function name f(x)
    // As the user types an equation, parses the equation
    // Also tries to simplify the equation if possible, and shows a
    // simplify button if it is possible
    //
    // Number coefficients in the equation are scrubbable

    var $content, $editor, lastLatexStr, fun;

    me.display = function (afun, $parent) {
        fun = afun;
        // If the function is storing an old eqnStr, then we should
        // display that, because that was what the user last typed.
        // If not, then it got new coefs from another rep, so we
        // should get our eqnStr from them.
        var displayEqn = fun.repData("eqn") ?
             fun.repData("eqn") :
             toEqnString(fun.coefs());
        //console.log('"' + displayEqn + '"');

        $content = $(
            "<div class=\"eqn\">" +
                "<span class=\"eqn-name\">" + fun.name + "</span>" +
                "<span class=\"eqn-of-x\">(x)=</span>" +
                "<span class=\"eqn-editor\">" + displayEqn + "</span>" +
            "</div>"
            )
            .appendTo($parent)
            .keyup(handleKey)
            .click(handleClick);

        $content.find(".eqn-name").mathquill().css("color", fun.color.toCSS());
        $content.find(".eqn-of-x").mathquill();
        $editor = $content.find(".eqn-editor").mathquill("editable");

        updateParseStatus();
        me.updateSelectedStatus();
        resizeFont();

        lastLatexStr = $editor.mathquill("latex");
    };

    me.update = function (newFun) {
        fun = newFun;
        updateParseStatus();
        me.updateSelectedStatus();
    };

    function updateParseStatus() {
        $editor.toggleClass("parse-error", fun.coefs() ? false : true);
    }

    me.updateSelectedStatus = function() {
        $content.toggleClass("selected", fun.isSelected);
        if (fun.isSelected) { $editor.focus(); }
    }

    function handleKey(e) {
        var newLatexStr = $editor.mathquill("latex");
        if (newLatexStr !== lastLatexStr) {
            //console.log("old latex", lastLatexStr, 'new latex', newLatexStr);
            me.broadcast("eqnChanged", {
                fun: fun,
                eqnStr: latexToEqn(newLatexStr)
            });
        }
        lastLatexStr = newLatexStr;

        resizeFont();
    }

    function handleClick(e) {
        me.updateSelectedStatus();
        me.broadcast("eqnSelected", { fun: fun });
    }

    // Dynamically resize equation text to fit the editor
    function resizeFont() {
        var edWidth = $editor.width(),
            maxWidth = $content.width() - $editor.position().left,
            size = parseFloat($content.css("font-size"));

        if (edWidth > maxWidth && size > MIN_FONT_SIZE) {
            $content.css("font-size", "-=" + 1);
        } else if (edWidth < maxWidth * FONT_RESIZE_PCT &&
                   size < MAX_FONT_SIZE)
        {
            $content.css("font-size", "+=" + 1);
        }
    }

    function toEqnString(coefs) {
        return _.chain(coefs)
            .map(G.u.roundTo(2))
            .map(function (coef, i) {
                var xterm = (i === 0) ? "" :
                            (i === 1) ? "x" :
                                        "x^" + i;
                return  (coef === 0)          ? "" :
                        (coef === 1 && i > 0) ? xterm :
                                                coef + xterm ;
            })
            .compact().value()
            .reverse()
            .join("+");
    }

    function latexToEqn(latexStr) {
        return latexStr.replace(/\\cdot/g, "*")
            .replace(/\\\:/g, " ");
    }
    //console.log(toEqnString([0,1,2,0]));
    //console.log(toEqnString([0]));
    
    me.fun = function () { return fun; };

    return me;
};
