const weirdHappend = {
    "haxclick": {},
    "vina-full": {
        "0": [12, 16, 40, 44, 48, 52, 68, 72, 84, 88, 96, 100, 120, 124, 128, 132, 152, 156, 160, 164, 184, 188, 192, 196, 216, 220, 228, 232, 244, 248, 264, 268, 272, 276, 300, 304],
        "1": [12, 16, 40, 44, 48, 68, 72, 76, 80, 108, 112, 140, 144, 172, 176, 204, 208, 236, 240, 268, 272, 292, 296, 300, 304, 308, 312],
        "2": [8, 12, 16, 20, 36, 40, 52, 56, 64, 68, 88, 92, 120, 124, 148, 152, 176, 180, 204, 208, 232, 236, 260, 264, 288, 292, 296, 300, 304, 308, 312, 316],
        "3": [4, 8, 12, 16, 20, 32, 36, 52, 56, 88, 92, 116, 120, 140, 144, 148, 180, 184, 216, 220, 248, 252, 256, 260, 276, 280, 292, 296, 300, 304, 308],
        "4": [20, 24, 48, 52, 56, 76, 80, 84, 88, 104, 108, 116, 120, 132, 136, 148, 152, 160, 164, 180, 184, 192, 196, 200, 204, 208, 212, 216, 220, 244, 248, 276, 280, 308, 312],
        "5": [0, 4, 8, 12, 16, 20, 24, 32, 36, 64, 68, 96, 100, 108, 112, 116, 128, 132, 136, 148, 152, 184, 188, 216, 220, 224, 228, 248, 252, 260, 264, 276, 280, 296, 300, 304, 308],
        "6": [8, 12, 16, 20, 36, 40, 52, 56, 64, 68, 88, 96, 100, 128, 132, 140, 144, 148, 160, 164, 168, 180, 184, 192, 196, 216, 220, 224, 228, 248, 252, 260, 264, 276, 280, 296, 300, 304, 308],
        "7": [0, 4, 8, 12, 16, 20, 24, 28, 56, 60, 88, 92, 116, 120, 144, 148, 172, 176, 200, 204, 228, 232, 256, 260, 288, 292],
        "8": [8, 12, 16, 20, 36, 40, 52, 56, 64, 68, 88, 92, 100, 104, 116, 120, 136, 140, 144, 148, 164, 168, 180, 184, 192, 196, 216, 220, 224, 228, 248, 252, 260, 264, 276, 280, 296, 300, 304, 308],
        "9": [8, 12, 16, 20, 36, 40, 52, 56, 64, 68, 88, 92, 96, 100, 120, 124, 132, 136, 148, 152, 156, 168, 172, 176, 184, 188, 216, 220, 228, 248, 252, 260, 264, 276, 280, 296, 300, 304, 308],
        "a": [104, 108, 112, 116, 120, 132, 136, 152, 156, 184, 188, 196, 200, 204, 208, 212, 216, 220, 224, 228, 248, 252, 256, 260, 276, 280, 284, 292, 296, 300, 304, 312, 316],
        "b": [0, 4, 32, 36, 64, 68, 96, 100, 108, 112, 116, 128, 132, 136, 148, 152, 160, 164, 184, 188, 192, 196, 216, 220, 224, 228, 248, 252, 256, 260, 264, 276, 280, 288, 292, 300, 304, 308],
        "c": [104, 108, 112, 116, 120, 132, 136, 152, 156, 160, 164, 192, 196, 224, 228, 260, 264, 280, 284, 296, 300, 304, 308, 312],
        "d": [24, 28, 56, 60, 88, 92, 104, 108, 112, 120, 124, 132, 136, 148, 152, 156, 160, 164, 184, 188, 192, 196, 216, 220, 224, 228, 248, 252, 260, 264, 276, 280, 284, 296, 300, 304, 312, 316],
        "e": [104, 108, 112, 116, 132, 136, 148, 152, 160, 164, 184, 188, 192, 196, 200, 204, 208, 212, 216, 220, 224, 228, 260, 264, 280, 284, 296, 300, 304, 308, 312],
        "f": [12, 16, 20, 24, 40, 44, 56, 60, 72, 76, 88, 92, 104, 108, 136, 140, 160, 164, 168, 172, 176, 180, 200, 204, 232, 236, 264, 268, 296, 300]
    }
};

function arr_diff(a1, a2) {
    var a = [],
        diff = [];
    for (var i = 0; i < a1.length; i++) {
        a[a1[i]] = true;
    }
    for (i = 0; i < a2.length; i++) {
        if (a[a2[i]]) {
            delete a[a2[i]];
        } else {
            a[a2[i]] = true;
        }
    }
    for (var k in a) {
        diff.push(k);
    }
    return diff;
}

function solveCaptcha(theCaptcha, cords = [
    [10, 18],
    [28, 36],
    [46, 54],
    [64, 72]
], dataName = "vina-full") {
    var canvas = document.createElement("canvas");
    canvas.setAttribute("width", theCaptcha.naturalWidth);
    canvas.setAttribute("height", theCaptcha.naturalHeight);
    document.body.appendChild(canvas);
    var ctx = canvas.getContext('2d');
    ctx.drawImage(theCaptcha, 0, 0);
    var imageData = ctx.getImageData(0, 0, theCaptcha.naturalWidth, theCaptcha.naturalHeight);
    var data = imageData.data;
    var bgColors = [];
    for (var i = 10 * canvas.width * 4; i <= 21 * canvas.width * 4; i += 4) {
        var x = i % theCaptcha.naturalWidth;
        var y = parseInt(i / theCaptcha.naturalHeight);
        if (bgColors.length < 2 && bgColors.indexOf(data[i] + "," + data[i + 1] + "," + data[i + 2]) == -1) {
            bgColors.push(data[i] + "," + data[i + 1] + "," + data[i + 2])
        }
        if (bgColors.indexOf(data[i] + "," + data[i + 1] + "," + data[i + 2]) === -1) {
            data[i] = 0;
            data[i + 1] = 0;
            data[i + 2] = 0;
        } else {
            data[i] = 255;
            data[i + 1] = 255;
            data[i + 2] = 255;
        }
    }
    var result = "";
    for (var cord = 0; cord < cords.length; cord++) {
        var output = [];
        let start = {
            x: cords[cord][0],
            y: 10
        };
        for (let x = cords[cord][0]; x <= cords[cord][0] + 8; x++) {
            for (let y = 10; y <= 20; y++) {
                let i = (x + y * canvas.width) * 4;
                if (data[i] === 0 && data[i + 1] === 0 && data[i + 2] === 0) {
                    output.push(((x - start.x) + (y - start.y) * 8) * 4);
                }
            }
        }
        for (var key in weirdHappend[dataName]) {
            if (arr_diff(weirdHappend[dataName][key], output).length == 0) {
                result += key;
                break;
            }
        }
    }
    return result;
}
exports.init = async function(batt){
  const o=window;
  const doc=window.document;
  const storage=batt.getConfig();

  switch(location.hostname){
    case "www.ha-lab.com":
      if(document.URL === "https://www.ha-lab.com/games/dragon-city/dragon-cinema"){

        const elements = await batt.waitForElements(o,["input[type='submit']","a[href='/adStart']"]);

        if(elements[0].offsetParent === null){
          elements[1].click();
        } else {
          const form_elements = await batt.waitForElements(o,[
            "input[name='fb_id']",
            "input[name='ss_id']",
            "input[name='ext_id']",
            "input[name='captchaKey']",
            "#captchaImg",
            "input[value='Submit']"
          ]);
          form_elements[0].value = "314587371899226";
          form_elements[1].value = "47239999";
          form_elements[2].value = "808178672632543";
          form_elements[3].value = solveCaptcha(form_elements[4]);
          form_elements[5].click();
        }
      } else {

      }
      break;
    case "linkshrink.net":
      let l = atob(document.body.textContent.match(/revC\("([^"]+)"\)/)[1]);
      window.top.location.replace('/'+l);
      break;
  }
}
