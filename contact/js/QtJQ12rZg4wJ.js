(() => {
  "use strict";
  function e(e, t) {
    var a = e.dataset.lat,
      o = e.dataset.lng,
      r = { lat: parseFloat(a), lng: parseFloat(o) },
      s = {
        url: e.dataset.icon,
        scaledSize: new google.maps.Size(114, 43),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(0, 0),
      },
      n = new google.maps.Marker({ position: r, icon: s, map: t });
    if ((t.markers.push(n), e.innerHTML)) {
      var i = new google.maps.InfoWindow({ content: e.innerHTML });
      google.maps.event.addListener(n, "click", function () {
        i.open(t, n);
      });
    }
  }
  const t = function (t) {
    var a = t.querySelectorAll(".marker"),
      o = {
        zoom: parseInt(t.dataset.zoom) || 16,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        styles: [
          {
            featureType: "all",
            stylers: [{ saturation: 0 }, { hue: "#e7ecf0" }],
          },
          { featureType: "road", stylers: [{ saturation: -70 }] },
          { featureType: "transit", stylers: [{ visibility: "off" }] },
          { featureType: "poi", stylers: [{ visibility: "off" }] },
          {
            featureType: "water",
            stylers: [{ visibility: "simplified" }, { saturation: -60 }],
          },
        ],
        zoomControl: !1,
        mapTypeControl: !1,
        scaleControl: !1,
        streetViewControl: !1,
        rotateControl: !1,
        fullscreenControl: !1,
      },
      r = new google.maps.Map(t, o);
    r.markers = [];
    for (var s = 0; s < a.length; s++) e(a[s], r);
    !(function (e) {
      var t = new google.maps.LatLngBounds();
      (e.markers.forEach(function (e) {
        t.extend({ lat: e.position.lat(), lng: e.position.lng() });
      }),
        1 == e.markers.length ? e.setCenter(t.getCenter()) : e.fitBounds(t));
    })(r);
  };
  const a = function () {
    var e = $("form#js-contact");
    if (e.length) {
      var t = e.find("button[type=submit]"),
        a = "is-loading",
        o = e.find("input"),
        r = e.find(".js-success-report"),
        s = e.find(".js-error-report"),
        n = s.find(".js-error-feedback"),
        i = s.find(".js-error-list");
      (s.hide(),
        e.on("submit", function (l) {
          (l.preventDefault(),
            e.addClass(a),
            e.attr("data-state", a),
            t.attr("disabled", "disabled").addClass(a),
            o.removeClass("error"),
            r.hide(),
            r.html(""),
            s.hide(),
            n.html(""),
            i.html(""),
            $.ajax({
              type: "POST",
              url: "https://script.google.com/macros/s/AKfycbzy1mC3dA5BlHK-g5uZAskdJds32iBWfLwcKFvaKrdU2_FuLcqDLKM_Dd72hA2QJe-BQg/exec",
              data: e.serialize(),
              dataType: "json",
              encode: !0,
            })
              .done(function () {
                (e.attr("data-state", "submitted"),
                  e.removeClass(a).trigger("reset"),
                  t.removeAttr("disabled").removeClass(a),
                  r.show(),
                  r.html(
                    '<h3 class="title">Thank you!</h3><p>Your enquiry has been successfully sent.</p>',
                  ));
              })
              .fail(function (o) {
                var r = o.responseJSON;
                (s.show(),
                  n.html((r && (r.message || r.error)) || "Something went wrong. Please try again."),
                  r.errors &&
                    i.length &&
                    Object.keys(r.errors).forEach(function (t) {
                      var a = e.find("input[name=" + t + "]");
                      (a.length > 0 && a.addClass("error"),
                        i.append(
                          '<li><a href="#'
                            .concat(t, '">')
                            .concat(r.errors[t], "</a></li>"),
                        ));
                    }),
                  e.removeAttr("data-state"),
                  t.removeAttr("disabled").removeClass(a));
              }));
        }));
    }
  };
  (document.addEventListener("DOMContentLoaded", function () {
    var e = document.getElementsByClassName("js-google-map");
    if (e[0]) for (var a = 0; a < e.length; a++) t(e[a]);
  }),
    jQuery(function () {
      a();
    }));
})();
