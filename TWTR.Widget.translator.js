/*

The MIT License

Copyright (c) 2011 Norio Nomura

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

*/

(function ()
{
  if (!TWTR || !TWTR.Widget || TWTR.Widget.translator) {
    return 
  }
  function B(D, G, C) {
    for (var F = 0, E = D.length; F < E; ++F) {
      G.call(C || window, D[F], F, D)
    }
  }
  TWTR.Widget.translator = function (widget) {
    var systemLanguage = /^([^-]+)(?:-\S+)?$/.exec(window.navigator.language)[1],
        t = TWTR.Widget.translator,
        widgetNumber = widget._widgetNumber,
        cbName = 'receiveCallback_' + widgetNumber,
        orgCallback = t[cbName] || (t[cbName] = TWTR.Widget[cbName]);
    if (orgCallback) {
      t.initialized = t.initialized || false;
      if (t.initialized) {
        var f = function (p) {
          var that = this, queue = null;
          B(p.results, function (q) {
            (queue || (queue = {}))[q.id_str] = function(r) {
              if (r.detectedSourceLanguage != systemLanguage && r.translation) {
                q.text = r.translation;
              }
              delete queue[q.id_str];
              if (!Object.keys(queue).length) {
                orgCallback.call(that, p);
              }
            }
            google.language.translate(q.text, '', systemLanguage, queue[q.id_str]);
          });
          if (!queue) {
            orgCallback.call(that, p);
          }
        };
        TWTR.Widget[cbName] = f;
        if (t.stock[widgetNumber]) {
          B(t.stock[widgetNumber], f, widget);
          delete t.stock[widgetNumber];
        }
      } else {
        (t.widgets || (t.widgets = [])).push(widget);
        t.stock = t.stock || {};
        TWTR.Widget[cbName] = function (p) {
          (t.stock[widgetNumber] || (t.stock[widgetNumber] = [])).push(p);
        };
      }
    }
    return widget;
  };
  function initialize () {
    var t = TWTR.Widget.translator;
    t.initialized = true;
    if (t.widgets) {
      B(t.widgets, function (widget) {
        t(widget);
      }, t.widgets);
      delete t.widgets;
    }
  }
  google.load('language', '1');
  google.setOnLoadCallback(initialize);
})();
