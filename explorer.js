// Get named HTML object

function GetObject(name) {
    var o = null;
    if (document.getElementById)
        o = document.getElementById(name);
    else if (document.all)
        o = document.all.item(name);
    else if (document.layers)
        o = document.layers[name];
    return o;
}

// set if differences can be clicked on
var canspot = true;
var okdelay = -3000;

function badspot(forceok) {
    o = GetObject("welldone");
    if (!forceok) {
        okdelay += 1000;
        if (okdelay > 5000) okdelay = 5000;
        if (okdelay > 0)
            setTimeout("badspot(true);", okdelay);
    }
    var dok = (forceok || (okdelay <= 0));

}

function clrwelldone() {
    o = GetObject("welldone");
    if (o) {
        o.innerHTML = '\
        <TABLE style="position:relative; left:0px; top:0px;" BGCOLOR="#F0F0FF" WIDTH="0" \
            BORDER="0"CELLSPACING="0" CELLPADDING="0">\
        </TABLE>';
    }
}

function setcanspot() {
    canspot = true;
    clrwelldone();
}

function gamecomplete() {
    o = GetObject("welldone");
}


function normaldiff(spot) // called in non-text games
{
    if (!canspot)
        return false;
    if (spot >= 0) {
        if (xy[spot][1] >= 0) {
            if (okdelay >= 0)
                okdelay = -1000;
            show(spot, img0.src);
            xy[spot][1] = -1;
            var o = GetObject("find" + (ndiff - nleft));
            nleft -= 1;

            if (o != null) {
                o.src = img3.src;
            }
            if (nleft == 0) {
                endgame(1);
            } else {
                var p = nleft;
                if (p > 7) p = 7;
                //fx("t"+(7-p)+".wav");
            }
        }
        return false;
    }
    //fx("oops.wav");
    if (badspot != null)
        badspot(false);
    return false;
}

var allimgsloaded = false;
var animate = true;

function rndc(dir) {
    do {
        var m = 60;
        var s = m >> 1;
        if (dir != 0) {
            m = s;
            s = 0;
            if (dir < 0)
                m = -m;
        }
        m = Math.floor(Math.random() * m - s);
    }
    while (m == 0);
    return m;
}

var r = 0xFF,
    g = 0xFF,
    b = 0,
    dr = rndc(-1),
    dg = rndc(-1),
    db = rndc(-1);
var jx2 = 0;
var jy2 = 0;
var jm2 = 0;

var imgcache = new Array();
var imgflags = new Array();
var imgidx = new Array();

function addimg(img) {
    var x = imgcache.length;
    var idx = 0;
    for (var i = 0; i < x; i++) {
        // check if tail part of url is same
        if (imgcache[i].src.slice(-img.length) == img) {
            break;
        }
    }
    imgidx[imgidx.length] = i;
    if (i == x) {
        imgcache[x] = new Image();
        imgflags[x] = false;
        imgcache[x].onload = imgcache[x].onabort = imgcache[x].onerror = new Function("imgflags[" + x + "]=true;");
        imgcache[x].src = img;
    }
}

// update display when all images loaded

function drawimgs() {
    var nok = 0;
    var tot = imgcache.length
    for (var i = 0; i < tot; i++) {
        //      if (imgcache[i].complete) 
        if (imgflags[i])
            nok++;
    }
    if (nok == tot) {
        for (var i = 0; i < imgidx.length; i++) {
            var idx = imgidx[i];
            var o = GetObject("icache" + i);
            if (o) o.src = imgcache[idx].src;
        }
        setcanspot();
        allimgsloaded = true;
    } else {
        allimgsloaded = false;
        var pct = Math.floor(100 * nok / tot);
        o = GetObject("welldone");
        if (o) {
            o.innerHTML = '\
            <TABLE style="position:relative; left:200px; top:150px;" BGCOLOR="#F0F0FF" WIDTH="196" \
                BORDER="1" BORDERCOLOR="#808080" CELLSPACING="0" CELLPADDING="0">\
            <TR><TD align="center">\
                <TABLE BORDER="0">\
                <TR><TD>\
                    Loading: ' + pct + '%<BR>\
                </TD></TR>\
                </TABLE>\
            </TD></TR>\
            </TABLE>';
        }
        canspot = false;

        setTimeout("drawimgs();", 200);
    }
}

function clrprog(y) {
    setcanspot();
    if (y) {
        var dlt = new Date((new Date()).getTime() - 365 * 24 * 60 * 60000); // 1 year ago
        var exp = dlt.toGMTString();
        document.cookie = "stage=1; expires=" + exp;
        document.cookie = "spots=0; expires=" + exp;
        document.cookie = "exptimes=0; expires=" + exp;
        document.cookie = "besttimes=0; expires=" + exp;
        document.cookie = "pgbest=0; expires=" + exp;
        document.cookie = "master=0; expires=" + exp;
        document.location = "default.asp";
    }
}

function clearprogress() {
    o = GetObject("welldone");
    if (o) {
        o.innerHTML = '\
        <TABLE style="position:relative; left:175px; top:150px;" BGCOLOR="#F0F0FF" WIDTH="246" \
            BORDER="1" BORDERCOLOR="#808080" CELLSPACING="0" CELLPADDING="0">\
        <TR><TD align="center">\
            <TABLE BORDER="0">\
            <TR><TD colspan="2" align="center">\
                This will delete all your Explorer Game progress\
                and Practice Puzzle and Photo Puzzle times.<BR>...Continue?<BR>\
            </TD></TR>\
            <TR><TD align="left">\
                <A href="javascript:clrprog(1);">OK</A>\
            </TD>\
            <TD align="right">\
                <A href="javascript:clrprog(0);">Cancel</A>\
            </TD></TR>\
            </TABLE>\
        </TD></TR>\
        </TABLE>';
    }
    canspot = false;
}

function getPraise(t, t1, t2, t0) {
    if (t == 10000)
        return "Completed by Magic Spot.";

    var a = new Array("Brilhante!", "Incrível!", "Impressionante!",
        "Excelente!", "Fantástico!", "Muito rápido!",
        "Tempo rápido.", "Maravilhoso.", "Ótimo.",
        "Bem feito.", "Boa.", "Bom jogo.");
    var r0 = 0; // prev rank
    var r1 = 0; // this rank
    if (t0 < 0) r0 = -1;
    else if (t0 < t1) r0 = 2;
    else if (t0 < t2) r0 = 1;
    if (t < t1) r1 = 2;
    else if (t < t2) r1 = 1;

    var r = Math.floor(Math.random() * 3);
    if (r1 < 2) {
        if (r1 == 1) {
            r = Math.floor(6 * (t - t1) / (t2 - t1)) + 3;
        } else {
            r += 9;
        }
    }
    var txt = "";
    var c = "<FONT>";
    if (r1 > r0) {
        txt = ["&nbsp;&nbsp;", "&nbsp;&nbsp;Velocidade de Prata!", "&nbsp;&nbsp;Velocidade de Ouro!!"][r1];
        c = ["", "<FONT color='#6070B0'>", "<FONT color='#C08000'>"][r1]
    }
    return ("<B>" + c + a[r] + txt + "</FONT></B>");
}