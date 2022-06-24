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
