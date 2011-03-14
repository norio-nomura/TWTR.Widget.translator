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
  function B(D, G, C)
  {
    for (var F = 0, E = D.length; F < E; ++F) {
      G.call(C || window, D[F], F, D)
    }
  }
  TWTR.Widget.translator = function (widget) {
    if (TWTR.Widget.translator.enable) {
      TWTR.Widget.translator.enable(widget);
    } else {
      TWTR.Widget.translator.widgets = TWTR.Widget.translator.widgets || {};
      TWTR.Widget.translator.widgets[widget._widgetNumber] = widget;
    }
  }
  function initialize () {
    var systemLanguage = /^([^-]+)(?:-\S+)?$/.exec(window.navigator.language)[1];
    TWTR.Widget.translator.enable = function (widget) {
      var orgCallback = TWTR.Widget["receiveCallback_" + widget._widgetNumber];
      if (orgCallback) {
        TWTR.Widget.translator["receiveCallback_" + widget._widgetNumber] = orgCallback;
        TWTR.Widget["receiveCallback_" + widget._widgetNumber] = function (p) {
          var that = this, queue = null;
          B(p.results, function (q) {
            if (q.iso_language_code !== systemLanguage) {
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
            }
          });
          if (!queue) {
            orgCallback.call(that, p);
          }
        };
      }
      return widget;
    };
    if (TWTR.Widget.translator.widgets) {
      B(Object.keys(TWTR.Widget.translator.widgets), function (k) {
        TWTR.Widget.translator.enable(this[k]);
        delete this[k];
      }, TWTR.Widget.translator.widgets);
    }
  }
  google.load('language', '1');
  google.setOnLoadCallback(initialize);
})();
