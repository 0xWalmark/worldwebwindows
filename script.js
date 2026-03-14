const canvasReal = document.getElementById("canvasReal");
const ctxReal = canvasReal.getContext("2d");

const canvasView = document.getElementById("canvasView");
const ctxView = canvasView.getContext("2d");

let greenSlots = [];
let bannerImage = new Image();

const uploadArea = document.getElementById("uploadArea");
const easterEggMsg = document.getElementById("easterEggMsg");

// Carica banner
function loadBanner(){
  let id = parseInt(document.getElementById("tokenId").value);

  // Easter Egg token 2401
  if(id === 2401){
    easterEggMsg.innerText = "World Web Windows are half the story.\nNext part coming for holders soon.";
    ctxReal.clearRect(0,0,canvasReal.width,canvasReal.height);
    ctxView.clearRect(0,0,canvasView.width,canvasView.height);
    uploadArea.innerHTML = "";
    return;
  } else {
    easterEggMsg.innerText = "";
  }

  if(isNaN(id) || id < 1 || id > 2400){
    alert("Token ID must be between 1 and 2400");
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

// Aggiorna canvas visuale scalato
function updateCanvasView(){
  const scale = Math.min(canvasView.parentElement.clientWidth / canvasReal.width, 1);
  canvasView.width = canvasReal.width * scale;
  canvasView.height = canvasReal.height * scale;
  ctxView.clearRect(0,0,canvasView.width,canvasView.height);
  ctxView.drawImage(canvasReal,0,0,canvasView.width,canvasView.height);
}

// Rileva quadrati verdi di qualsiasi altezza
function detectGreenSquares(){
  greenSlots = [];
  const data = ctxReal.getImageData(0,0,canvasReal.width,canvasReal.height).data;
  const visited = Array(canvasReal.height).fill(0).map(()=>Array(canvasReal.width).fill(false));

  for(let y=0; y<canvasReal.height; y++){
    for(let x=0; x<canvasReal.width; x++){
      if(visited[y][x]) continue;
      const idx = (y*canvasReal.width + x)*4;
      if(data[idx]===0 && data[idx+1]===255 && data[idx+2]===30){ // pixel verde
        // Determina larghezza e altezza del quadrato
        let width = 0;
        while(x+width < canvasReal.width){
          const widx = (y*canvasReal.width + (x+width))*4;
          if(data[widx]===0 && data[widx+1]===255 && data[widx+2]===30) width++;
          else break;
        }
        let height = 0;
        while(y+height < canvasReal.height){
          let fullRowGreen = true;
          for(let wx=0; wx<width; wx++){
            const hidx = ((y+height)*canvasReal.width + (x+wx))*4;
            if(!(data[hidx]===0 && data[hidx+1]===255 && data[hidx+2]===30)){
              fullRowGreen = false;
              break;
            }
          }
          if(fullRowGreen) height++;
          else break;
        }

        greenSlots.push({x, y, width, height});

        // Segna come visitati
        for(let dy=0; dy<height; dy++){
          for(let dx=0; dx<width; dx++){
            visited[y+dy][x+dx] = true;
          }
        }
      }
    }
  }

  // Ordina slot per x crescente, poi y crescente
  greenSlots.sort((a,b)=>{
    if(a.x !== b.x) return a.x - b.x;
    return a.y - b.y;
  });

  createUploadInputs();
}

// Crea pulsanti upload + anteprime
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
          // Clipping: tutto disegnato rimane nel rettangolo dello slot
          ctxReal.save();
          ctxReal.beginPath();
          ctxReal.rect(slot.x, slot.y, slot.width, slot.height);
          ctxReal.clip();

          // COVER SCALING: riempi slot senza deformare
          const slotRatio = slot.width / slot.height;
          const imgRatio = img.width / img.height;

          let drawWidth, drawHeight, offsetX, offsetY;

          if(imgRatio > slotRatio){
            drawHeight = slot.height;
            drawWidth = img.width * (slot.height / img.height);
          } else {
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

// Download banner reale
function downloadBanner(){
  const link = document.createElement("a");
  link.download = "worldwebwindows.png";
  link.href = canvasReal.toDataURL();
  link.click();
}
