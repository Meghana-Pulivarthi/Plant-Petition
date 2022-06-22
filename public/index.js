(function () {
    const canvas = document.getElementById("sign");
    const ctx = canvas.getContext("2d");
    ctx.strokeStyle = "pink";
    ctx.lineWidth = 4;
    const canvasWidth = canvas.width;
    let drawing = false;
    let cursorPos = {
        x: 0,
        y: 0,
    };
    let lastPos = cursorPos;
    canvas.addEventListener(
        "mousedown",
        (e) => {
            drawing = true;
            lastPos = getCursorPosition(canvas, e);
        },
        false
    );
    canvas.addEventListener(
        "mouseup",
        () => {
            drawing = false;
        },
        false
    );
    canvas.addEventListener(
        "mousemove",
        (e) => {
            cursorPos = getCursorPosition(canvas, e);
        },
        false
    );
    function replaceSignature() {
        var dataUrl = canvas.toDataURL();
        var signData = document.getElementById("signature");
        signData.value = dataUrl;
        console.log("dataUrl", dataUrl);
    }
    function getCursorPosition(canvasDom, e) {
        var rect = canvasDom.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        };
    }
    function renderCanvas() {
        if (drawing) {
            ctx.moveTo(lastPos.x, lastPos.y);
            ctx.lineTo(cursorPos.x, cursorPos.y);
            ctx.closePath();
            ctx.stroke();
            lastPos = cursorPos;
        }
    }
    (function drawLoop() {
        window.requestAnimationFrame(drawLoop);
        renderCanvas();
        replaceSignature();
    })();
    function clearCanvas() {
        canvas.width = canvasWidth;
        // ctx.clearRect(0, 0, canvas.width, canvas.height);
        //ctx.restore();
    }
    // document.getElementById("clearBtn").addEventListener("click", () => {
    //     clearCanvas();
    // });
})();

// var canvas = canvas.getElementById("signature");
// var ctx = canvas.getContext("2d");
// var drawing = false;
// var prevX, prevY;
// var currX, currY;
// var signature = document.getElementsByName("signature")[0];

// canvas.addEventListener("mousemove", draw);
// canvas.addEventListener("mouseup", stop);
// canvas.addEventListener("mousedown", start);

// function start(e) {
//     drawing = true;
// }

// function stop() {
//     drawing = false;
//     prevX = prevY = null;
//     signature.value = canvas.toDataURL();
// }

// function draw(e) {
//     if (!drawing) {
//         return;
//     }
//     // Test for touchmove event, this requires another property.
//     var clientX = e.type === "touchmove" ? e.touches[0].clientX : e.clientX;
//     var clientY = e.type === "touchmove" ? e.touches[0].clientY : e.clientY;
//     currX = clientX - canvas.offsetLeft;
//     currY = clientY - canvas.offsetTop;
//     if (!prevX && !prevY) {
//         prevX = currX;
//         prevY = currY;
//     }

//     ctx.beginPath();
//     ctx.moveTo(prevX, prevY);
//     ctx.lineTo(currX, currY);
//     ctx.strokeStyle = "black";
//     ctx.lineWidth = 2;
//     ctx.stroke();
//     ctx.closePath();

//     prevX = currX;
//     prevY = currY;
// }

// function onSubmit(e) {
//     console.log({
//         name: document.getElementsByName("name")[0].value,
//         signature: signature.value,
//     });
//     return false;
// }
