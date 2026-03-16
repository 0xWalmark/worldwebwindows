const MAX_UNLOCKED_TOKEN = 31;

const canvasReal = document.getElementById("canvasReal");
const ctxReal = canvasReal.getContext("2d");

const canvasView = document.getElementById("canvasView");
const ctxView = canvasView.getContext("2d");

let greenSlots = [];
let bannerImage = new Image();

const uploadArea = document.getElementById("uploadArea");
const easterEggMsg = document.getElementById("easterEggMsg");

function loadBanner(){

  let id = parseInt(document.getElementById("tokenId").value);

  if(id === 2401){
    easterEggMsg.innerText = "World Web Windows are half the story.\nNext part coming for holders soon.";
    ctxReal.clearRect(0,0,canvasReal.width,canvasReal.height);
    ctxView.clearRect(0,0,canvasView.width,canvasView.height);
    uploadArea.innerHTML = "";
    return;
  }else{
    easterEggMsg.innerText = "";
  }

  if(isNaN(id) || id < 1 || id > 2400){
    alert("Token ID must be between 1 and 2400");
    return;
  }

  if(id > MAX_UNLOCKED_TOKEN){
    alert("This token is not unlocked yet.");
    return;
  }

  bannerImage.src = `images/${id}.png`;

  bannerImage.onload = function(){

    ctxReal.clearRect(0,0,canvasReal.width,canvasReal.height);
    ctxReal.drawImage(bannerImage,0,0);

    detectGreenSquares();

    updateCanvasView();

  }

}

function updateCanvasView(){

  const scale = Math.min(canvasView.parentElement.clientWidth / canvasReal.width, 1);

  canvasView.width = canvasReal.width * scale;
  canvasView.height = canvasReal.height * scale;

  ctxView.clearRect(0,0,canvasView.width,canvasView.height);
  ctxView.drawImage(canvasReal,0,0,canvasView.width,canvasView.height);

}

function detectGreenSquares(){

  greenSlots = [];

  const data = ctxReal.getImageData(0,0,canvasReal.width,canvasReal.height).data;

  for(let y=0; y<canvasReal.height; y++){

    for(let x=0; x<canvasReal.width-96; x++){

      let isTopEdge = true;

      for(let i=0;i<96;i++){

        const idx = (y*canvasReal.width + (x+i))*4;

        if(!(data[idx]===0 && data[idx+1]===255 && data[idx+2]===30)){
          isTopEdge = false;
          break;
        }

      }

      if(isTopEdge){

        greenSlots.push({
          x: x,
          y: y,
          width: 96,
          height: 100
        });

        x += 95;

      }

    }

  }

  greenSlots.sort((a,b)=>{
    if(a.x !== b.x) return a.x - b.x;
    return a.y - b.y;
  });

  createUploadInputs();

}

function createUploadInputs(){

  uploadArea.innerHTML = "";

  greenSlots.forEach((slot,i)=>{

    let container = document.createElement("div");

    let preview = document.createElement("div");
    preview.className = "slotPreview";

    let label = document.createElement("p");
    label.innerText = "Slot #" + (i+1);

    let input = document.createElement("input");
    input.type = "file";

    input.onchange = (e)=>{

      let file = e.target.files[0];
      let reader = new FileReader();

      reader.onload = function(ev){

        let img = new Image();

        img.onload = function(){

          ctxReal.save();
          ctxReal.beginPath();
          ctxReal.rect(slot.x, slot.y, slot.width, slot.height);
          ctxReal.clip();

          const slotRatio = slot.width / slot.height;
          const imgRatio = img.width / img.height;

          let drawWidth, drawHeight, offsetX, offsetY;

          if(imgRatio > slotRatio){

            drawHeight = slot.height;
            drawWidth = img.width * (slot.height / img.height);

          }else{

            drawWidth = slot.width;
            drawHeight = img.height * (slot.width / img.width);

          }

          offsetX = slot.x - (drawWidth - slot.width)/2;
          offsetY = slot.y - (drawHeight - slot.height)/2;

          ctxReal.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);

          ctxReal.restore();

          updateCanvasView();

        }

        img.src = ev.target.result;

      }

      reader.readAsDataURL(file);

    }

    container.appendChild(preview);
    container.appendChild(label);
    container.appendChild(input);

    uploadArea.appendChild(container);

  });

}

function downloadBanner(){

  const link = document.createElement("a");
  link.download = "worldwebwindows.png";
  link.href = canvasReal.toDataURL();
  link.click();

}
