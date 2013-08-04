(function() {
  var c = [{
    width: 2,
    height: 2,
    probability: 0.15
  }, {
    width: 2,
    height: 1,
    probability: 0.2
  }, {
    width: 1,
    height: 1,
    probability: 0.65
  }];
  var d = [{
    cols: 5,
    tiles: 25,
    rows: ["AAAAA", "AAAAA", ".AABB", "...BB", "CCDD.", "CC...", "EE...", "..FF.", ".GGHH", ".GGII"]
  }, {
    cols: 5,
    tiles: 25,
    rows: ["AAAAA", "AAAAA", ".AABB", "CC.BB", "DDEE.", "DD.FF", ".GG..", "..HH.", "IIHH.", ".JJKK", ".JJLL"]
  }, {
    cols: 5,
    tiles: 25,
    rows: ["AAAAA", "AAAAA", "...AA", ".BB..", ".BB..", "CC...", "..DD.", "EEDD.", "...FF"]
  }, {
    cols: 5,
    tiles: 25,
    rows: ["AAAAA", "AAAAA", ".AABB", "CC.BB", "DDEE.", "DD.FF", ".GG..", "..HH.", "IIHH.", ".JJKK", ".JJLL"]
  }];
  var a = {},
      b = "col-";
  PulseTileTemplates = {
    get: function(k, f) {
      var j = [],
          g, e, h;
      for (g = 0, e = d.length; g < e; g++) {
        h = d[g];
        if (h.cols === k && h.tiles === f) {
          j.push(h)
        }
      }
      if (j.length > 0) {
        g = Math.floor(Math.random() * j.length);
        return Tiles.Template.fromJSON(j[g].rows)
      }
      return Tiles.DiverseTemplates.get(k, f, c)
    },
    getStreamTemplate: function(h, j, f) {
      var e = a[h];
      if (e) {
        var g = e[b + j];
        if (g && g.rects.length <= f) {
          return g.copy()
        }
      }
      return null
    },
    setStreamTemplate: function(g, f) {
      var e = a[g];
      if (!e) {
        e = a[g] = {}
      }
      e[b + f.numCols] = f.copy()
    }
  }
})();




(function() {
  var j = 6,
      a = 50,
      m = 2;

  function d(q, p, r, t) {
    this.width = q;
    this.height = p;
    this.area = q * p;
    this.count = r;
    this.probability = t
  }
  d.sortByAreaDesc = function(q, p) {
    if (q.area > p.area) {
      return -1
    }
    if (q.area === p.area) {
      return 0
    }
    return 1
  };

  function e(q, p) {
    return Math.floor(Math.random() * (p - q + 1) + q)
  }
  function f(t) {
    var r = [],
        q, p;
    for (q = 0, p = t.length; q < p; q++) {
      r.push(t[q].count)
    }
    return JSON.stringify(r)
  }
  function b(u, w, B) {
    var r = [],
        p = 0,
        t = 0,
        v, x, F, A, E;
    for (v = 0, x = B.length; v < x; v++) {
      F = B[v];
      if (F.width <= u) {
        A = new d(F.width, F.height, Math.ceil(F.probability * w), F.probability);
        r.push(A);
        t += A.count;
        p += (A.area * A.count)
      }
    }
    r.sort(d.sortByAreaDesc);
    var z = 0,
        C = 0,
        y = 0,
        D;
    var q = function(G, H) {
      var I = r[G];
      if (H < 0) {
        H = Math.max(H, -I.count)
      }
      I.count += H;
      t += H;
      p += (H * I.area)
    };
    while (z++ < a) {
      D = Math.ceil(p / u);
      for (v = r.length - 1; v >= 0; v--) {
        A = r[v];
        if (A.height > D || A.width > u) {
          q(v, -A.count)
        }
      }
      if (t !== w) {
        q(y, w - t)
      }
      if (p % u === 0) {
        for (C = 0; C < m; C++) {
          E = l(r, u, p / u);
          if (E) {
            return E
          }
        }
      } else {} if (y === r.length - 1) {
        q(y, 1);
        y--
      } else {
        q(y, -1);
        y++
      }
    }
    return null
  }
  function l(q, r, w) {
    var F = [],
        C, B;
    for (B = 0; B < w; B++) {
      F[B] = [];
      for (C = 0; C < r; C++) {
        F[B][C] = false
      }
    }
    var D = [],
        u, t, v, z, E, A;
    for (u = 0, v = q.length - 1; u < v; u++) {
      z = q[u];
      for (t = 0; t < z.count; t++) {
        E = k(z, F, r, w);
        h(E, D);
        A = n(E);
        if (!A) {
          return null
        }
        for (B = 0; B < A.height; B++) {
          for (C = 0; C < A.width; C++) {
            F[A.y + B][A.x + C] = true
          }
        }
        D.push(A)
      }
    }
    var p = q[q.length - 1];
    D = D.concat(k(p, F, r, w));
    D.sort(g);
    return new Tiles.Template(D, r, w)
  }
  function h(y, z) {
    var r = y.length,
        u = z.length,
        p, x, t, q, w, v;
    for (t = 0; t < r; t++) {
      p = y[t];
      p.penalty = 0;
      for (q = 0; q < u; q++) {
        x = z[q];
        if (p.x === x.x && p.width === x.width) {
          w = Math.min(Math.abs(p.y - (x.y + x.height)), Math.abs(x.y - (p.y + p.height)));
          v = Math.max(0, j - w) + 1;
          p.penalty += v
        } else {
          if (p.y === x.y && p.height === x.height) {
            w = Math.min(Math.abs(p.x - (x.x + x.width)), Math.abs(x.x - (p.x + p.width)));
            v = Math.max(0, j - w) + 1;
            p.penalty += v
          }
        }
      }
    }
  }
  function n(v) {
    var t = v.length;
    if (t === 0) {
      return null
    }
    v.sort(c);
    var p = v[0].penalty,
        u = [],
        r, q;
    for (r = 0; r < t; r++) {
      q = v[r];
      if (q.penalty > p) {
        break
      }
      u.push(q)
    }
    return u[e(0, u.length - 1)]
  }
  function g(q, p) {
    if (q.y < p.y) {
      return -1
    }
    if (q.y > p.y) {
      return 1
    }
    if (q.x < p.x) {
      return -1
    }
    if (q.x > p.x) {
      return 1
    }
    return 0
  }
  function c(q, p) {
    if (q.penalty < p.penalty) {
      return -1
    }
    if (q.penalty > p.penalty) {
      return 1
    }
    return 0
  }
  function k(w, E, q, v) {
    var D = Tiles.Rectangle,
        C = [],
        p = v - w.height + 1,
        u = q - w.width + 1,
        A, z, t, r, B;
    for (z = 0; z < p; z++) {
      for (A = 0; A < u; A++) {
        B = true;
        for (t = 0; t < w.height; t++) {
          for (r = 0; r < w.width; r++) {
            if (E[z + t][A + r]) {
              B = false;
              break
            }
          }
        }
        if (B) {
          C.push(new D(A, z, w.width, w.height))
        }
      }
    }
    return C
  }
  var o = [{
    width: 2,
    height: 2,
    probability: 0.2
  }, {
    width: 2,
    height: 1,
    probability: 0.25
  }, {
    width: 1,
    height: 2,
    probability: 0.25
  }, {
    width: 1,
    height: 1,
    probability: 0.3
  }];
  Tiles.DiverseTemplates = {
    get: function(r, p, q) {
      return b(r, p, q || o)
    }
  }
})();
